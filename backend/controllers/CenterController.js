import Center from "../models/CenterModel.js";

// ── GET all centers (with optional filters) ────────────────────────────────
export const getAllCenters = async (req, res) => {
  try {
    const { district, city, status, search } = req.query;
    const filter = {};

    if (district) filter.district = district;
    if (city)     filter.city = { $regex: city, $options: "i" };
    if (status)   filter.status = status;
    if (search) {
      filter.$or = [
        { centerName: { $regex: search, $options: "i" } },
        { centerCode: { $regex: search, $options: "i" } },
        { city:       { $regex: search, $options: "i" } },
      ];
    }

    const centers = await Center.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: centers.length, data: centers });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch centers", error: error.message });
  }
};

// ── GET single center by ID ────────────────────────────────────────────────
export const getCenterById = async (req, res) => {
  try {
    const center = await Center.findById(req.params.id);
    if (!center) return res.status(404).json({ success: false, message: "Center not found" });
    res.status(200).json({ success: true, data: center });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch center", error: error.message });
  }
};

// ── POST create a new center ───────────────────────────────────────────────
export const createCenter = async (req, res) => {
  try {
    if (req.body.centerCode) {
      const existing = await Center.findOne({ centerCode: req.body.centerCode.toUpperCase() });
      if (existing) return res.status(409).json({ success: false, message: "A center with this code already exists" });
    }
    const center = new Center(req.body);
    const saved  = await center.save();
    res.status(201).json({ success: true, message: "Center created successfully", data: saved });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ success: false, message: "Center code already exists." });
    res.status(500).json({ success: false, message: "Failed to create center", error: error.message });
  }
};

// ── PUT full update ────────────────────────────────────────────────────────
export const updateCenter = async (req, res) => {
  try {
    const center = await Center.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!center) return res.status(404).json({ success: false, message: "Center not found" });
    res.status(200).json({ success: true, message: "Center updated successfully", data: center });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update center", error: error.message });
  }
};

// ── PATCH partial update ───────────────────────────────────────────────────
export const patchCenter = async (req, res) => {
  try {
    const allowed = [
      "centerName","district","city","address","contactNumber","email",
      "managerName","managerContact","capacity","operatingHours",
      "operatingDays","facilities","status","description","latitude","longitude",
    ];
    const updates = {};
    allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const center = await Center.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true });
    if (!center) return res.status(404).json({ success: false, message: "Center not found" });
    res.status(200).json({ success: true, message: "Center updated successfully", data: center });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update center", error: error.message });
  }
};

// ── DELETE a center ────────────────────────────────────────────────────────
export const deleteCenter = async (req, res) => {
  try {
    const center = await Center.findByIdAndDelete(req.params.id);
    if (!center) return res.status(404).json({ success: false, message: "Center not found" });
    res.status(200).json({ success: true, message: `Center "${center.centerName}" deleted successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete center", error: error.message });
  }
};

// ── PATCH volunteer count ──────────────────────────────────────────────────
export const updateVolunteerCount = async (req, res) => {
  try {
    const { action } = req.body;
    const update = action === "increment" ? { $inc: { volunteerCount: 1 } } : { $inc: { volunteerCount: -1 } };
    const center = await Center.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!center) return res.status(404).json({ success: false, message: "Center not found" });
    res.status(200).json({ success: true, message: "Volunteer count updated", volunteerCount: center.volunteerCount });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update volunteer count", error: error.message });
  }
};

// ── GET centers by district (dropdown) ────────────────────────────────────
export const getCentersByDistrict = async (req, res) => {
  try {
    const centers = await Center.find({ district: req.params.district, status: "Active" })
      .select("centerName centerCode city address");
    res.status(200).json({ success: true, count: centers.length, data: centers });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch centers by district", error: error.message });
  }
};

// ── GET active centers count ───────────────────────────────────────────────
export const getActiveCentersCount = async (req, res) => {
  try {
    const count = await Center.countDocuments({ status: "Active" });
    res.status(200).json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch active centers count", error: error.message });
  }
};