import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"; // --- NEW: Required for generating the login token
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

/** Create volunteer – body must be JSON */
export async function addVolunteer(req, res) {
    if (typeof req.body === "undefined") req.body = {};
    const body = req.body != null ? req.body : {};
    if (typeof body !== "object" || Array.isArray(body)) {
        return res.status(400).json({
            message: "Request body must be a JSON object. Use Content-Type: application/json",
        });
    }
    try {
        const data = { ...body, role: "volunteer" };
        if (!data.gender) delete data.gender;
        const newVolunteer = await insertVolunteer(data);
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
        const updates = { ...body, role: "volunteer" };
        if (updates.password === "" || updates.password === undefined || updates.password === null) {
            delete updates.password;
        } else if (typeof updates.password === "string" && updates.password.length > 0) {
            const salt = await bcrypt.genSalt(12);
            updates.password = await bcrypt.hash(updates.password, salt);
        }
        Object.keys(updates).forEach((key) => {
            if (updates[key] === undefined) delete updates[key];
        });

        const volunteer = await Volunteer.findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true,
        });
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

// --- NEW: Volunteer Login with Status Check ---
export async function loginVolunteer(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Please provide both email and password" });
        }

        // 1. Find the volunteer by email
        const volunteer = await Volunteer.findOne({ email });
        if (!volunteer) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // 2. Verify the password
        const isMatch = await bcrypt.compare(password, volunteer.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // 3. Block login if application is Pending or Rejected
        if (volunteer.applicationStatus === "Pending") {
            return res.status(403).json({ message: "Your volunteer application is still pending review." });
        }
        
        if (volunteer.applicationStatus === "Rejected") {
            return res.status(403).json({ message: "Your volunteer application was not accepted." });
        }

        // 4. Generate JWT Token
        const token = jwt.sign(
            { id: volunteer._id, role: volunteer.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '30d' }
        );

        // 5. Send successful response
        res.status(200).json({
            _id: volunteer._id,
            firstName: volunteer.firstName,
            lastName: volunteer.lastName,
            email: volunteer.email,
            role: volunteer.role,
            applicationStatus: volunteer.applicationStatus,
            centerId: volunteer.centerId,
            token: token
        });

    } catch (error) {
        console.error("Volunteer login error:", error);
        res.status(500).json({ message: "Server error during login" });
    }
}