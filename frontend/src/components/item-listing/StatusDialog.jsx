const dialogConfig = {
  success: {
    accent: "bg-emerald-500/20 text-emerald-300",
    icon: "check",
    panel:
      "border-emerald-500/20 bg-[#1d2737] text-white shadow-[0_30px_90px_-35px_rgba(16,185,129,0.35)]",
    message: "text-slate-300",
    button: "bg-[#635bff] text-white hover:bg-[#726bff]",
  },
  error: {
    accent: "bg-rose-500/20 text-rose-300",
    icon: "close",
    panel:
      "border-rose-500/20 bg-[#1d2737] text-white shadow-[0_30px_90px_-35px_rgba(244,63,94,0.35)]",
    message: "text-slate-300",
    button: "bg-[#635bff] text-white hover:bg-[#726bff]",
  },
};

function StatusDialog({
  open,
  type = "error",
  title,
  message,
  actionLabel = "Close",
  onAction,
}) {
  if (!open) return null;

  const tone = dialogConfig[type] || dialogConfig.error;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#07111f]/78 px-4 py-6 backdrop-blur-sm">
      <div
        className={`w-full max-w-xl rounded-[22px] border px-7 py-8 text-center ${tone.panel}`}
      >
        <div
          className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${tone.accent}`}
        >
          <span className="material-symbols-outlined text-4xl">
            {tone.icon}
          </span>
        </div>

        <h2 className="mt-7 text-3xl font-bold tracking-tight">{title}</h2>
        <p className={`mx-auto mt-4 max-w-md text-lg leading-8 ${tone.message}`}>
          {message}
        </p>

        <button
          type="button"
          onClick={onAction}
          className={`mt-8 inline-flex w-full items-center justify-center rounded-xl px-6 py-4 text-lg font-semibold transition ${tone.button}`}
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}

export default StatusDialog;
