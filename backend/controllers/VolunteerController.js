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
