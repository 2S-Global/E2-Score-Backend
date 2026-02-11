import User from "../models/userModel.js";
import Fields from "../models/additionalFieldsModels.js";
import Package from "../models/packageModel.js";
export const getAllFields = async (req, res) => {
    try {
        const company_id = req.userId;
        // Get company details once
        const company = await User.findById(company_id).select("transaction_fee transaction_gst allowed_verifications");

        if (!company) {
            return res.status(404).json({ success: false, message: "Company not found" });
        }

        // Get fields without repeating company
        const fields = await Fields.find({ company_id, is_del: false }).select("-company_id");

        res.status(200).json({
            success: true,
            message: "Fields fetched successfully",
           // company,
            data: fields,
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching fields", error: error.message });
    }
};

export const listFieldsByCompany = async (req, res) => {
    try {
        const company_id = req.userId;

        const plan_id=req.body.plan_id;

        const company = await User.findById(company_id).select("gst_no");
        if (!company) {
            return res.status(404).json({ success: false, message: "Company not found" });
        }
        console.log(plan_id);
        const packagedetails = await Package.findById(plan_id).select("transaction_fee transaction_gst allowed_verifications");

        if (!packagedetails) {
            return res.status(404).json({ success: false, message: "Package not found" });
        }

        console.log(packagedetails.allowed_verifications);

        const allowedTypes = (packagedetails.allowed_verifications || []).map(v => v.trim().toUpperCase());
        
        const allTypes = ["PAN", "AADHAAR", "DL", "EPIC", "PASSPORT", "UAN"];
        const allowedVerificationsObj = {};
        allTypes.forEach(type => {
          allowedVerificationsObj[type] = allowedTypes.includes(type);
        });

        // Overwrite original string field with the object
        const companyData = {
            ...company._doc,
            transaction_fee: packagedetails.transaction_fee,
            transaction_gst: packagedetails.transaction_gst,
            allowed_verifications: packagedetails.allowed_verifications,
            ...allowedVerificationsObj
        };

        // Get fields
        const fields = await Fields.find({ company_id, is_del: false }).select("-company_id");

        res.status(200).json({
            success: true,
            message: "Fields fetched successfully",
            company: companyData,
            data: fields,
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching fields", error: error.message });
    }
};