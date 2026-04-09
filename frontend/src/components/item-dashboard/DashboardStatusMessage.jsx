function DashboardStatusMessage({ status }) {
  if (!status.message) return null;

  // Map status type → theme styles
  const statusStyles = {
    success:
      "border-primary-container bg-primary-fixed text-on-primary-fixed-variant",
    error: "border-error bg-error-container text-on-error-container",
    warning:
      "border-secondary bg-secondary-fixed text-on-secondary-fixed-variant",
    info: "border-outline-variant bg-surface-container text-on-surface",
  };

  return (
    <div
      className={`mt-5 rounded-xl px-4 py-3 text-sm font-medium border ${
        statusStyles[status.type] || statusStyles.info
      }`}
    >
      {status.message}
    </div>
  );
}

export default DashboardStatusMessage;
