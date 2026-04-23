const KYC = require("../models/KYC");
const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
  await transporter.sendMail({
    from: `CricketGear <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

const submitKYC = async (req, res) => {
  try {
    const existing = await KYC.findOne({ user: req.user._id });
    if (existing && existing.status === "verified") {
      return res
        .status(400)
        .json({ success: false, message: "Already verified!" });
    }
    if (existing) {
      await KYC.findByIdAndUpdate(existing._id, {
        ...req.body,
        status: "pending",
        rejectionReason: "",
      });
      return res.json({ success: true, message: "KYC resubmitted!" });
    }
    const kyc = await KYC.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, kyc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyKYC = async (req, res) => {
  try {
    const kyc = await KYC.findOne({ user: req.user._id });
    res.json({ success: true, kyc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllKYC = async (req, res) => {
  try {
    const kycs = await KYC.find({})
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json({ success: true, kycs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateKYCStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const kyc = await KYC.findByIdAndUpdate(
      req.params.id,
      {
        status,
        rejectionReason: rejectionReason || "",
        verifiedAt: status === "verified" ? new Date() : null,
      },
      { new: true },
    ).populate("user", "name email");

    if (!kyc)
      return res.status(404).json({ success: false, message: "KYC not found" });

    if (status === "verified") {
      await sendEmail(
        kyc.user.email,
        "✅ KYC Verified — CricketGear",
        `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <h2 style="color:#00d4aa;">KYC Verified!</h2>
          <p>Hi ${kyc.user.name},</p>
          <p>Your KYC verification has been <strong style="color:#4caf50;">approved</strong>!</p>
          <p>You now have full access to all features on CricketGear.</p>
          <a href="${process.env.CLIENT_URL}" style="background:#00d4aa;color:#000;padding:12px 24px;border-radius:50px;text-decoration:none;font-weight:bold;display:inline-block;margin:1rem 0;">
            Shop Now 🏏
          </a>
        </div>`,
      );
    } else if (status === "rejected") {
      await sendEmail(
        kyc.user.email,
        "❌ KYC Rejected — CricketGear",
        `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <h2 style="color:#ff6b6b;">KYC Rejected</h2>
          <p>Hi ${kyc.user.name},</p>
          <p>Unfortunately your KYC has been <strong style="color:#f44336;">rejected</strong>.</p>
          <p><strong>Reason:</strong> ${rejectionReason || "Documents unclear or invalid"}</p>
          <p>Please resubmit with correct documents.</p>
          <a href="${process.env.CLIENT_URL}/kyc" style="background:#00d4aa;color:#000;padding:12px 24px;border-radius:50px;text-decoration:none;font-weight:bold;display:inline-block;margin:1rem 0;">
            Resubmit KYC
          </a>
        </div>`,
      );
    }

    res.json({ success: true, kyc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { submitKYC, getMyKYC, getAllKYC, updateKYCStatus };
