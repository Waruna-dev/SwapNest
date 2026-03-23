import { useState } from "react";

export default function DeliveryForm() {
  const [method, setMethod] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    center: "",
    date: "",
    notes: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const centers = [
    "Downtown Center — 123 Main St",
    "Westside Hub — 456 West Ave",
    "Eastside Branch — 789 East Blvd",
    "Northgate Point — 321 North Rd",
  ];

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  };

  const reset = () => {
    setMethod(null);
    setFormData({
      name: "",
      phone: "",
      address: "",
      center: "",
      date: "",
      notes: "",
    });
    setSubmitted(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-blue-50">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8">

        {/* SUCCESS */}
        {submitted ? (
          <div className="text-center">
            <div className="text-5xl mb-4">
              {method === "pickup" ? "🛍️" : "🏢"}
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              Order Confirmed!
            </h2>
            <p className="text-sm text-gray-500 mt-2 mb-6">
              {method === "pickup"
                ? `Pickup on ${formData.date}`
                : `Ready at ${formData.center}`}
            </p>

            <button
              onClick={reset}
              className="border border-blue-400 text-blue-600 px-5 py-2 rounded-lg hover:bg-blue-50"
            >
              Place Another Order
            </button>
          </div>
        ) : (
          <>
            {/* TITLE */}
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              How would you receive it?
            </h1>
            <p className="text-sm text-gray-500 mb-6">
              Choose a method and fill details
            </p>

            {/* METHOD */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { key: "pickup", label: "Pickup", icon: "🛍️" },
                { key: "center", label: "Center", icon: "🏢" },
              ].map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setMethod(m.key)}
                  className={`border rounded-xl p-4 text-center transition ${
                    method === m.key
                      ? "border-blue-500 bg-blue-100"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <div className="text-2xl">{m.icon}</div>
                  <div className="text-sm font-semibold mt-1">
                    {m.label}
                  </div>
                </button>
              ))}
            </div>

            {/* FORM */}
            {method && (
              <form onSubmit={onSubmit} className="space-y-4">

                {/* NAME + PHONE */}
                <div className="grid grid-cols-2 gap-3">
                  <input
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={onChange}
                    required
                    className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-400"
                  />
                  <input
                    name="phone"
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={onChange}
                    required
                    className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                {/* ADDRESS */}
                {method === "pickup" && (
                  <input
                    name="address"
                    placeholder="Address"
                    value={formData.address}
                    onChange={onChange}
                    required
                    className="border p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400"
                  />
                )}

                {/* CENTER */}
                {method === "center" && (
                  <select
                    name="center"
                    value={formData.center}
                    onChange={onChange}
                    required
                    className="border p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">Select Center</option>
                    {centers.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                )}

                {/* DATE */}
                <input
                  type="datetime-local"
                  name="date"
                  value={formData.date}
                  onChange={onChange}
                  required
                  className="border p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400"
                />

                {/* NOTES */}
                <textarea
                  name="notes"
                  placeholder="Notes (optional)"
                  value={formData.notes}
                  onChange={onChange}
                  className="border p-2 rounded-lg w-full"
                />

                {/* SUBMIT */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading
                    ? "Processing..."
                    : method === "pickup"
                    ? "Confirm Pickup"
                    : "Reserve Center"}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}