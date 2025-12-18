const SuperAdminDetailsModel=require("../models/superAdmindetails");
const getAllDepartments=async(req,res)=>{
    try {
        // 1️⃣ Find single super admin document
        const superAdmin = await SuperAdminDetailsModel.findOne().select("departments");
        if (!superAdmin || !superAdmin.departments.length) {
            return res.status(404).json({
                success: false,
                message: "No departments found",
                departments: [],
            });
        }
        res.status(200).json({
            success: true,
            message: "Departments retrieved successfully",
            departments: superAdmin.departments,
            superAdmin
        });
    } catch (error) {
        console.error("❌ Error retrieving departments:", error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve departments",
            error: error.message,
        });
    }
};
module.exports={getAllDepartments};