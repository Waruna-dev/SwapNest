import Item from "../models/Item.js";

const ALLOWED_MODES = ["SELL", "SWAP", "DONATE"];

const normalizeItemImages = (itemDoc) => {
  const item = itemDoc?.toObject ? itemDoc.toObject() : itemDoc;
  const images = Array.isArray(item.images)
    ? item.images
    : item.image
      ? [item.image]
      : [];

  return {
    ...item,
    images: images.slice(0, 5),
    image: images[0] || null,
  };
};

// CREATE ITEM
export const createItem = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      category,
      contact,
      lat,
      lng,
      mode,
      ownerId,
    } = req.body;

    const normalizedMode =
      typeof mode === "string" ? mode.trim().toUpperCase() : undefined;

    const hasLat = lat !== undefined && lat !== null && lat !== "";
    const hasLng = lng !== undefined && lng !== null && lng !== "";

    if (
      !title ||
      price === undefined ||
      price === null ||
      !category ||
      !hasLat ||
      !hasLng
    ) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const latNum = Number(lat);
    const lngNum = Number(lng);
    const priceNum = Number(price);

    if (
      Number.isNaN(latNum) ||
      Number.isNaN(lngNum) ||
      latNum < -90 ||
      latNum > 90 ||
      lngNum < -180 ||
      lngNum > 180
    ) {
      return res.status(400).json({ message: "Invalid coordinates" });
    }

    if (Number.isNaN(priceNum) || priceNum < 0) {
      return res.status(400).json({ message: "Invalid price" });
    }

    if (normalizedMode && !ALLOWED_MODES.includes(normalizedMode)) {
      return res.status(400).json({
        message: `Invalid mode. Allowed values: ${ALLOWED_MODES.join(", ")}`,
      });
    }

    // ✅ Cloudinary uploaded images: req.files
    const imageUrls = (req.files || []).map((f) => f.path);

    // optional: require at least 1 image
    // if (imageUrls.length === 0) {
    //   return res.status(400).json({ message: "At least 1 image required" });
    // }

    const newItem = await Item.create({
      title,
      description,
      price: priceNum,
      category,
      contact,
      mode: normalizedMode,
      ownerId: ownerId || "anonymous",

      // ✅ save multiple images
      images: imageUrls,

      location: {
        type: "Point",
        coordinates: [lngNum, latNum],
      },
    });

    res.status(201).json(normalizeItemImages(newItem));
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

// GET ALL ITEMS
export const getItems = async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.json(items.map(normalizeItemImages));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET SINGLE ITEM
export const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(normalizeItemImages(item));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE ITEM
export const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    const payload = { ...req.body };

    // price validate
    if (payload.price !== undefined) {
      const priceNum = Number(payload.price);
      if (Number.isNaN(priceNum) || priceNum < 0) {
        return res.status(400).json({ message: "Invalid price" });
      }
      payload.price = priceNum;
    }

    if (payload.mode !== undefined) {
      if (typeof payload.mode !== "string") {
        return res.status(400).json({
          message: `Invalid mode. Allowed values: ${ALLOWED_MODES.join(", ")}`,
        });
      }

      const normalizedMode = payload.mode.trim().toUpperCase();
      if (!ALLOWED_MODES.includes(normalizedMode)) {
        return res.status(400).json({
          message: `Invalid mode. Allowed values: ${ALLOWED_MODES.join(", ")}`,
        });
      }
      payload.mode = normalizedMode;
    }

    // location update validate
    const hasLat =
      payload.lat !== undefined && payload.lat !== null && payload.lat !== "";
    const hasLng =
      payload.lng !== undefined && payload.lng !== null && payload.lng !== "";
    if (hasLat || hasLng) {
      if (!hasLat || !hasLng) {
        return res.status(400).json({
          message: "Both lat and lng are required for location update",
        });
      }

      const latNum = Number(payload.lat);
      const lngNum = Number(payload.lng);
      if (
        Number.isNaN(latNum) ||
        Number.isNaN(lngNum) ||
        latNum < -90 ||
        latNum > 90 ||
        lngNum < -180 ||
        lngNum > 180
      ) {
        return res.status(400).json({ message: "Invalid coordinates" });
      }

      payload.location = {
        type: "Point",
        coordinates: [lngNum, latNum],
      };
    }

    // ✅ handle new uploaded images (optional)
    const newImageUrls = (req.files || []).map((f) => f.path);

    // Option A (recommended): APPEND new images to existing (limit max 5)
    if (newImageUrls.length > 0) {
      const combined = [...(item.images || []), ...newImageUrls].slice(0, 5);
      item.images = combined;
    }

    // If you want REPLACE instead of APPEND, use this instead:
    // if (newImageUrls.length > 0) item.images = newImageUrls.slice(0, 5);

    // cleanup lat/lng from payload (not stored directly)
    delete payload.lat;
    delete payload.lng;

    // assign other fields
    Object.assign(item, payload);

    const updated = await item.save();
    res.json(normalizeItemImages(updated));
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

// DELETE ITEM
export const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    await item.deleteOne();
    res.json({ message: "Item deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// NEARBY SEARCH
export const getNearbyItems = async (req, res) => {
  try {
    const { lat, lng, distance } = req.query;

    const km = distance ? Number(distance) : 10;
    const latNum = Number(lat);
    const lngNum = Number(lng);

    if (
      Number.isNaN(latNum) ||
      Number.isNaN(lngNum) ||
      latNum < -90 ||
      latNum > 90 ||
      lngNum < -180 ||
      lngNum > 180
    ) {
      return res
        .status(400)
        .json({ message: "Valid lat and lng query params are required" });
    }

    if (Number.isNaN(km) || km <= 0) {
      return res
        .status(400)
        .json({ message: "Distance must be a positive number" });
    }

    const items = await Item.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lngNum, latNum],
          },
          $maxDistance: km * 1000,
        },
      },
    });

    res.json(items.map(normalizeItemImages));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
