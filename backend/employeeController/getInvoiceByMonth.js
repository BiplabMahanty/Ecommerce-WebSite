
const InvoiceModel = require("../models/invoice");

// FETCH invoice BY EMPLOYEE & MONTH
const getInvoiceByMonth= async (req, res) => {
  try {
    const employeeId = req.params.id;
    const monthQuery = req.query.month; // format: YYYY-MM

    if (!monthQuery) {
      return res.status(400).json({ error: "Month (YYYY-MM) is required" });
    }

    console.log("EMPLOYEE ID:", employeeId);
    console.log("MONTH QUERY:", monthQuery);

    // Fetch invoice
    const invoice = await InvoiceModel.findOne({
      employeeId: employeeId,
      salaryMonth: monthQuery
    })
      
    res.json({
      invoice,
    });

  } catch (err) {
    console.error("Error fetching invoice:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

module.exports={getInvoiceByMonth}
