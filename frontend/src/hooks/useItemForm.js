import { useEffect, useState } from "react";

const initialForm = {
  title: "",
  description: "",
  price: "",
  category: "Fashion",
  mode: "Swap",
  condition: "Used",
  contact: "",
  ownerId: "",
  lat: "",
  lng: "",
};

const decodeTokenOwnerId = () => {
  try {
    const token = localStorage.getItem("swapnest_token");
    if (!token) return "";

    const payload = token.split(".")[1];
    if (!payload) return "";

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(window.atob(normalized));
    return decoded?.id || "";
  } catch {
    return "";
  }
};

export const useItemForm = () => {
  const [formData, setFormData] = useState(initialForm);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormData((current) => ({
      ...current,
      ownerId: current.ownerId || decodeTokenOwnerId(),
    }));
  }, []);

  useEffect(() => {
    if (images.length === 0) {
      setImagePreviews([]);
      return undefined;
    }

    const previews = images.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));

    setImagePreviews(previews);

    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [images]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
      ...(name === "mode" && value === "Swap" ? { price: "" } : {}),
    }));
  };

  const handleImageChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);

    if (!selectedFiles.length) {
      return;
    }

    setImages((current) => [...current, ...selectedFiles].slice(0, 5));
    event.target.value = "";
  };

  const removeImage = (indexToRemove) => {
    setImages((current) =>
      current.filter((_, index) => index !== indexToRemove),
    );
  };

  const resetForm = () => {
    setFormData((current) => ({
      ...initialForm,
      ownerId: current.ownerId,
    }));
    setImages([]);
  };

  return {
    formData,
    setFormData,
    images,
    setImages,
    imagePreviews,
    status,
    setStatus,
    isSubmitting,
    setIsSubmitting,
    handleChange,
    handleImageChange,
    removeImage,
    resetForm,
  };
};
