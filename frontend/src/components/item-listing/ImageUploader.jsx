const ImageUploader = ({ imagePreviews, handleImageChange, removeImage }) => {
  return (
    <div className="space-y-2 md:col-span-2">
      <div className="flex items-center justify-between">
        <label className="ml-1 text-[11px] font-bold uppercase tracking-[0.28em] text-[#0a3327]/55">
          Gallery Images
        </label>
        <span className="text-xs font-semibold text-[#0a3327]/45">
          Up to 5 images
        </span>
      </div>

      <label className="flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-[28px] border border-dashed border-[#0a3327]/18 bg-[#efe6db] px-6 py-8 text-center transition hover:border-[#b14716]/35 hover:bg-[#ede3d7]">
        <span className="font-headline text-2xl font-bold text-[#0a3327]">
          Drop visuals here or browse files
        </span>

        <span className="mt-3 max-w-md text-sm leading-6 text-[#0a3327]/62">
          The backend expects multipart form-data with images, so these uploads
          are ready for your Item API.
        </span>

        <span className="mt-5 rounded-full bg-[#b14716] px-5 py-3 text-sm font-bold text-white shadow-[0_18px_35px_-18px_rgba(177,71,22,0.9)]">
          Select Images
        </span>

        <input
          multiple
          accept="image/*"
          className="hidden"
          type="file"
          onChange={handleImageChange}
        />
      </label>

      {!!imagePreviews.length && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {imagePreviews.map((preview, index) => (
            <div
              key={`${preview.name}-${index}`}
              className="overflow-hidden rounded-[24px] border border-[#0a3327]/8 bg-white shadow-[0_18px_40px_-30px_rgba(10,51,39,0.45)]"
            >
              <img
                alt={preview.name}
                className="h-40 w-full object-cover"
                src={preview.url}
              />

              <div className="flex items-center justify-between px-4 py-3">
                <p className="max-w-[170px] truncate text-sm font-semibold text-[#0a3327]">
                  {preview.name}
                </p>

                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="text-xs font-bold uppercase tracking-[0.18em] text-[#b14716]"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
