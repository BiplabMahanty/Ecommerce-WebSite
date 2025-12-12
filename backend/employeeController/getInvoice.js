const InvoiceModel=require("../models/invoice");

const invoice=async(req,res) =>{

    try {
        const {employeeId,salaryMonth}=req.body;

    if (!employeeId || !salaryMonth)
      return res.status(400).json({ success: false, message: "Employee & amount required" });

    let invoice=await InvoiceModel.findOne({employeeId:employeeId,salaryMonth:salaryMonth})

     if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "invoice record not found for this month.",
      });
    }

     res.status(200).json({
      success: true,
      message: "invoice fetched",
      invoice
    });


    } catch (err) {
        console.log("Payment Error:", err);
        res.status(500).json({ success: false, message: "Server error" });
        
    }
}
module.exports=invoice