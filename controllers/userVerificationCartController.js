import UserCartVerification from "../models/userVerificationCartModel.js";
import mongoose from "mongoose";
// Register a new user

export const addUserToCart = async (req, res) => {
    try {

        const user_id = req.userId;
        //check user exists
        if (!user_id) {
            return res.status(400).json({ message: "User ID is required" });
        }


        const {
            name,
            email,
            phone,
            dob,
            address,
            gender,
            panname,
            pannumber,
            pandoc,
            aadhaarname,
            aadhaarnumber,
            aadhaardoc,
            licensename,
            licensenumber,
            licensenumdoc,
            passportname,
            passportnumber,
            passportdoc,
            votername,
            voternumber,
            voterdoc
        } = req.body;

        const newUserCart = new UserCartVerification({
            employer_id : user_id,
            candidate_name : name,
            candidate_email : email,
            candidate_mobile : phone,
            candidate_dob : dob,
            candidate_address : address,
            candidate_gender : gender,
            pan_name : panname,
            pan_number : pannumber,
            pan_image : pandoc,
            aadhar_name : aadhaarname,
            aadhar_number : aadhaarnumber,
            aadhar_image : aadhaardoc,
            dl_name : licensename,
            dl_number : licensenumber,
            dl_image : licensenumdoc,
            passport_name : passportname,
            passport_file_number : passportnumber,
            passport_image : passportdoc,
            epic_name : votername,
            epic_number : voternumber,
            epic_image : voterdoc
        });

        await newUserCart.save();
        res.status(201).json({ success: true, message: "User verification cart added successfully", data: newUserCart });
    } catch (error) {
        res.status(401).json({ success: false, message: "Error adding user verification cart", error: error.message });
    }
};

/* export const getUserVerificationCartByEmployer = async (req, res) => {
    try {
        const employer_id = req.userId;
        const userCarts = await UserCartVerification.find({ employer_id, is_del: false });

        let totalVerifications = 0;

        userCarts.forEach(cart => {
            if (cart.pan_number) totalVerifications++;
            if (cart.aadhar_number) totalVerifications++;
            if (cart.dl_number) totalVerifications++;
            if (cart.passport_file_number) totalVerifications++;
            if (cart.epic_number) totalVerifications++;
        });

        const verificationCharge = 50;
        const subtotal = totalVerifications * verificationCharge;
        const gst = subtotal * 0.18;
        const total = subtotal + gst;

        res.status(200).json({ 
            success: true, 
            data: userCarts,
            billing: {
            //    total_verifications: totalVerifications,
                subtotal: subtotal.toFixed(2),
                gst: gst.toFixed(2),
                total: total.toFixed(2)
            }
        });
    } catch (error) {
        res.status(401).json({ success: false, message: "Error fetching user verification carts", error: error.message });
    }
}; */

export const getUserVerificationCartByEmployer = async (req, res) => {
    try {
        const employer_id = req.userId;
        const verificationCharge = 50;

        const userCarts = await UserCartVerification.find({ employer_id, is_del: false });

        let overallTotalVerifications = 0;
        let overallSubtotal = 0;

        // Prepare formatted response
        const formattedData = userCarts.map((cart, index) => {
            const payForArray = [];

            if (cart.pan_number) payForArray.push("PAN");
            if (cart.aadhar_number) payForArray.push("Aadhaar");
            if (cart.dl_number) payForArray.push("Driving Licence");
            if (cart.passport_file_number) payForArray.push("Passport");
            if (cart.epic_number) payForArray.push("Voter ID (EPIC)");

            const totalVerifications = payForArray.length;
            const subtotal = totalVerifications * verificationCharge;

            overallTotalVerifications += totalVerifications;
            overallSubtotal += subtotal;

            return {
                id: index + 1,
                name: cart.candidate_name,
                mobile: cart.candidate_mobile || "",
                payFor: payForArray.join(", "),
                amount: subtotal
            };
        });

        const overallGst = overallSubtotal * 0.18;
        const overallTotal = overallSubtotal + overallGst;

        res.status(200).json({
            success: true,
            data: formattedData,
            overall_billing: {
                total_verifications: overallTotalVerifications,
                subtotal: overallSubtotal.toFixed(2),
                gst: overallGst.toFixed(2),
                total: overallTotal.toFixed(2)
            }
        });

    } catch (error) {
        res.status(401).json({ success: false, message: "Error fetching user verification carts", error: error.message });
    }
};

