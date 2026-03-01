import "../config/cloudinary.js";
import { v2 as cloudinary } from "cloudinary";

export const uploadBufferToCloudinary = (buffer, folder = "swapnest/items") =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );
    stream.end(buffer);
  });

export const uploadUrlToCloudinary = async (url, folder = "swapnest/items") =>
  cloudinary.uploader.upload(url, {
    folder,
    resource_type: "image",
  });

export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
};
