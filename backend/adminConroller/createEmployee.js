const AdminModel=require("../models/admin");
const EmployeeModel=require("../models/employee");
const bcrypt = require("bcrypt");

const addEmployee= async (req,res)=>{

    try {

        const {name,email,password,phone,position,salary,department,dateOfJoining,status,createById}=req.body;
         let image = req.file ? `uploads/${req.file.filename}` : null;
        if (!name||!email||!phone||!position||!salary||!password) {
            return res.status(400).json({
                message: " not find",
                success: false,
            });
        }

        const admin=await AdminModel.findById(createById);



        if (!admin) {
            return res.status(400).json({
                message: "admin not find",
                success: false,
            });
            
        }

    const hashedPassword = await bcrypt.hash(password, 10);


    const newEmp=new EmployeeModel({
            name,
            email,
            password:hashedPassword,
            phone,
            position,
            salary,
            department,
            dateOfJoining,
            status,
            employeeImage:image,
            createById
        })
        await newEmp.save();
        
    } catch (error) {
         console.error(error);
        res.status(500).json({
            message: "Internal server error",
            success: false,
        });
    }

}
module.exports={addEmployee}