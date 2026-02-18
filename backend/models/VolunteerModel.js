import mongoose from "mongoose";

const VolunteerSchema = new mongoose.Schema(
	{
		firstName: { type: String, required: true, trim: true },
		lastName: { type: String, required: true, trim: true },
		email: { type: String, required: true, unique: true, trim: true },
		phone: { type: String, trim: true },
		nic: { type: String, required: true, trim: true },
		dob: { type: Date, required: true },
		gender: { type: String, enum: ["Male", "Female", "Non-binary", "Prefer not to say"], default: "" },
		emergencyContact: { type: String, trim: true },
		address: { type: String, trim: true },
		district: { type: String, trim: true },
		city: { type: String, trim: true },
		center: { type: String, trim: true },
		centerReason: { type: String, trim: true },
		hasVehicle: { type: Boolean, default: false },
		hasLicense: { type: Boolean, default: false },
		canTravel: { type: Boolean, default: false },
		skills: { type: [String], default: [] },
		tasks: { type: [String], default: [] },
		experience: { type: String, default: "" },
		maxTasks: { type: String, default: "" },
		bio: { type: String, default: "" },
		days: { type: [String], default: [] },
		time: { type: [String], default: [] },
		hoursPerWeek: { type: String, default: "" },
		startDate: { type: Date },
		holidays: { type: Boolean, default: false },
		emergency: { type: Boolean, default: false },
		documents: {
			nicCopy: { type: String, default: "" },
			drivingLicense: { type: String, default: "" },
			profilePhoto: { type: String, default: "" },
			referenceLetter: { type: String, default: "" }
		},
		agreeTerms: { type: Boolean, default: false },
		agreePrivacy: { type: Boolean, default: false },
		agreeNotif: { type: Boolean, default: false }
	},
	{ timestamps: true }
);

export default mongoose.model("Volunteer", VolunteerSchema);