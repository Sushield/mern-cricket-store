const mongoose = require("mongoose");

const kycSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    fullName: { type: String, required: true },
    dateOfBirth: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    phone: { type: String, required: true },
    idType: {
      type: String,
      enum: ["citizenship", "passport", "driving_license", "voter_id"],
      required: true,
    },
    idNumber: { type: String, required: true },
    idFront: { url: String, public_id: String },
    idBack: { url: String, public_id: String },
    selfie: { url: String, public_id: String },
    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    rejectionReason: { type: String },
    verifiedAt: { type: Date },
  },
  { timestamps: true },
);

module.exports = mongoose.model("KYC", kycSchema);
