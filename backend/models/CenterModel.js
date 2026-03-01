import mongoose from "mongoose";

const centerSchema = new mongoose.Schema(
  {
    centerName: { type: String, required: [true, "Center name is required"], trim: true },
    centerCode: { type: String, required: [true, "Center code is required"], unique: true, uppercase: true, trim: true },
    district: {
      type: String,
      required: [true, "District is required"],
      enum: ["Colombo","Gampaha","Kalutara","Kandy","Galle","Matara","Jaffna","Trincomalee","Kurunegala","Ratnapura","Badulla"],
    },
    city:           { type: String, required: [true, "City is required"], trim: true },
    address:        { type: String, required: [true, "Address is required"], trim: true },
    contactNumber:  { type: String, required: [true, "Contact number is required"] },
    email:          { type: String, required: [true, "Email is required"], lowercase: true },
    managerName:    { type: String, required: [true, "Manager name is required"], trim: true },
    managerContact: { type: String, required: [true, "Manager contact is required"] },
    capacity:       { type: Number, required: [true, "Capacity is required"], min: 1 },
    operatingHours: {
      open:  { type: String, default: "08:00" },
      close: { type: String, default: "17:00" },
    },
    operatingDays: {
      type: [String],
      enum: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
      default: ["Monday","Tuesday","Wednesday","Thursday","Friday"],
    },
    facilities: {
      type: [String],
      enum: ["Storage","Sorting Area","Loading Bay","Parking","CCTV","Weighing Scale","Office Space"],
      default: [],
    },
    status:         { type: String, enum: ["Active","Inactive","Under Maintenance"], default: "Active" },
    description:    { type: String, trim: true, default: "" },
    volunteerCount: { type: Number, default: 0 },
    latitude:       { type: Number, default: null },
    longitude:      { type: Number, default: null },
  },
  { timestamps: true }
);

centerSchema.pre("validate", function (next) {
  if (!this.centerCode && this.centerName) {
    this.centerCode =
      this.centerName.replace(/[^a-zA-Z0-9 ]/g, "").split(" ").filter(Boolean)
        .map((w) => w[0].toUpperCase()).join("") + "-" + Date.now().toString().slice(-4);
  }
  next();
});

export default mongoose.model("Center", centerSchema);