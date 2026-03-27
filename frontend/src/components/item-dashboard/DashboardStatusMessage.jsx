function DashboardStatusMessage({ status, statusTone }) {
  if (!status.message) return null;

  return (
    <div
      className={`mt-5 rounded-2xl border px-4 py-3 text-sm font-medium ${statusTone(status.type)}`}
    >
      {status.message}
    </div>
  );
}

export default DashboardStatusMessage;
