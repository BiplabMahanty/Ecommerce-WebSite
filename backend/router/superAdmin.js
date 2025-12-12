const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");



const verifyRole=require("../middleware/authMiddleware");
const editSuperAdmin = require("../superAdminController/editSuperAdmin");



router.post("/editSuperAdmin",editSuperAdmin)

module.exports=router
