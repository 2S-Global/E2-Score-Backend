import User from "../../models/userModel.js";
import CandidateVerificationCart from "../../models/candidateVerificationCartModel.js";
import candidate_verification_price from "../../models/candidateVerificationPriceModel.js";

// Add Candidate Cart API
export const addCandidateCart123 = async (req, res) => {
  try {

    res.status(200).json({ resumeHeadline: "Candidate Verification Controller Running Successfully By Chandra Sarkar ! " });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addCandidateCart = async (req, res) => {
  try {
    const user_id = req.userId;
    if (!user_id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // 🔹 Fetch user from DB first
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const {
      plan,
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
      voterdoc,
      additionalfields,
      uannumber,
      uanname,
      uandoc,

      owner_id,
    } = req.body;

    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    const aadhaarRegex = /^\d{12}$/;
    const dlRegex = /^[A-Z]{2}\d{2}\d{11}$/;
    const epicRegex = /^[A-Z]{3}[0-9]{7}$/;
    const uanRegex = /^\d{12}$/;

    // Validate PAN
    if (pannumber && !panRegex.test(pannumber)) {
      return res
        .status(200)
        .json({ success: false, message: "Invalid PAN number format." });
    }

    // Validate Aadhaar
    if (aadhaarnumber && !aadhaarRegex.test(aadhaarnumber)) {
      return res
        .status(200)
        .json({ success: false, message: "Invalid Aadhaar number format." });
    }

    // Validate DL
    if (licensenumber && !dlRegex.test(licensenumber)) {
      return res.status(200).json({
        success: false,
        message: "Invalid Driving License number format.",
      });
    }

    // Validate EPIC
    if (voternumber && !epicRegex.test(voternumber)) {
      return res.status(200).json({
        success: false,
        message: "Invalid Voter ID (EPIC) number format.",
      });
    }

    // Validate UAN
    if (uannumber && !uanRegex.test(uannumber)) {
      return res
        .status(200)
        .json({ success: false, message: "Invalid UAN number format." });
    }

    let selectedDoc = null;

    if (pannumber) selectedDoc = "pan";
    else if (aadhaarnumber) selectedDoc = "aadhar";
    else if (licensenumber) selectedDoc = "driving_license";
    else if (passportnumber) selectedDoc = "passport";
    else if (voternumber) selectedDoc = "epic";
    else if (uannumber) selectedDoc = "uan";

    let price = 0;
    if (selectedDoc) {
      const priceDoc = await candidate_verification_price.findOne({ name: selectedDoc });
      if (!priceDoc) {
        return res.status(404).json({
          success: false,
          message: `Price not found for ${selectedDoc}`,
        });
      }
      price = priceDoc.price;
    }

    /*
    const packagedetails = await Package.findById(plan);
    if (!packagedetails) {
      return res
        .status(200)
        .json({ success: false, message: "Package Not Found.." });
    }
    const verificationamount = parseFloat(packagedetails.transaction_fee || 0);

    */

    const newUserCart = new CandidateVerificationCart({
      candidate_id: user_id,
      // plan: plan,
      amount: price,
      candidate_name: name,
      candidate_email: email,
      candidate_mobile: phone,
      candidate_dob: dob,
      candidate_address: address,
      candidate_gender: gender,
      pan_name: panname,
      pan_number: pannumber,
      aadhar_name: aadhaarname,
      aadhar_number: aadhaarnumber,
      dl_name: licensename,
      dl_number: licensenumber,
      passport_name: passportname,
      passport_file_number: passportnumber,
      epic_name: votername,
      epic_number: voternumber,
      additionalfields: additionalfields,
      uan_number: uannumber,
      uan_name: uanname,
    });

    await newUserCart.save();
    res.status(201).json({
      success: true,
      message: "User verification cart added successfully",
      data: newUserCart,
    });
  } catch (error) {
    console.error("Error adding user to cart:", error);
    res.status(401).json({
      success: false,
      message: "Error adding user verification cart",
      error: error.message,
    });
  }
};