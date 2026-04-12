import process from "process";
import { performance } from "perf_hooks";

const defaultConfig = {
  baseUrl: "http://127.0.0.1:5000",
  durationSec: 20,
  warmupSec: 3,
  concurrency: 20,
  timeoutMs: 8000,
  targets: ["/", "/api/items", "/api/centers"],
};

function parseArgs(argv) {
  const args = {};

  for (const arg of argv) {
    if (!arg.startsWith("--")) continue;
    const [rawKey, rawValue] = arg.slice(2).split("=");
    if (!rawKey) continue;
    args[rawKey] = rawValue ?? "true";
  }

  return args;
}

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function percentile(sortedValues, p) {
  if (!sortedValues.length) return 0;
  const rank = Math.ceil((p / 100) * sortedValues.length) - 1;
  const index = Math.min(sortedValues.length - 1, Math.max(0, rank));
  return sortedValues[index];
}

function formatMs(ms) {
  return `${ms.toFixed(2)} ms`;
}

function normalizeUrl(baseUrl, targetPath) {
  const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = targetPath.startsWith("/") ? targetPath : `/${targetPath}`;
  return `${cleanBase}${cleanPath}`;
}

function makeConfig() {
  const args = parseArgs(process.argv.slice(2));

  const targetsRaw = args.targets ?? process.env.PERF_TARGETS;
  const targets = targetsRaw
    ? targetsRaw
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : defaultConfig.targets;

  return {
    baseUrl: args.baseUrl ?? process.env.PERF_BASE_URL ?? defaultConfig.baseUrl,
    durationSec: toNumber(
      args.duration ?? process.env.PERF_DURATION_SEC,
      defaultConfig.durationSec
    ),
    warmupSec: toNumber(
      args.warmup ?? process.env.PERF_WARMUP_SEC,
      defaultConfig.warmupSec
    ),
    concurrency: Math.floor(
      toNumber(
        args.concurrency ?? process.env.PERF_CONCURRENCY,
        defaultConfig.concurrency
      )
    ),
    timeoutMs: Math.floor(
      toNumber(args.timeout ?? process.env.PERF_TIMEOUT_MS, defaultConfig.timeoutMs)
    ),
    targets,
  };
}

function printConfig(config) {
  console.log("Performance test configuration");
  console.log(`- Base URL:      ${config.baseUrl}`);
  console.log(`- Duration:      ${config.durationSec}s`);
  console.log(`- Warmup:        ${config.warmupSec}s`);
  console.log(`- Concurrency:   ${config.concurrency}`);
  console.log(`- Timeout:       ${config.timeoutMs}ms`);
  console.log(`- Targets:       ${config.targets.join(", ")}`);
  console.log("");
}

async function preflight(config) {
  console.log("Preflight checks");
  for (const path of config.targets) {
    const url = normalizeUrl(config.baseUrl, path);
    try {
      const started = performance.now();
      const response = await fetch(url, {
        method: "GET",
        signal: AbortSignal.timeout(config.timeoutMs),
      });
      const ended = performance.now();
      console.log(
        `- ${path} -> ${response.status} (${(ended - started).toFixed(2)} ms)`
      );
    } catch (error) {
      console.log(`- ${path} -> ERROR (${error.message})`);
    }
  }
  console.log("");
}

function initEndpointStats(targets) {
  const endpointStats = new Map();
  for (const target of targets) {
    endpointStats.set(target, {
      count: 0,
      ok: 0,
      non2xx: 0,
      errors: 0,
      latencyMs: [],
    });
  }
  return endpointStats;
}

async function runLoad(config) {
  const stopAt = Date.now() + config.durationSec * 1000;
  const allLatencies = [];
  const statusCounts = new Map();
  const endpointStats = initEndpointStats(config.targets);
  let total = 0;
  let ok = 0;
  let non2xx = 0;
  let errors = 0;
  let rrIndex = 0;

  const requestOnce = async (targetPath) => {
    const url = normalizeUrl(config.baseUrl, targetPath);
    const started = performance.now();
    try {
      const response = await fetch(url, {
        method: "GET",
        signal: AbortSignal.timeout(config.timeoutMs),
      });
      await response.arrayBuffer();
      const ended = performance.now();
      const elapsed = ended - started;

      total += 1;
      allLatencies.push(elapsed);

      const endpoint = endpointStats.get(targetPath);
      endpoint.count += 1;
      endpoint.latencyMs.push(elapsed);

      if (response.ok) {
        ok += 1;
        endpoint.ok += 1;
      } else {
        non2xx += 1;
        endpoint.non2xx += 1;
      }

      const statusKey = String(response.status);
      statusCounts.set(statusKey, (statusCounts.get(statusKey) ?? 0) + 1);
    } catch {
      const ended = performance.now();
      const elapsed = ended - started;

      total += 1;
      errors += 1;
      allLatencies.push(elapsed);

      const endpoint = endpointStats.get(targetPath);
      endpoint.count += 1;
      endpoint.errors += 1;
      endpoint.latencyMs.push(elapsed);
    }
  };

  const worker = async () => {
    while (Date.now() < stopAt) {
      const target = config.targets[rrIndex % config.targets.length];
      rrIndex += 1;
      await requestOnce(target);
    }
  };

  const workers = Array.from({ length: config.concurrency }, () => worker());
  await Promise.all(workers);

  return { total, ok, non2xx, errors, allLatencies, statusCounts, endpointStats };
}

function printSummary(config, stats) {
  const sorted = [...stats.allLatencies].sort((a, b) => a - b);
  const min = sorted[0] ?? 0;
  const max = sorted[sorted.length - 1] ?? 0;
  const avg = sorted.length
    ? sorted.reduce((sum, item) => sum + item, 0) / sorted.length
    : 0;
  const p50 = percentile(sorted, 50);
  const p95 = percentile(sorted, 95);
  const p99 = percentile(sorted, 99);
  const successRate = stats.total ? (stats.ok / stats.total) * 100 : 0;
  const errorRate = stats.total ? (stats.errors / stats.total) * 100 : 0;
  const throughput = stats.total / config.durationSec;

  console.log("Results");
  console.log(`- Requests sent:       ${stats.total}`);
  console.log(`- 2xx responses:       ${stats.ok}`);
  console.log(`- Non-2xx responses:   ${stats.non2xx}`);
  console.log(`- Request errors:      ${stats.errors}`);
  console.log(`- Success rate:        ${successRate.toFixed(2)}%`);
  console.log(`- Error rate:          ${errorRate.toFixed(2)}%`);
  console.log(`- Throughput:          ${throughput.toFixed(2)} req/s`);
  console.log(`- Latency (min/avg):   ${formatMs(min)} / ${formatMs(avg)}`);
  console.log(`- Latency (p50):       ${formatMs(p50)}`);
  console.log(`- Latency (p95):       ${formatMs(p95)}`);
  console.log(`- Latency (p99):       ${formatMs(p99)}`);
  console.log(`- Latency (max):       ${formatMs(max)}`);
  console.log("");

  console.log("Status code distribution");
  if (stats.statusCounts.size === 0) {
    console.log("- No HTTP responses captured");
  } else {
    const ordered = [...stats.statusCounts.entries()].sort((a, b) =>
      Number(a[0]) - Number(b[0])
    );
    for (const [status, count] of ordered) {
      console.log(`- ${status}: ${count}`);
    }
  }
  console.log("");

  console.log("Per-endpoint summary");
  for (const [endpoint, endpointStat] of stats.endpointStats.entries()) {
    const latSorted = [...endpointStat.latencyMs].sort((a, b) => a - b);
    const latAvg = latSorted.length
      ? latSorted.reduce((sum, item) => sum + item, 0) / latSorted.length
      : 0;
    const latP95 = percentile(latSorted, 95);
    console.log(
      `- ${endpoint} -> count=${endpointStat.count}, ok=${endpointStat.ok}, non2xx=${endpointStat.non2xx}, errors=${endpointStat.errors}, avg=${formatMs(latAvg)}, p95=${formatMs(latP95)}`
    );
  }
}

async function main() {
  const config = makeConfig();
  if (!config.targets.length) {
    console.error("No targets configured. Use --targets=/,/api/items");
    process.exit(1);
  }

  printConfig(config);
  await preflight(config);

  if (config.warmupSec > 0) {
    console.log(`Warming up for ${config.warmupSec}s...`);
    const warmupConfig = { ...config, durationSec: config.warmupSec };
    await runLoad(warmupConfig);
    console.log("Warmup complete\n");
  }

  console.log(`Running load test for ${config.durationSec}s...`);
  const stats = await runLoad(config);
  printSummary(config, stats);
}

main().catch((error) => {
  console.error("Performance test failed:", error);
  process.exit(1);
});
