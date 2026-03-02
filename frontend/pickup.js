import { useState } from "react";

const DeliveryForm = () => {
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call to Express/MongoDB backend
    // await axios.post('/api/orders', { method, ...formData });
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
  };

  const reset = () => {
    setMethod(null);
    setFormData({ name: "", phone: "", address: "", center: "", date: "", notes: "" });
    setSubmitted(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700&family=JetBrains+Mono:wght@400;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .df-root {
          min-height: 100vh;
          background: #0a0a0f;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          font-family: 'Sora', sans-serif;
          position: relative;
          overflow: hidden;
        }

        .df-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 50% at 20% 10%, rgba(255,160,50,0.12) 0%, transparent 70%),
            radial-gradient(ellipse 50% 40% at 80% 80%, rgba(255,80,120,0.10) 0%, transparent 70%);
          pointer-events: none;
        }

        .df-card {
          background: rgba(18,18,26,0.95);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          width: 100%;
          max-width: 520px;
          padding: 2.5rem;
          position: relative;
          backdrop-filter: blur(20px);
          box-shadow: 0 40px 80px rgba(0,0,0,0.6);
          animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .df-tag {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.15em;
          color: #ff9f2f;
          text-transform: uppercase;
          margin-bottom: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .df-tag::before {
          content: '';
          display: inline-block;
          width: 6px; height: 6px;
          background: #ff9f2f;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .df-title {
          font-size: 1.9rem;
          font-weight: 700;
          color: #fff;
          line-height: 1.15;
          margin-bottom: 0.4rem;
        }

        .df-subtitle {
          font-size: 0.85rem;
          color: rgba(255,255,255,0.4);
          margin-bottom: 2rem;
          font-weight: 300;
        }

        /* Method Toggle */
        .df-method-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
          margin-bottom: 2rem;
        }

        .df-method-btn {
          border: 1.5px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.03);
          border-radius: 14px;
          padding: 1.2rem 1rem;
          cursor: pointer;
          transition: all 0.25s ease;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .df-method-btn:hover {
          border-color: rgba(255,159,47,0.4);
          background: rgba(255,159,47,0.06);
        }

        .df-method-btn.active {
          border-color: #ff9f2f;
          background: rgba(255,159,47,0.12);
          box-shadow: 0 0 20px rgba(255,159,47,0.15);
        }

        .df-method-icon {
          font-size: 1.8rem;
          display: block;
          margin-bottom: 0.4rem;
        }

        .df-method-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: rgba(255,255,255,0.7);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .df-method-btn.active .df-method-label {
          color: #ff9f2f;
        }

        .df-method-check {
          position: absolute;
          top: 8px; right: 10px;
          font-size: 0.7rem;
          color: #ff9f2f;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .df-method-btn.active .df-method-check { opacity: 1; }

        /* Fields */
        .df-fields {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          animation: fadeIn 0.4s ease both;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .df-field {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .df-label {
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.45);
          font-family: 'JetBrains Mono', monospace;
        }

        .df-input, .df-select, .df-textarea {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 0.75rem 1rem;
          color: #fff;
          font-family: 'Sora', sans-serif;
          font-size: 0.9rem;
          width: 100%;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .df-input::placeholder, .df-textarea::placeholder { color: rgba(255,255,255,0.2); }
        .df-select option { background: #1a1a28; }

        .df-input:focus, .df-select:focus, .df-textarea:focus {
          border-color: #ff9f2f;
          box-shadow: 0 0 0 3px rgba(255,159,47,0.12);
        }

        .df-textarea { resize: vertical; min-height: 80px; }

        .df-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }

        /* Submit */
        .df-submit {
          margin-top: 1.5rem;
          width: 100%;
          padding: 1rem;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg, #ff9f2f, #ff5f7e);
          color: #fff;
          font-family: 'Sora', sans-serif;
          font-size: 0.95rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s;
          position: relative;
          overflow: hidden;
        }

        .df-submit:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .df-submit:active { transform: translateY(0); }
        .df-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        /* Success */
        .df-success {
          text-align: center;
          padding: 1.5rem 0;
          animation: fadeIn 0.5s ease both;
        }

        .df-success-icon {
          font-size: 3.5rem;
          margin-bottom: 1rem;
          display: block;
        }

        .df-success h2 {
          font-size: 1.4rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 0.5rem;
        }

        .df-success p {
          color: rgba(255,255,255,0.45);
          font-size: 0.85rem;
          margin-bottom: 1.5rem;
        }

        .df-reset {
          background: transparent;
          border: 1.5px solid rgba(255,255,255,0.15);
          border-radius: 10px;
          padding: 0.6rem 1.5rem;
          color: rgba(255,255,255,0.6);
          font-family: 'Sora', sans-serif;
          font-size: 0.85rem;
          cursor: pointer;
          transition: border-color 0.2s, color 0.2s;
        }

        .df-reset:hover { border-color: #ff9f2f; color: #ff9f2f; }

        /* Divider */
        .df-divider {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }
        .df-divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.08); }
        .df-divider-text { font-size: 0.7rem; color: rgba(255,255,255,0.3); letter-spacing: 0.1em; text-transform: uppercase; }
      `}</style>

      <div className="df-root">
        <div className="df-card">
          {submitted ? (
            <div className="df-success">
              <span className="df-success-icon">
                {method === "pickup" ? "🛍️" : "🏢"}
              </span>
              <h2>Order Confirmed!</h2>
              <p>
                {method === "pickup"
                  ? `We'll have your order ready for pickup on ${formData.date}.`
                  : `Your order will be ready at ${formData.center}.`}
              </p>
              <button className="df-reset" onClick={reset}>
                Place Another Order
              </button>
            </div>
          ) : (
            <>
              <div className="df-tag">Order Form</div>
              <h1 className="df-title">How would you<br />like to receive it?</h1>
              <p className="df-subtitle">Select a method and fill in your details below.</p>

              {/* Method Selection */}
              <div className="df-method-row">
                <button
                  type="button"
                  className={`df-method-btn ${method === "pickup" ? "active" : ""}`}
                  onClick={() => setMethod("pickup")}
                >
                  <span className="df-method-check">✓</span>
                  <span className="df-method-icon">🛍️</span>
                  <span className="df-method-label">Pickup</span>
                </button>
                <button
                  type="button"
                  className={`df-method-btn ${method === "center" ? "active" : ""}`}
                  onClick={() => setMethod("center")}
                >
                  <span className="df-method-check">✓</span>
                  <span className="df-method-icon">🏢</span>
                  <span className="df-method-label">Get Center</span>
                </button>
              </div>

              {/* Form Fields */}
              {method && (
                <form onSubmit={handleSubmit}>
                  <div className="df-divider">
                    <div className="df-divider-line" />
                    <span className="df-divider-text">
                      {method === "pickup" ? "Pickup Details" : "Center Details"}
                    </span>
                    <div className="df-divider-line" />
                  </div>

                  <div className="df-fields" key={method}>
                    <div className="df-row">
                      <div className="df-field">
                        <label className="df-label">Full Name</label>
                        <input
                          className="df-input"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      <div className="df-field">
                        <label className="df-label">Phone</label>
                        <input
                          className="df-input"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+1 000 000 0000"
                          required
                        />
                      </div>
                    </div>

                    {method === "pickup" && (
                      <div className="df-field">
                        <label className="df-label">Pickup Address</label>
                        <input
                          className="df-input"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          placeholder="Enter your address"
                          required
                        />
                      </div>
                    )}

                    {method === "center" && (
                      <div className="df-field">
                        <label className="df-label">Select Center</label>
                        <select
                          className="df-select"
                          name="center"
                          value={formData.center}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Choose a center...</option>
                          {centers.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="df-field">
                      <label className="df-label">
                        {method === "pickup" ? "Pickup Date & Time" : "Collection Date & Time"}
                      </label>
                      <input
                        className="df-input"
                        name="date"
                        type="datetime-local"
                        value={formData.date}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="df-field">
                      <label className="df-label">Notes (Optional)</label>
                      <textarea
                        className="df-textarea"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="Any special instructions..."
                      />
                    </div>

                    <button
                      type="submit"
                      className="df-submit"
                      disabled={loading}
                    >
                      {loading
                        ? "Processing..."
                        : method === "pickup"
                        ? "Confirm Pickup →"
                        : "Reserve at Center →"}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default DeliveryForm;