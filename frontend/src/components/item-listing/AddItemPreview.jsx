const AddItemPreview = ({
  formData,
  imagePreviews = [],
  images = [],
  isSubmitting,
}) => {
  const isSwapOnly = formData.mode === "Swap";
  const hasHeroImage = Boolean(imagePreviews?.[0]);

  const heroImage = hasHeroImage
    ? imagePreviews[0].url
    : "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80";

  return (
    <section className="relative overflow-hidden rounded-[34px] border border-white/40 bg-white/30 shadow-[0_20px_70px_rgba(15,23,42,0.15)] backdrop-blur-xl">
      {/* Soft blurred background */}
      className="relative overflow-hidden rounded-[34px] border-2
      border-emerald-400 bg-white/30 shadow-[0_20px_70px_rgba(16,185,129,0.25)]
      backdrop-blur-xl"
      <div
        className="absolute inset-0 bg-cover bg-center scale-110"
        style={{ backgroundImage: `url('${heroImage}')` }}
      />
      <div className="absolute inset-0 bg-white/72 backdrop-blur-[12px]" />
      <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-slate-50/75 to-emerald-50/55" />
      <div className="relative z-10 p-5 md:p-7 lg:p-8">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center rounded-full border border-white/60 bg-white/55 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-700 shadow-sm backdrop-blur-md">
              Live Item Preview
            </span>

            <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 md:text-4xl">
              {formData.title || "Your item title appears here"}
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
              Modern preview with a clear image section, readable description,
              and a clean details layout.
            </p>
          </div>

          <div className="flex gap-3">
            <div className="rounded-2xl border border-white/60 bg-white/50 px-4 py-3 shadow-sm backdrop-blur-md">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                Images
              </p>
              <p className="mt-1 text-lg font-bold text-slate-900">
                {images.length}/5
              </p>
            </div>

            <div className="rounded-2xl border border-white/60 bg-white/50 px-4 py-3 shadow-sm backdrop-blur-md">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                Mode
              </p>
              <p className="mt-1 text-lg font-bold text-slate-900">
                {formData.mode || "Sell"}
              </p>
            </div>
          </div>
        </div>

        {/* Main vertical layout */}
        <div className="space-y-5">
          {/* TOP: Main image */}
          <div className="overflow-hidden rounded-[30px] border border-white/50 bg-white/35 shadow-[0_18px_40px_rgba(15,23,42,0.12)] backdrop-blur-xl">
            <div className="relative h-[280px] md:h-[380px] lg:h-[430px]">
              {hasHeroImage ? (
                <img
                  src={imagePreviews[0].url}
                  alt={imagePreviews[0].name || "Item image"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300">
                  <div className="text-center text-slate-700">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/80 text-3xl shadow-lg">
                      🖼️
                    </div>
                    <p className="text-lg font-semibold">Add item image</p>
                    <p className="mt-1 text-sm text-slate-500">
                      The first uploaded image will appear here as the main
                      preview
                    </p>
                  </div>
                </div>
              )}

              <div className="absolute left-4 top-4 rounded-full border border-white/40 bg-white/35 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-800 shadow-md backdrop-blur-md">
                Main Preview
              </div>

              <div className="absolute bottom-4 left-4 right-4 rounded-[24px] border border-white/40 bg-white/35 p-4 shadow-lg backdrop-blur-xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-600">
                  Category
                </p>

                <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-lg font-bold text-slate-900 md:text-2xl">
                    {formData.category || "Select category"}
                  </h3>

                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {formData.condition || "Condition"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="rounded-[30px] border border-white/50 bg-white/35 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.10)] backdrop-blur-xl md:p-6">
            <div className="rounded-[24px] border border-white/60 bg-white/70 p-5 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">
                Description
              </p>

              <p className="mt-4 whitespace-pre-line break-words text-sm leading-7 text-slate-700 md:text-[15px]">
                {formData.description ||
                  "Write a clear description about your item. Include condition, features, usage, and value."}
              </p>
            </div>

            {/* OTHER DETAILS */}
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/55 px-4 py-4 shadow-sm">
                <span className="text-slate-600">Price</span>
                <span className="font-semibold text-slate-900">
                  {isSwapOnly
                    ? "Not required"
                    : formData.price
                      ? `$${formData.price}`
                      : "Negotiable"}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/55 px-4 py-4 shadow-sm">
                <span className="text-slate-600">Condition</span>
                <span className="font-semibold text-slate-900">
                  {formData.condition || "Not specified"}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/55 px-4 py-4 shadow-sm">
                <span className="text-slate-600">Contact</span>
                <span className="max-w-[150px] truncate text-right font-semibold text-slate-900">
                  {formData.contact || "Add contact"}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/55 px-4 py-4 shadow-sm">
                <span className="text-slate-600">Location</span>
                <span className="max-w-[150px] truncate text-right font-semibold text-slate-900">
                  {formData.location || "Select location"}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/55 px-4 py-4 shadow-sm">
                <span className="text-slate-600">Mode</span>
                <span className="font-semibold text-slate-900">
                  {formData.mode || "Sell"}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/55 px-4 py-4 shadow-sm">
                <span className="text-slate-600">Status</span>
                <span
                  className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.15em] ${
                    isSubmitting
                      ? "bg-amber-100 text-amber-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {isSubmitting ? "Saving" : "Draft"}
                </span>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white/40 p-4 text-sm text-slate-600">
              This preview shows the first uploaded image at the top, the full
              description below it, and the other item details in a clean grid.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AddItemPreview;
