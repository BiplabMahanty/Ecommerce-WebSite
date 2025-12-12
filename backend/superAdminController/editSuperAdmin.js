const SuperAdminModel=require("../models/superAdmin");


const editSuperAdmin= async (req,res)=>{

    try {
        
        const {itDepartmentLeave,HRLeave,otherLeave}=req.body;

        let superAdmin=await SuperAdminModel.findOne()


        if (!superAdmin) {
             
            superAdmin=new SuperAdminModel({
                itDepartmentLeave:itDepartmentLeave,
                HRLeave:HRLeave,
                otherLeave:otherLeave
            })
        }

        superAdmin.otherLeave=otherLeave;
        superAdmin.itDepartmentLeave=itDepartmentLeave;
        superAdmin.HRLeave=HRLeave;

        await superAdmin.save();

        res.status(201).json({
         message: "SuperAdmin Added successfully",
         success: true,
         superAdmin
         });
        
    } catch (error) {
         console.error("Error creating leave request:", error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message,
    });
    }
}

module.exports=editSuperAdmin;