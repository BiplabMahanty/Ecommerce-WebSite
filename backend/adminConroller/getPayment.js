const PaymentModel = require("../models/Payment");

const getPayment = async (req, res) => {
    try {
        const employeeId = req.params.id;
        const monthQuery = req.query.month;

        console.log("Fetching payment for:", { employeeId, monthQuery });

        // Validate inputs
        if (!employeeId || !monthQuery) {
            return res.status(400).json({
                success: false,
                message: "Employee ID and month are required",
            });
        }

        const payment = await PaymentModel.findOne({ 
            employee: employeeId, 
            salaryMonth: monthQuery 
        }).populate('employee');

        // If no payment found, return empty response with success: true
        if (!payment) {
            return res.status(200).json({
                success: true,
                message: "No payment record found for this month",
                payment: null,
            });
        }

        // Return found payment
        res.status(200).json({
            success: true,
            message: "Payment fetched successfully",
            payment
        });

    } catch (error) {
        console.error("❌ Error fetching payment:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch payment",
            error: error.message,
        });
    }
};

module.exports = { getPayment };