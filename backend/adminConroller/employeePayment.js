const PaymentModel = require("../models/Payment");
const EmployeeModel = require("../models/employee");
const InvoiceModel=require("../models/invoice")
const sendEmail = require("../utils/sendEmail");
const fs = require("fs");
const path = require("path");
const pdfCreator = require("pdf-creator-node");


const paySalary = async (req, res) => {
  try {
    const { employeeId, amount, method, remarks,month } = req.body;

    if (!employeeId || !amount)
      return res.status(400).json({ success: false, message: "Employee & amount required" });

    const employee=await EmployeeModel.findById(employeeId)

     if (!employee) {
      return res.status(404).json({
        success: false,
        message: "employee not found.",
      });
    }

    // Find current salary month entry
    let payment = await PaymentModel.findOne({ employee: employeeId, salaryMonth: month });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Salary record not found for this month.",
      });
    }

    // Update fields
    payment.paymentStatus = "PAID";
    payment.paymentMethod = method;
    payment.transactionId = "TXN-" + Date.now();
    payment.paidAt = new Date();
    payment.remarks = remarks;

    await payment.save();

    let invoice= await InvoiceModel.findOne({employeeId:employeeId,salaryMonth:month})

    if (!invoice) {
     invoice=new InvoiceModel({
     
      salaryMonth:month,
      employeeId:employeeId,
      employeeName:employee.name,
      department:employee.department,
      designation:employee.position,

      basicSalary:payment.basicSalary,
      totalAllowances:payment.totalAllowances,
      hraAllowances:payment.hraAllowances,
      daAllowances:payment.daAllowances,
      taAllowances:payment.taAllowances,
      maAllowances:payment.maAllowances,
      spAllowances:payment.spAllowances,

      pf:payment.pf,
      esic:payment.esic,
      professionalTex:payment.professionalTex,

      leaveDeductions:payment.lateTimeDeductions,
      absentDeductions:payment.absentDeductions,
      overtimeMinites:payment.overtimeMinites,
      overLateTime:payment.overLateTime,
      overtimePay:payment.overtimePay,
      lateTimeDeductions:payment.lateTimeDeductions,

      grossSalary:payment.grossSalary,
      totalDeductions:payment.totalDeductions,
      netSalary:payment.netSalary,

      paymentMethod:payment.paymentMethod,
      paymentStatus:payment.paymentStatus,
      transactionId:payment.transactionId,


     })
    }
      invoice.basicSalary=payment.basicSalary,
      invoice.totalAllowances=payment.totalAllowances,
      invoice.hraAllowances=payment.hraAllowances,
      invoice.daAllowances=payment.daAllowances,
      invoice.taAllowances=payment.taAllowances,
      invoice.maAllowances=payment.maAllowances,
      invoice.spAllowances=payment.spAllowances,

      invoice.pf=payment.pf,
      invoice.esic=payment.esic,
      invoice.professionalTex=payment.professionalTex,

      invoice.leaveDeductions=payment.leaveDeductions,
      invoice.absentDeductions=payment.absentDeductions,
      invoice.overtimeMinites=payment.overtimeMinites,
      invoice.overLateTime=payment.overLateTime,
      invoice.overtimePay=payment.overtimePay,
      invoice.lateTimeDeductions=payment.lateTimeDeductions,

      invoice.grossSalary=payment.grossSalary,
      invoice.totalDeductions=payment.totalDeductions,
      invoice.netSalary=payment.netSalary,

      invoice.paymentMethod=payment.paymentMethod,
      invoice.paymentStatus=payment.paymentStatus,
      invoice.transactionId=payment.transactionId,

      await invoice.save();

      const htmlTemplate=
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${employee?.name} - ${month}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 40px; 
              max-width: 800px;
              margin: 0 auto;
            }
            .invoice-header { 
              text-align: center; 
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .invoice-header h1 {
              margin: 0;
              color: #333;
            }
            .invoice-info {
              display: flex;
              justify-content: space-between;
              margin: 30px 0;
            }
            .info-section {
              flex: 1;
            }
            .info-section h3 {
              margin-bottom: 10px;
              color: #555;
            }
            .info-section p { 
              margin: 5px 0; 
              line-height: 1.6;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 30px 0; 
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 12px; 
              text-align: left; 
            }
            th { 
              background-color: #f2f2f2;
              font-weight: bold;
            }
            .amount {
              text-align: right;
            }
            .total-row {
              font-weight: bold; 
              background-color: #f9f9f9;
              font-size: 1.1em;
            }
            .net-salary-row {
              background-color: #e8f5e9;
              font-size: 1.2em;
              font-weight: bold;
            }
            .footer {
              margin-top: 50px;
              text-align: center;
              color: #666;
              font-size: 0.9em;
            }
            @media print {
              button { display: none; }
            }
            .print-btn {
              background-color: #4CAF50;
              color: white;
              padding: 10px 30px;
              border: none;
              border-radius: 5px;
              cursor: pointer;
              font-size: 16px;
              margin: 20px auto;
              display: block;
            }
            .print-btn:hover {
              background-color: #45a049;
            }
          </style>
        </head>
        <body>
          <div class="invoice-header">
            <h1>SALARY INVOICE</h1>
            <p><strong>Invoice No:</strong> ${invoice.invoiceNo || 'N/A'}</p>
            <p><strong>Invoice Date:</strong> ${new Date(invoice.invoiceDate).toLocaleDateString()}</p>
          </div>
          
          <div class="invoice-info">
            <div class="info-section">
              <h3>Employee Details:</h3>
              <p><strong>Name:</strong> ${invoice.employeeName || employee?.name}</p>
              <p><strong>Employee ID:</strong> ${employeeId}</p>
              <p><strong>Department:</strong> ${invoice.department || employee?.department}</p>
              <p><strong>Designation:</strong> ${invoice.designation || 'N/A'}</p>
            </div>
            <div class="info-section">
              <h3>Payment Details:</h3>
              <p><strong>Salary Month:</strong> ${month}</p>
              <p><strong>Payment Status:</strong> ${invoice.paymentStatus}</p>
              <p><strong>Payment Method:</strong> ${invoice.paymentMethod}</p>
              ${invoice.transactionId ? `<p><strong>Transaction ID:</strong> ${invoice.transactionId}</p>` : ''}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th class="amount">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>EARNINGS</strong></td>
                <td></td>
              </tr>
              <tr>
                <td>Basic Salary</td>
                <td class="amount">₹${invoice.basicSalary || 0}</td>
              </tr>
              ${invoice.hraAllowances ? `<tr><td>HRA Allowance</td><td class="amount">₹${invoice.hraAllowances}</td></tr>` : ''}
              ${invoice.daAllowances ? `<tr><td>DA Allowance</td><td class="amount">₹${invoice.daAllowances}</td></tr>` : ''}
              ${invoice.taAllowances ? `<tr><td>TA Allowance</td><td class="amount">₹${invoice.taAllowances}</td></tr>` : ''}
              ${invoice.maAllowances ? `<tr><td>MA Allowance</td><td class="amount">₹${invoice.maAllowances}</td></tr>` : ''}
              ${invoice.spAllowances ? `<tr><td>Special Allowance</td><td class="amount">₹${invoice.spAllowances}</td></tr>` : ''}
              ${invoice.overtimePay ? `<tr><td>Overtime Pay (${invoice.overtimeMinites} mins)</td><td class="amount">₹${invoice.overtimePay}</td></tr>` : ''}
              <tr class="total-row">
                <td>Gross Salary</td>
                <td class="amount">₹${invoice.grossSalary || 0}</td>
              </tr>
              <tr>
                <td><strong>DEDUCTIONS</strong></td>
                <td></td>
              </tr>
              ${invoice.pf ? `<tr><td>PF</td><td class="amount">-₹${invoice.pf}</td></tr>` : ''}
              ${invoice.esic ? `<tr><td>ESIC</td><td class="amount">-₹${invoice.esic}</td></tr>` : ''}
              ${invoice.professionalTex ? `<tr><td>Professional Tax</td><td class="amount">-₹${invoice.professionalTex}</td></tr>` : ''}
              ${invoice.absentDeductions ? `<tr><td>Absent Deductions</td><td class="amount">-₹${invoice.absentDeductions}</td></tr>` : ''}
              ${invoice.leaveDeductions ? `<tr><td>Leave Deductions</td><td class="amount">-₹${invoice.leaveDeductions}</td></tr>` : ''}
              ${invoice.lateTimeDeductions ? `<tr><td>Late Time Deductions (${invoice.overLateTime} mins)</td><td class="amount">-₹${invoice.lateTimeDeductions}</td></tr>` : ''}
             
              <tr class="net-salary-row">
                <td><strong>NET SALARY</strong></td>
                <td class="amount"><strong>₹${invoice.netSalary || 0}</strong></td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            <p>This is a computer-generated invoice and does not require a signature.</p>
            <p>Generated on: ${new Date().toLocaleString()}</p>
          </div>

          <button class="print-btn" onclick="window.print()">🖨️ Print Invoice</button>
        </body>
      </html>
      `

       const options = {
      format: "A4",
      orientation: "portrait",
      border: "10mm",
    };

    const pdfPath = path.join(__dirname, `../invoices/invoice-${invoice.invoiceNo}.pdf`);

    const document = {
      html: htmlTemplate,
      data: {},
      path: pdfPath,
      type: "",
    };

    // Ensure invoices directory exists
    const invoiceDir = path.dirname(pdfPath);
    if (!fs.existsSync(invoiceDir)) {
      fs.mkdirSync(invoiceDir, { recursive: true });
    }

    // 🧷 Generate PDF (this library correctly embeds HTML/CSS)
    await pdfCreator.create(document, options);

    // 📧 Send Email
    const totalAmount = Number(invoice.netSalary || 0);
    const emailHtml = `
      <h3>Hi ${employee.name},</h3>
      <p>Thank you! Please find your invoice attached.</p>
      <p><strong>Invoice ID:</strong> ${invoice.invoiceNo || 'N/A'}</p>
      <p><strong>Total:</strong> ₹${totalAmount.toFixed(2)}</p>
      <p>We appreciate your business!</p>
    `;

    await sendEmail(employee.email, "Your Order Invoice", emailHtml, {
      filename: `invoice-${invoice.invoiceNo}.pdf`,
      path: pdfPath,
    });

    console.log("✅ Order created and invoice sent:", invoice.invoiceNo);
    


    



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
