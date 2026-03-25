import ItemViewPanel from "./ItemViewPanel";
import ItemEditForm from "./ItemEditForm";

function ItemModal(props) {
  const { showModal, selectedItem, closeModal, isEditMode, getPrimaryImage } =
    props;

  if (!showModal || !selectedItem) return null;

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
              src={getPrimaryImage(selectedItem)}
              alt={selectedItem.title}
              className="h-[360px] w-full rounded-[30px] bg-[#ece3d6] object-cover md:h-[460px]"
            />
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
