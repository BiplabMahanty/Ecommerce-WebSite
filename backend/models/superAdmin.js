const mongoose=require("mongoose");

const superAdminSchema=new mongoose.Schema(
    {
        itDepartmentLeave:{type:Number},
        HRLeave:{type:Number},
        otherLeave:{type:Number},
        departments:[String],
    },
    {timestampse:true}
);
const SuperAdminModel=mongoose.model("SuperAdmin",superAdminSchema);
module.exports=SuperAdminModel;