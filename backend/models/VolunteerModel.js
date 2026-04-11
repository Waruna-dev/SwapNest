import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const VolunteerSchema = new mongoose.Schema( 
	{
		firstName: { type: String, required: true, trim: true },
		lastName: { type: String, required: true, trim: true },
		email: { type: String, required: true, unique: true, trim: true },
		phone: { type: String, trim: true },
		nic: { type: String, required: true, trim: true },
		dob: { type: Date, required: true },
		gender: {
			type: String,
			enum: ["", "Male", "Female", "Non-binary", "Prefer not to say"],
			default: "",
		},
		emergencyContact: { type: String, trim: true },
		address: { type: String, trim: true },
		district: { type: String, trim: true },
		city: { type: String, trim: true },
		center: { type: String, trim: true },
		centerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Center' },
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
		agreeNotif: { type: Boolean, default: false },
		password: {
			type: String,
			required: true,
			minlength: 8,
			validate: {
				validator: function (password) {
					if (typeof password !== "string") return false;
					// Stored bcrypt hashes from updates (pre-save only runs on save(), not findByIdAndUpdate)
					if (password.startsWith("$2")) return true;
					return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(password);
				},
				message:
					"Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
			},
		},
		role: { 
			type: String, 
			enum: ["volunteer", "admin", "center_manager"], 
			default: "volunteer" 
		},
		// Used for the dashboard accept/reject workflow.
		// Existing records without this field will behave like "Pending" on the UI.
		applicationStatus: {
			type: String,
			enum: ["Pending", "Accepted", "Rejected"],
			default: "Pending",
		}
	},
	{ timestamps: true }
);

// Pre-save middleware to hash password before saving
VolunteerSchema.pre('save', async function() {
	// Only hash the password if it has been modified (or is new)
	if (!this.isModified('password')) return;
	
	// Hash password with cost factor of 12
	const salt = await bcrypt.genSalt(12);
	this.password = await bcrypt.hash(this.password, salt);
});

export default mongoose.model("Volunteer", VolunteerSchema); 
