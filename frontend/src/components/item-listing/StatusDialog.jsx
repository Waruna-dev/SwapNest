const dialogConfig = {
  success: {
    accent: "bg-[#dff4ea] text-[#295848]",
    icon: "check",
    panel:
      "border-[#0a3327]/10 bg-[rgba(255,252,247,0.96)] text-[#0a3327] shadow-[0_32px_85px_-38px_rgba(10,51,39,0.42)]",
    message: "text-[#0a3327]/65",
    button:
      "bg-[#b14716] text-white shadow-[0_22px_45px_-20px_rgba(177,71,22,0.92)] hover:bg-[#9b3f14]",
  },
  error: {
    accent: "bg-[#ffe9e5] text-[#b14716]",
    icon: "close",
    panel:
      "border-[#b14716]/12 bg-[rgba(255,252,247,0.96)] text-[#0a3327] shadow-[0_32px_85px_-38px_rgba(177,71,22,0.28)]",
    message: "text-[#0a3327]/65",
    button:
      "bg-[#0a3327] text-white shadow-[0_22px_45px_-20px_rgba(10,51,39,0.72)] hover:bg-[#08291f]",
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
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[rgba(10,51,39,0.32)] px-4 py-6 backdrop-blur-md">
      <div
        className={`w-full max-w-xl rounded-[30px] border px-7 py-8 text-center ${tone.panel}`}
      >
        <div
          className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full shadow-[0_18px_40px_-22px_rgba(10,51,39,0.45)] ${tone.accent}`}
        >
          <span className="material-symbols-outlined text-4xl">
            {tone.icon}
          </span>
        </div>

        <h2 className="mt-7 font-headline text-4xl font-extrabold tracking-tight">
          {title}
        </h2>
        <p className={`mx-auto mt-4 max-w-md text-lg leading-8 ${tone.message}`}>
          {message}
        </p>

        <button
          type="button"
          onClick={onAction}
          className={`mt-8 inline-flex h-16 w-full items-center justify-center rounded-full px-6 text-lg font-semibold transition ${tone.button}`}
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}

export default StatusDialog;
