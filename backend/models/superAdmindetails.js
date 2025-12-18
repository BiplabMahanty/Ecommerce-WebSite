const mongoose = require("mongoose");

const superAdminDetailsSchema = new mongoose.Schema(
    {
        companyName: {
            type: String,
           
        },
        address: {
            type: String,
            },
        contactEmail: {
            type: String,
        },
        contactPhone: {
            type: String,
        },

        details: {
            type: String,
            
        },
        departments: [{
            type: String, 
        }],


    },
    { timestamps: true }
);
const SuperAdminDetailsModel = mongoose.model(
    "SuperAdminDetails",
    superAdminDetailsSchema
);
module.exports = SuperAdminDetailsModel;