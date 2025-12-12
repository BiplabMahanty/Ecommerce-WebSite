const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

function generateInvoicePDF(payment, employee) {
  return new Promise((resolve, reject) => {
    const invoiceNumber = `INV-${employee._id.toString().slice(-4)}-${Date.now()}`;
    const fileName = `invoice_${invoiceNumber}.pdf`;
    const filePath = path.join(__dirname, "../invoices", fileName);

    if (!fs.existsSync(path.join(__dirname, "../invoices"))) {
      fs.mkdirSync(path.join(__dirname, "../invoices"));
    }

    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // HEADER
    doc.fontSize(20).text("EMPLOYEE PAYMENT INVOICE", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`Invoice No: ${invoiceNumber}`);
    doc.text(`Invoice Date: ${new Date().toISOString().slice(0, 10)}`);
    doc.text(`Salary Month: ${payment.salaryMonth}`);
    doc.moveDown();

    // EMPLOYEE DETAILS
    doc.fontSize(15).text("EMPLOYEE DETAILS", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Employee ID: ${employee._id}`);
    doc.text(`Employee Name: ${employee.name}`);
    doc.text(`Designation: ${employee.role}`);
    doc.moveDown();

    // EARNINGS
    doc.fontSize(15).text("EARNINGS", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Basic Salary: ₹${payment.basicSalary}`);
    doc.text(`Overtime Pay: ₹${payment.overtimePay}`);
    doc.text(`Allowances: ₹${payment.allowances}`);
    doc.text(`Bonus: ₹${payment.bonus}`);
    doc.moveDown();

    doc.fontSize(13).text(`Total Earnings: ₹${payment.totalEarnings}`, { bold: true });
    doc.moveDown();

    // DEDUCTIONS
    doc.fontSize(15).text("DEDUCTIONS", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Leave Deductions: ₹${payment.leaveDeductions}`);
    doc.text(`Late Entry Deductions: ₹${payment.lateDeductions}`);
    doc.text(`Tax (TDS): ₹${payment.tax}`);
    doc.text(`Other Deductions: ₹${payment.otherDeductions}`);
    doc.moveDown();

    doc.fontSize(13).text(`Total Deductions: ₹${payment.totalDeductions}`, { bold: true });
    doc.moveDown();

    // NET PAYMENT
    doc.fontSize(15).text("NET PAYMENT", { underline: true });
    doc.text(`NET PAYABLE AMOUNT: ₹${payment.netPay}`, { bold: true });
    doc.text(`Payment Status: ${payment.paymentStatus}`);
    doc.moveDown();

    doc.text("Authorized Signature: ____________________", { align: "left" });

    doc.end();

    stream.on("finish", () => resolve({ filePath, fileName, invoiceNumber }));
    stream.on("error", reject);
  });
}

module.exports = generateInvoicePDF;
