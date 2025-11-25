const AdminModel=require("../models/admin")
const getAdmin = async (req, res) => {
  try {
    const {adminId}=req.params;

    const admin = await AdminModel.findById(adminId)
      .select("_id name email role address number  status adminImage")
      .sort({ createdAt: -1 })
      .lean();

    if (!admin || admin.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No employee found",
        admin: [],
        count: 0,
      });
    }

    console.log(`Found ${admin.length} users.`);

    res.status(200).json({
      success: true,
      message: "employee fetched successfully",
      admin,
      count: admin.length,
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

module.exports={getAdmin}