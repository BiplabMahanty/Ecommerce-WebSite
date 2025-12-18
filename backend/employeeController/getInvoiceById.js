const InvoiceModel =require("../models/invoice");

const invoiceId=async(req,res) =>{
    try {
        const {invoiceId}=req.params;

        const invoice=await InvoiceModel.findById(invoiceId);
        if (!invoice) {
        return res.status(404).json({
            success: false,
            message: "Invoice not found",
        });
        }
        res.status(200).json({
        success: true,
        message: "Invoice fetched successfully",
        invoice,
      });
    }
    catch (err) {
        console.log("Error fetching invoice by ID:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
}
module.exports=invoiceId;

