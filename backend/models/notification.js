const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    relatedLeave: { type: mongoose.Schema.Types.ObjectId, ref: "LeaveRequest" },
    read: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
