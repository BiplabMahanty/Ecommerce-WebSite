const PaymentModel=require("../models/Payment")
const getAllPayment = async (req, res) => {
  try {
    console.log("Fetching all payment...");

    const payment = await PaymentModel.find({})
     .populate("employee")

    if (!payment) {
      return res.status(200).json({
        success: true,
        message: "No payment found",
        payment: [],
        count: 0,
      });
    }

    console.log(`Found ${payment.length} users.`);

    res.status(200).json({
      success: true,
      message: "payment fetched successfully",
      payment,
      count: payment.length,
    });
  } catch (error) {
    console.error("❌ Error fetching admin:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch admin",
      error: error.message,
    });
  }
};

module.exports={getAllPayment}