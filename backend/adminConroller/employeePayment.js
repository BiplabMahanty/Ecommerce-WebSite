// makePayment.js (controller)
const PaymentModel = require("../models/Payment");

const paySalary = async (req, res) => {
  try {
    const { employeeId, amount, method, remarks,month } = req.body;

    if (!employeeId || !amount)
      return res.status(400).json({ success: false, message: "Employee & amount required" });

    // Find current salary month entry
    let payment = await PaymentModel.findOne({ employee: employeeId, salaryMonth: month });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Salary record not found for this month.",
      });
    }

    // Update fields
    payment.paymentStatus = "paid";
    payment.paymentMethod = method;
    payment.transactionId = "TXN-" + Date.now();
    payment.paidAt = new Date();
    payment.remarks = remarks;

    await payment.save();

    res.status(200).json({
      success: true,
      message: "Salary paid successfully",
      payment,
    });

  } catch (err) {
    console.log("Payment Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports=paySalary
