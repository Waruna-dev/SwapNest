import Item from "../models/Item.js";
import mongoose from "mongoose";
import {
  uploadBufferToCloudinary,
  deleteFromCloudinary,
} from "../utils/item-cloudinaryUpload.js";

/** helpers */
const toInt = (v, def) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : def;
};
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const hasValue = (v) => v !== undefined && v !== null && String(v).trim() !== "";
const asArray = (v) => (Array.isArray(v) ? v : v ? [v] : []);
const normalizeIncomingImages = (raw) => {
  // Supports JSON body images such as:
  // ["https://..."] OR [{ "url": "https://...", "publicId": "..." }]
  // and also stringified JSON payloads.
  let value = raw;
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      value = [value];
    }
  }

  const list = asArray(value);
  return list
    .map((img, idx) => {
      if (typeof img === "string" && img.trim()) {
        return {
          url: img.trim(),
          publicId: `external_${Date.now()}_${idx}`,
        };
      }

      if (img && typeof img === "object" && typeof img.url === "string" && img.url.trim()) {
        return {
          url: img.url.trim(),
          publicId: img.publicId || `external_${Date.now()}_${idx}`,
        };
      }

      return null;
    })
    .filter(Boolean);
};

const parseLocation = (latRaw, lngRaw) => {
  if (!hasValue(latRaw) && !hasValue(lngRaw)) return { ok: true, value: undefined };
  if (!hasValue(latRaw) || !hasValue(lngRaw)) {
    return { ok: false, message: "Both lat and lng are required together" };
  }

  const lat = Number(latRaw);
  const lng = Number(lngRaw);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { ok: false, message: "lat and lng must be valid numbers" };
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return { ok: false, message: "lat must be [-90, 90] and lng must be [-180, 180]" };
  }

  return { ok: true, value: { type: "Point", coordinates: [lng, lat] } };
};

const buildFilters = (q) => {
  const filter = {};
  // by default show active only unless explicitly asked
  if (String(q.includeInactive || "false") !== "true") filter.isActive = true;

  if (q.category) filter.category = q.category;
  if (q.mode) filter.mode = q.mode;
  if (q.condition) {
    const conditions = String(q.condition)
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    if (conditions.length === 1) filter.condition = conditions[0];
    if (conditions.length > 1) filter.condition = { $in: conditions };
  }

  if (q.minPrice || q.maxPrice) {
    filter.price = {};
    if (q.minPrice) filter.price.$gte = Number(q.minPrice);
    if (q.maxPrice) filter.price.$lte = Number(q.maxPrice);
  }
  return filter;
};

const buildSort = (sort, hasTextSearch) => {
  switch (sort) {
    case "price_asc":
      return { price: 1 };
    case "price_desc":
      return { price: -1 };
    case "popular":
      return { views: -1 };
    case "relevance":
      return hasTextSearch
        ? { score: { $meta: "textScore" } }
        : { createdAt: -1 };
    case "newest":
    default:
      return { createdAt: -1 };
  }
};

const byItemIdentifier = (identifier) =>
  mongoose.Types.ObjectId.isValid(identifier)
    ? { $or: [{ _id: identifier }, { itemId: identifier }] }
    : { itemId: identifier };

/** ---------------------------
 * CREATE (POST) /api/items
 * form-data:
 *  title, description, price, category, mode, condition, contact, ownerId, lat, lng
 *  images (files) max 5
 * -------------------------- */
export const createItem = async (req, res, next) => {
  try {
    const {
      title,
      description,
      price,
      category,
      mode,
      condition,
      contact,
      ownerId,
      lat,
      lng,
    } = req.body;

    if (!title || !category || !mode || !ownerId) {
      return res
        .status(400)
        .json({ message: "title, category, mode, ownerId are required" });
    }

    const files = req.files || [];
    const bodyImages = normalizeIncomingImages(req.body.images);
    const uploaded = [];

    if (files.length > 5) {
      return res.status(400).json({ message: "Maximum 5 images allowed" });
    }

    if (files.length > 0) {
      for (const f of files) {
        const result = await uploadBufferToCloudinary(f.buffer, "swapnest/items");
        uploaded.push({ url: result.secure_url, publicId: result.public_id });
      }
    } else if (bodyImages.length > 0) {
      uploaded.push(...bodyImages.slice(0, 5));
    } else {
      return res.status(400).json({
        message:
          "At least 1 image is required. Send multipart files as images[] or JSON images array.",
      });
    }

    const parsedLocation = parseLocation(lat, lng);
    if (!parsedLocation.ok) {
      return res.status(400).json({ message: parsedLocation.message });
    }

    // for debugging it can help to see the payload
    console.log("createItem body:", req.body);

    const createdItem = await Item.create({
      title,
      description: description || "",
      price: Number(price || 0),
      category,
      mode,
      condition: condition || "Used",
      contact: contact || "",
      ownerId,
      images: uploaded,
      coverImage: uploaded[0],
      isActive: true,
      location: parsedLocation.value,
    });

    // return the created document to the client
    res.status(201).json(createdItem);
  } catch (err) {
    next(err);
  }
};

/** ---------------------------
 * READ LIST (GET) /api/items
 * q, filters, sort, pagination
 * -------------------------- */
export const getItems = async (req, res, next) => {
  try {
    const page = toInt(req.query.page, 1);
    const limit = clamp(toInt(req.query.limit, 12), 1, 50);
    const skip = (page - 1) * limit;

    const filter = buildFilters(req.query);

    const q = (req.query.q || "").trim();
    const hasTextSearch = q.length > 0;
    const findQuery = hasTextSearch
      ? { ...filter, $text: { $search: q } }
      : filter;

    const sort = buildSort(req.query.sort, hasTextSearch);

    const projection = {
      itemId: 1,
      title: 1,
      description: 1,
      price: 1,
      category: 1,
      mode: 1,
      condition: 1,
      contact: 1,
      images: 1,
      coverImage: 1,
      location: 1,
      views: 1,
      isActive: 1,
      createdAt: 1,
      ...(hasTextSearch ? { score: { $meta: "textScore" } } : {}),
    };

    const [items, totalItems] = await Promise.all([
      Item.find(findQuery, projection)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Item.countDocuments(findQuery),
    ]);

    res.json({
      items,
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    });
  } catch (err) {
    next(err);
  }
};

/** ---------------------------
 * READ ONE (GET) /api/items/:id?incViews=true
 * -------------------------- */
export const getItemById = async (req, res, next) => {
  try {
    const incViews = String(req.query.incViews || "false") === "true";

    const item = await Item.findOne(byItemIdentifier(req.params.id));
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (incViews) {
      item.views += 1;
      await item.save();
    }

    res.json(item);
  } catch (err) {
    next(err);
  }
};

/** ---------------------------
 * UPDATE (PUT) /api/items/:id
 * Supports:
 *  - update fields
 *  - add/replace images (optional)
 *  - set cover image by index (coverIndex)
 *
 * form-data recommended if uploading images:
 *  title, price, ... coverIndex, replaceImages=true/false
 *  images (files)
 * -------------------------- */
export const updateItem = async (req, res, next) => {
  try {
    const body = req.body || {};
    const item = await Item.findOne(byItemIdentifier(req.params.id));
    if (!item) return res.status(404).json({ message: "Item not found" });

    // Update basic fields (only if provided)
    const fields = [
      "title",
      "description",
      "category",
      "mode",
      "condition",
      "contact",
      "ownerId",
    ];
    for (const f of fields) {
      if (body[f] !== undefined) item[f] = body[f];
    }
    if (body.price !== undefined) item.price = Number(body.price || 0);
    if (body.isActive !== undefined)
      item.isActive = String(body.isActive) === "true";

    // Update location if given
    if (body.lat !== undefined || body.lng !== undefined) {
      const parsedLocation = parseLocation(body.lat, body.lng);
      if (!parsedLocation.ok) {
        return res.status(400).json({ message: parsedLocation.message });
      }
      item.location = parsedLocation.value;
    }

    // Images update (optional)
    const files = req.files || [];
    const replaceImages = String(body.replaceImages || "false") === "true";

    if (files.length > 0) {
      if (files.length > 5)
        return res.status(400).json({ message: "Maximum 5 images allowed" });

      const newUploaded = [];
      for (const f of files) {
        const result = await uploadBufferToCloudinary(
          f.buffer,
          "swapnest/items",
        );
        newUploaded.push({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }

      if (replaceImages) {
        // Delete old from Cloudinary
        for (const img of item.images) {
          await deleteFromCloudinary(img.publicId);
        }
        item.images = newUploaded;
      } else {
        // Add images (but keep max 5)
        const combined = [...item.images, ...newUploaded].slice(0, 5);
        item.images = combined;
      }

      // if cover missing, set cover
      if (!item.coverImage && item.images.length > 0)
        item.coverImage = item.images[0];
    }

    // Set cover image by index if provided
    if (body.coverIndex !== undefined) {
      const idx = Number(body.coverIndex);
      if (Number.isFinite(idx) && idx >= 0 && idx < item.images.length) {
        item.coverImage = item.images[idx];
      }
    }

    await item.save();
    res.json(item);
  } catch (err) {
    next(err);
  }
};

/** ---------------------------
 * DELETE (DELETE) /api/items/:id
 * Default:
 *  - hard delete: remove doc + delete Cloudinary images
 * Optional:
 *  - soft delete: isActive=false
 *
 * Use query param: ?soft=true
 * -------------------------- */
export const deleteItem = async (req, res, next) => {
  try {
    const soft = String(req.query.soft || "false") === "true";
    const identifier = String(req.params.id || "").trim();

    const item = await Item.findOne(byItemIdentifier(identifier));
    if (!item) {
      return res.status(404).json({
        message: "Item not found",
        itemId: identifier,
      });
    }

    if (soft) {
      item.isActive = false;
      await item.save();
      return res.json({
        message: "Item removed (soft delete)",
        itemId: item.itemId,
      });
    }

    // hard delete (default): remove images from Cloudinary then delete doc
    if (item.images && Array.isArray(item.images)) {
      for (const img of item.images) {
        try {
          await deleteFromCloudinary(img.publicId);
        } catch (cloudErr) {
          console.error(`Failed to delete image ${img.publicId}:`, cloudErr.message);
        }
      }
    }

    await Item.findByIdAndDelete(item._id);

    res.json({ message: "Item deleted permanently", itemId: item.itemId });
  } catch (err) {
    next(err);
  }
};

/** ---------------------------
 * NEARBY (GET) /api/items/nearby?lat=&lng=&distance=10&page=&limit=
 * optional: category/mode/condition/minPrice/maxPrice
 * -------------------------- */
export const getNearbyItems = async (req, res, next) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({ message: "lat and lng are required" });
    }

    const distanceKm = req.query.distance ? Number(req.query.distance) : 10;
    const maxDistance = Number.isFinite(distanceKm) ? distanceKm * 1000 : 10000;

    const page = toInt(req.query.page, 1);
    const limit = clamp(toInt(req.query.limit, 12), 1, 50);
    const skip = (page - 1) * limit;

    const filter = buildFilters(req.query);

    const pipeline = [
      {
        $geoNear: {
          near: { type: "Point", coordinates: [lng, lat] },
          distanceField: "distanceMeters",
          maxDistance,
          spherical: true,
          query: filter,
        },
      },
      { $sort: { distanceMeters: 1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          itemId: 1,
          title: 1,
          description: 1,
          price: 1,
          category: 1,
          mode: 1,
          condition: 1,
          contact: 1,
          images: 1,
          coverImage: 1,
          location: 1,
          distanceMeters: 1,
          views: 1,
          createdAt: 1,
        },
      },
    ];

    const items = await Item.aggregate(pipeline);

    const countPipeline = [
      {
        $geoNear: {
          near: { type: "Point", coordinates: [lng, lat] },
          distanceField: "distanceMeters",
          maxDistance,
          spherical: true,
          query: filter,
        },
      },
      { $count: "total" },
    ];
    const countRes = await Item.aggregate(countPipeline);
    const totalItems = countRes[0]?.total || 0;

    res.json({
      items,
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    });
  } catch (err) {
    next(err);
  }
};

/** ---------------------------
 * SUGGESTIONS (GET) /api/items/suggestions?q=cha&limit=8
 * -------------------------- */
export const getSuggestions = async (req, res, next) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.json({ suggestions: [] });

    const limit = clamp(toInt(req.query.limit, 8), 1, 15);

    const docs = await Item.find(
      { isActive: true, title: { $regex: q, $options: "i" } },
      { title: 1 },
    )
      .limit(limit * 2)
      .lean();

    const suggestions = [];
    for (const d of docs) {
      if (!suggestions.includes(d.title)) suggestions.push(d.title);
      if (suggestions.length >= limit) break;
    }

    res.json({ suggestions });
  } catch (err) {
    next(err);
  }
};

/** ---------------------------
 * TRENDING (GET) /api/items/trending?days=7&limit=12
 * -------------------------- */
export const getTrendingItems = async (req, res, next) => {
  try {
    const limit = clamp(toInt(req.query.limit, 12), 1, 50);
    const days = req.query.days ? Number(req.query.days) : 7;

    const since = new Date();
    if (Number.isFinite(days)) since.setDate(since.getDate() - days);

    const items = await Item.find(
      { isActive: true, createdAt: { $gte: since } },
      { itemId: 1, title: 1, price: 1, category: 1, coverImage: 1, views: 1, mode: 1 },
    )
      .sort({ views: -1 })
      .limit(limit)
      .lean();

    res.json({ items });
  } catch (err) {
    next(err);
  }
};

/** ---------------------------
 * SIMILAR (GET) /api/items/:id/similar?limit=6
 * -------------------------- */
export const getSimilarItems = async (req, res, next) => {
  try {
    const limit = clamp(toInt(req.query.limit, 6), 1, 20);

    const item = await Item.findOne(byItemIdentifier(req.params.id)).lean();
    if (!item) return res.status(404).json({ message: "Item not found" });

    const items = await Item.find(
      { _id: { $ne: item._id }, isActive: true, category: item.category },
      { title: 1, price: 1, category: 1, coverImage: 1, mode: 1 },
    )
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json({ items });
  } catch (err) {
    next(err);
  }
};
