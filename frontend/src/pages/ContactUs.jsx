import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import API from "../services/api";

const initialForm = {
  fullName: "",
  email: "",
  phoneNumber: "",
  subject: "",
  inquiryType: "general",
  message: "",
};

const inquiryCards = [
  {
    key: "general",
    title: "General questions",
    description: "Platform guidance, onboarding help, and how SwapNest works.",
    icon: "forum",
    subject: "I have a question about SwapNest",
    prompt: "Tell us what you want to know and we will point you in the right direction.",
  },
  {
    key: "partnership",
    title: "Partnerships",
    description: "Collaborations, local hubs, campaigns, and community programs.",
    icon: "handshake",
    subject: "Partnership request for SwapNest",
    prompt: "Share your partnership idea, organization, and what you would like to build together.",
  },
  {
    key: "support",
    title: "Support requests",
    description: "Issues with listings, accounts, visibility, or swap coordination.",
    icon: "support_agent",
    subject: "I need help with my account or listing",
    prompt: "Describe the issue clearly, including any item, account, or swap details that matter.",
  },
];

const contactMethods = [
  {
    label: "Email us",
    value: "hello@swapnest.lk",
    note: "Best for detailed questions",
    icon: "mail",
  },
  {
    label: "Response time",
    value: "1 to 5 business days",
    note: "Usually faster on weekdays",
    icon: "schedule",
  },
  {
    label: "Coverage",
    value: "All Sri Lanka",
    note: "Support for listings and swaps",
    icon: "public",
  },
];

const ContactUs = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeCard, setActiveCard] = useState("general");
  const [focusedField, setFocusedField] = useState("");

  const activeInquiry =
    inquiryCards.find((card) => card.key === activeCard) || inquiryCards[0];

  const completionCount = useMemo(() => {
    const fields = [
      form.fullName,
      form.email,
      form.subject,
      form.inquiryType,
      form.message,
    ];

    return fields.filter((value) => String(value || "").trim()).length;
  }, [form]);

  const messageTone = useMemo(() => {
    const length = form.message.trim().length;

    if (length >= 140) return "Detailed";
    if (length >= 50) return "Clear";
    return "Brief";
  }, [form.message]);

  const previewTitle = form.subject.trim() || activeInquiry.subject;
  const previewMessage =
    form.message.trim() || "Your message preview will appear here as you type.";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const selectInquiry = (card) => {
    setActiveCard(card.key);
    setForm((current) => ({
      ...current,
      inquiryType: card.key,
      subject: current.subject.trim() ? current.subject : card.subject,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await API.post("/contact", form);
      setSuccess(response.data.message || "Your message has been sent.");
      setForm(initialForm);
      setActiveCard("general");
      navigate("/");
    } catch (submitError) {
      setError(
        submitError.response?.data?.message ||
          "We could not send your message right now."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background text-on-surface font-body antialiased selection:bg-secondary-container selection:text-white">
      <Header />

      <main className="pt-24">
        <section className="relative overflow-hidden px-6 py-14 md:px-16 md:py-20">
          <div className="pointer-events-none absolute left-[-8rem] top-[-6rem] h-[24rem] w-[24rem] rounded-full bg-primary-fixed/35 blur-3xl" />
          <div className="pointer-events-none absolute bottom-[-8rem] right-[-4rem] h-[22rem] w-[22rem] rounded-full bg-secondary-container/15 blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl gap-8 xl:grid-cols-[1fr_0.94fr]">
            <section className="overflow-hidden rounded-[2.8rem] bg-[linear-gradient(145deg,#012d1d_0%,#073d28_58%,#184633_100%)] p-8 text-white shadow-[0_30px_90px_rgba(1,45,29,0.28)] md:p-10">
              <div className="relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-sm md:p-8">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(193,236,212,0.14),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(254,126,79,0.12),_transparent_28%)]" />

                <div className="relative z-10">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.28em] text-primary-fixed-dim">
                    <span className="h-2 w-2 rounded-full bg-secondary-container" />
                    Contact SwapNest
                  </span>

                  <h1 className="mt-6 max-w-2xl font-headline text-5xl font-extrabold leading-[0.95] tracking-tight md:text-7xl">
                    Let&apos;s build your next swap connection.
                  </h1>

                  <p className="mt-6 max-w-2xl text-lg leading-relaxed text-on-primary-container md:text-xl">
                    Reach out for support, listings, partnerships, or product
                    questions. Your message is saved and routed so the right team
                    can respond fast.
                  </p>

                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <div className="rounded-full border border-white/10 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary-fixed-dim">
                      Human support
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary-fixed-dim">
                      Secure submission
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary-fixed-dim">
                      Sri Lanka wide
                    </div>
                    <div className="rounded-full border border-[#d8c4a3]/25 bg-[#f3c37d]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#f7d8a4]">
                      {messageTone} request
                    </div>
                  </div>

                  <div className="mt-10">
                    <div className="rounded-[1.9rem] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#f7d8a4]">
                          Quick overview
                        </p>
                        <p className="mt-3 max-w-xl text-3xl font-black leading-tight tracking-tight text-white">
                          Friendly support for every swap journey.
                        </p>
                        <p className="mt-4 max-w-2xl text-base leading-8 text-on-primary-container">
                          Contact us for help with your account, listings,
                          partnerships, or general questions. We keep things simple,
                          personal, and easy to follow.
                        </p>
                      </div>

                      <div className="mt-6 space-y-3">
                        {contactMethods.map((method) => (
                          <div
                            key={method.label}
                            className="flex items-start gap-4 rounded-[1.35rem] border border-white/10 bg-black/10 px-4 py-4"
                          >
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                              <span className="material-symbols-outlined text-white">
                                {method.icon}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-primary-fixed-dim">
                                {method.label}
                              </p>
                              <p className="mt-2 text-xl font-bold leading-tight text-white">
                                {method.value}
                              </p>
                              <p className="mt-2 text-sm leading-6 text-on-primary-container">
                                {method.note}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-[2.8rem] border border-outline-variant/25 bg-white/90 shadow-[0_24px_70px_rgba(9,26,20,0.12)] backdrop-blur-xl">
              <div className="border-b border-outline-variant/20 px-6 py-6 md:px-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-[0.28em] text-secondary">
                      Send a message
                    </span>
                    <h2 className="mt-3 font-headline text-4xl font-extrabold tracking-tight text-primary">
                      Contact form
                    </h2>
                    <p className="mt-3 max-w-xl text-base leading-relaxed text-on-surface-variant">
                      Choose your intent first, then fill in the details so we can
                      route it correctly.
                    </p>
                  </div>

                  <div className="min-w-[180px] rounded-[1.5rem] border border-outline-variant/35 bg-surface-container-low p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-secondary">
                      Form progress
                    </p>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-outline-variant/30">
                      <div
                        className="h-full rounded-full bg-secondary transition-all duration-500"
                        style={{ width: `${(completionCount / 5) * 100}%` }}
                      />
                    </div>
                    <p className="mt-3 text-sm font-medium text-primary">
                      {completionCount} of 5 key fields completed
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-6 md:px-8 md:py-8">
                <div className="grid gap-3 md:grid-cols-3">
                  {inquiryCards.map((card) => {
                    const isActive = activeCard === card.key;

                    return (
                      <button
                        key={card.key}
                        type="button"
                        onMouseEnter={() => setActiveCard(card.key)}
                        onFocus={() => setActiveCard(card.key)}
                        onClick={() => selectInquiry(card)}
                        className={`group rounded-[1.8rem] border p-4 text-left transition-all duration-300 ${
                          isActive
                            ? "border-primary bg-primary text-white shadow-[0_18px_30px_rgba(1,45,29,0.18)]"
                            : "border-outline-variant/35 bg-surface-container-low text-primary hover:border-primary/20 hover:-translate-y-1 hover:bg-surface"
                        }`}
                      >
                        <div
                          className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                            isActive ? "bg-white/10" : "bg-background"
                          }`}
                        >
                          <span className="material-symbols-outlined">
                            {card.icon}
                          </span>
                        </div>
                        <h3 className="mt-4 text-lg font-bold">{card.title}</h3>
                        <p
                          className={`mt-2 text-sm leading-relaxed ${
                            isActive ? "text-white/80" : "text-on-surface-variant"
                          }`}
                        >
                          {card.description}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-5 rounded-[1.8rem] border border-outline-variant/30 bg-surface-container-low px-5 py-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-secondary">
                    Active request flow
                  </p>
                  <p className="mt-2 text-lg font-bold text-primary">
                    {activeInquiry.title}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">
                    {activeInquiry.prompt}
                  </p>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <div className="rounded-[1.5rem] border border-outline-variant/25 bg-background px-4 py-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-secondary">
                      Selected path
                    </p>
                    <p className="mt-2 text-sm font-semibold text-primary">
                      {activeInquiry.title}
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] border border-outline-variant/25 bg-background px-4 py-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-secondary">
                      Message tone
                    </p>
                    <p className="mt-2 text-sm font-semibold text-primary">
                      {messageTone}
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] border border-outline-variant/25 bg-background px-4 py-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-secondary">
                      Focused field
                    </p>
                    <p className="mt-2 text-sm font-semibold text-primary">
                      {focusedField || "None"}
                    </p>
                  </div>
                </div>

                <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                  <div className="grid gap-5 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-primary">
                        Full Name
                      </span>
                      <input
                        className="w-full rounded-[1.35rem] border border-outline-variant/35 bg-background px-4 py-3.5 outline-none transition focus:border-secondary focus:bg-white focus:shadow-[0_0_0_4px_rgba(254,126,79,0.12)]"
                        name="fullName"
                        value={form.fullName}
                        onChange={handleChange}
                        onFocus={() => setFocusedField("Full Name")}
                        onBlur={() => setFocusedField("")}
                        placeholder="Your full name"
                        required
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-primary">
                        Email Address
                      </span>
                      <input
                        className="w-full rounded-[1.35rem] border border-outline-variant/35 bg-background px-4 py-3.5 outline-none transition focus:border-secondary focus:bg-white focus:shadow-[0_0_0_4px_rgba(254,126,79,0.12)]"
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        onFocus={() => setFocusedField("Email Address")}
                        onBlur={() => setFocusedField("")}
                        placeholder="you@example.com"
                        required
                      />
                    </label>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-primary">
                        Phone Number
                      </span>
                      <input
                        className="w-full rounded-[1.35rem] border border-outline-variant/35 bg-background px-4 py-3.5 outline-none transition focus:border-secondary focus:bg-white focus:shadow-[0_0_0_4px_rgba(254,126,79,0.12)]"
                        name="phoneNumber"
                        value={form.phoneNumber}
                        onChange={handleChange}
                        onFocus={() => setFocusedField("Phone Number")}
                        onBlur={() => setFocusedField("")}
                        placeholder="Optional"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-primary">
                        Inquiry Type
                      </span>
                      <select
                        className="w-full rounded-[1.35rem] border border-outline-variant/35 bg-background px-4 py-3.5 outline-none transition focus:border-secondary focus:bg-white focus:shadow-[0_0_0_4px_rgba(254,126,79,0.12)]"
                        name="inquiryType"
                        value={form.inquiryType}
                        onChange={handleChange}
                        onFocus={() => setFocusedField("Inquiry Type")}
                        onBlur={() => setFocusedField("")}
                        required
                      >
                        <option value="general">General Inquiry</option>
                        <option value="support">Support</option>
                        <option value="partnership">Partnership</option>
                        <option value="listing">Item Listing</option>
                        <option value="report">Report an Issue</option>
                        <option value="other">Other</option>
                      </select>
                    </label>
                  </div>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-primary">
                      Subject
                    </span>
                    <input
                      className="w-full rounded-[1.35rem] border border-outline-variant/35 bg-background px-4 py-3.5 outline-none transition focus:border-secondary focus:bg-white focus:shadow-[0_0_0_4px_rgba(254,126,79,0.12)]"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("Subject")}
                      onBlur={() => setFocusedField("")}
                      placeholder={activeInquiry.subject}
                      required
                    />
                  </label>

                  <label className="block">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="block text-sm font-semibold text-primary">
                        Message
                      </span>
                      <span className="text-xs font-medium text-on-surface-variant">
                        {form.message.length} characters
                      </span>
                    </div>
                    <textarea
                      className="min-h-44 w-full rounded-[1.6rem] border border-outline-variant/35 bg-background px-4 py-3.5 outline-none transition focus:border-secondary focus:bg-white focus:shadow-[0_0_0_4px_rgba(254,126,79,0.12)]"
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("Message")}
                      onBlur={() => setFocusedField("")}
                      placeholder={activeInquiry.prompt}
                      required
                    />
                  </label>

                  {error ? (
                    <div className="rounded-[1.35rem] border border-error/10 bg-error-container px-4 py-3 text-sm text-on-error-container">
                      {error}
                    </div>
                  ) : null}

                  {success ? (
                    <div className="rounded-[1.35rem] border border-primary/10 bg-primary-fixed/60 px-4 py-3 text-sm text-on-primary-fixed">
                      {success}
                    </div>
                  ) : null}

                  <div className="flex flex-col gap-4 border-t border-outline-variant/20 pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="max-w-sm text-sm leading-relaxed text-on-surface-variant">
                      By submitting, your message is stored securely so our team
                      can review and reply.
                    </p>

                    <button
                      className="inline-flex items-center justify-center gap-3 rounded-full bg-secondary px-7 py-4 font-headline text-base font-bold text-on-secondary shadow-lg shadow-secondary/20 transition hover:scale-[1.01] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
                      type="submit"
                      disabled={isSubmitting}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        send
                      </span>
                      {isSubmitting ? "Sending..." : "Submit Message"}
                    </button>
                  </div>
                </form>
              </div>
            </section>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ContactUs;
