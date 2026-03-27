import { useEffect, useMemo, useState } from "react";
import ItemViewPanel from "./ItemViewPanel";
import ItemEditForm from "./ItemEditForm";

function ItemModal(props) {
  const {
    showModal,
    selectedItem,
    closeModal,
    isEditMode,
    getPrimaryImage,
    editImages = [],
  } = props;
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const galleryImages = useMemo(() => {
    if (!selectedItem) {
      return [];
    }

    if (isEditMode && editImages.length) {
      return editImages.map((image, index) => ({
        id: image.id || `edit-${index}`,
        url: image.url,
        name: image.name || `Image ${index + 1}`,
      }));
    }

    if (Array.isArray(selectedItem.images) && selectedItem.images.length) {
      return selectedItem.images.map((image, index) => ({
        id: image.publicId || `item-${index}`,
        url: image.url,
        name: `Image ${index + 1}`,
      }));
    }

    return [
      {
        id: "fallback",
        url: getPrimaryImage(selectedItem),
        name: selectedItem.title,
      },
    ];
  }, [editImages, getPrimaryImage, isEditMode, selectedItem]);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [selectedItem, isEditMode, galleryImages.length]);

  if (!showModal || !selectedItem) return null;

  const activeImage = galleryImages[activeImageIndex] || galleryImages[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#082d24]/45 px-4 py-6 backdrop-blur-sm">
      <div className="relative max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-[36px] border border-[#eadfce] bg-[#f8f4ed] shadow-[0_35px_100px_-45px_rgba(8,45,36,0.7)]">
        <button
          type="button"
          onClick={closeModal}
          className="absolute right-6 top-6 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-[#e12d2d] text-2xl font-light text-white"
        >
          ×
        </button>

        <div className="grid gap-0 lg:grid-cols-[1.2fr_0.9fr]">
          <div className="p-5 lg:p-6">
            <img
              src={activeImage.url}
              alt={activeImage.name || selectedItem.title}
              className="h-[360px] w-full rounded-[30px] bg-[#ece3d6] object-cover md:h-[460px]"
            />

            {galleryImages.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3 md:grid-cols-5">
                {galleryImages.map((image, index) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setActiveImageIndex(index)}
                    className={`overflow-hidden rounded-[20px] border transition ${
                      index === activeImageIndex
                        ? "border-[#c1531c] shadow-[0_14px_35px_-24px_rgba(193,83,28,0.9)]"
                        : "border-[#eadfce]"
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.name}
                      className="h-20 w-full bg-[#ece3d6] object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 lg:p-7">
            {!isEditMode ? (
              <ItemViewPanel {...props} />
            ) : (
              <ItemEditForm {...props} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ItemModal;
