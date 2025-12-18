// ✅ server.js
const express = require("express");
const http = require("http");
const app = express();
require("dotenv").config();
require("./models/db");
require("./cron/attendanceCron");

const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const adminRouter=require("./router/adminRouter")
const employeeRouter=require("./router/employeeRouter")
const superAdminRouter=require("./router/superAdmin")

app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// ✅ Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());


app.use("/api/admin", adminRouter);
app.use("/api/employee", employeeRouter);
app.use("/api/superAdmin", superAdminRouter);


app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ success: false, message: "Internal Server Error" });
});
const server = http.createServer(app);

const PORT = process.env.PORT || 9000;
server.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
