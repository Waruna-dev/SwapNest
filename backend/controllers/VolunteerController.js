import Volunteer from "../models/VolunteerModel.js";

/**
 * Insert a new volunteer (Volunteer model: firstName, lastName, email, nic, dob, etc.).
 */
export async function insertVolunteer(data) {
    const volunteer = new Volunteer(data);
    await volunteer.save();
    return volunteer;
}






/** Get all volunteers */
export async function getVolunteers(req, res) {
    try {
        const volunteers = await Volunteer.find().sort({ createdAt: -1 });
        res.json(volunteers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

/** Get volunteers by center */
export async function getVolunteersByCenter(req, res) {
    try {
        const { centerId } = req.query;
        
        console.log("Getting volunteers by centerId:", centerId);
        
        if (!centerId) {
            console.log("No centerId provided");
            return res.status(400).json({ message: "Center ID is required" });
        }
        
        const volunteers = await Volunteer.find({ centerId }).sort({ createdAt: -1 });
        console.log("Found volunteers:", volunteers.length);
        
        res.json(volunteers);
    } catch (err) {
        console.error("Error in getVolunteersByCenter:", err);
        res.status(500).json({ message: err.message });
    }
}

/** Get one volunteer by ID */
export async function getVolunteerById(req, res) {
    try {
        const volunteer = await Volunteer.findById(req.params.id);
        if (!volunteer) return res.status(404).json({ message: "Volunteer not found" });
        res.json(volunteer);
    } catch (err) {
        if (err.name === "CastError") return res.status(400).json({ message: "Invalid volunteer ID" });
        res.status(500).json({ message: err.message });
    }
}

/** Create volunteer – body must be JSON (firstName, lastName, email, nic, dob, etc.) */
export async function addVolunteer(req, res) {
    if (typeof req.body === "undefined") req.body = {};
    const body = req.body != null ? req.body : {};
    if (typeof body !== "object" || Array.isArray(body)) {
        return res.status(400).json({
            message: "Request body must be a JSON object. Use Content-Type: application/json",
        });
    }
    try {
        const newVolunteer = await insertVolunteer(body);
        res.status(201).json(newVolunteer);
    } catch (err) {
        if (err.name === "ValidationError") {
            return res.status(400).json({ message: err.message, errors: err.errors });
        }
        if (err.code === 11000) {
            return res.status(400).json({ message: "Email already registered" });
        }
        res.status(500).json({ message: err.message });
    }
}

/** Update volunteer */
export async function updateVolunteer(req, res) {
    if (typeof req.body === "undefined") req.body = {};
    const body = req.body != null ? req.body : {};
    if (typeof body !== "object" || Array.isArray(body)) {
        return res.status(400).json({
            message: "Request body must be a JSON object. Use Content-Type: application/json",
        });
    }
    try {
        const volunteer = await Volunteer.findByIdAndUpdate(
            req.params.id,
            body,
            { new: true, runValidators: true }
        );
        if (!volunteer) return res.status(404).json({ message: "Volunteer not found" });
        res.json(volunteer);
    } catch (err) {
        if (err.name === "CastError") return res.status(400).json({ message: "Invalid volunteer ID" });
        if (err.name === "ValidationError") {
            return res.status(400).json({ message: err.message, errors: err.errors });
        }
        res.status(500).json({ message: err.message });
    }
}

/** Delete volunteer */
export async function deleteVolunteer(req, res) {
    try {
        const volunteer = await Volunteer.findByIdAndDelete(req.params.id);
        if (!volunteer) return res.status(404).json({ message: "Volunteer not found" });
        res.status(204).send();
    } catch (err) {
        if (err.name === "CastError") return res.status(400).json({ message: "Invalid volunteer ID" });
        res.status(500).json({ message: err.message });
    }
}

/** Assign volunteer to center */
export async function assignVolunteer(req, res) {
    try {
        const { centerId, assignedAt } = req.body;
        
        if (!centerId) {
            return res.status(400).json({ message: "Center ID is required" });
        }
        
        const volunteer = await Volunteer.findByIdAndUpdate(
            req.params.id,
            { 
                centerId, 
                assignedAt: assignedAt || new Date().toISOString(),
                applicationStatus: "Assigned"
            },
            { new: true, runValidators: false }
        );
        
        if (!volunteer) return res.status(404).json({ message: "Volunteer not found" });
        
        res.json({ 
            success: true, 
            message: "Volunteer assigned to center successfully",
            data: volunteer 
        });
    } catch (err) {
        if (err.name === "CastError") return res.status(400).json({ message: "Invalid volunteer ID" });
        if (err.name === "ValidationError") {
            return res.status(400).json({ message: err.message, errors: err.errors });
        }
        res.status(500).json({ message: err.message });
    }
}
