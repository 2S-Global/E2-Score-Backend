import UserCartVerification from "../models/userVerificationCartModel.js";
import UserVerification from "../models/userVerificationModel.js";
import User from "../models/userModel.js";
import UserCartVerificationAadhatOTP from "../models/userVerificationCartAadhatOTPModel.js";
import CompanyPackage from "../models/companyPackageModel.js";
import freeVerificationDetail from "../models/freeVerificationDetailsModel.js";
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
            voterdoc,
            uannumber
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
            epic_image : voterdoc,
            uan_number:uannumber
        });

        await newUserCart.save();
        res.status(201).json({ success: true, message: "User verification cart added successfully", data: newUserCart });
    } catch (error) {
        res.status(401).json({ success: false, message: "Error adding user verification cart", error: error.message });
    }
};


export const getUserVerificationCartByEmployerAll = async (req, res) => {
    try {
        const employer_id = req.userId;
        const userCarts = await UserCartVerification.find({ employer_id, is_del: false });

        let totalVerifications = 0;
        const verificationCharge = 50;

        // Process each user's cart
        const userData = userCarts.map(cart => {
            let payFor = [];

            if (cart.pan_number) {
                totalVerifications++;
                payFor.push("PAN");
            }
            if (cart.aadhar_number) {
                totalVerifications++;
                payFor.push("Aadhar");
            }
            if (cart.dl_number) {
                totalVerifications++;
                payFor.push("Driving Licence");
            }
            if (cart.passport_file_number) {
                totalVerifications++;
                payFor.push("Passport");
            }
            if (cart.epic_number) {
                totalVerifications++;
                payFor.push("EPIC");
            }

            return {
                ...cart._doc,  // Spread existing user cart data
                selected_verifications: payFor.join(",") // Add pay_for to each user entry
            };
        });

        const subtotal = totalVerifications * verificationCharge;
        const gst = subtotal * 0.18;
        const total = subtotal + gst;

        res.status(200).json({ 
            success: true, 
            data: userData, // Updated user list with pay_for field
            billing: {
                subtotal: subtotal.toFixed(2),
                gst: gst.toFixed(2),
                total: total.toFixed(2)
            }
        });
    } catch (error) {
        res.status(401).json({ success: false, message: "Error fetching user verification carts", error: error.message });
    }
};




export const getUserVerificationCartByEmployerAll_OLD = async (req, res) => {
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
};

export const getUserVerificationCartByEmployer = async (req, res) => {
    try {
        const employer_id = req.userId;
        const verificationCharge = 50;

        const userCarts = await UserCartVerification.find({ employer_id, is_del: false,is_paid:0 });

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
                id: cart._id,
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

export const getPaidUserVerificationCartByEmployer = async (req, res) => {
    try {
        // Assuming the userId is available from authentication middleware (e.g., JWT)
        const employer_id = req.userId;

        // Check if employer_id is a valid ObjectId (Optional, but recommended)
        if (!mongoose.Types.ObjectId.isValid(employer_id)) {
            return res.status(400).json({ message: "Invalid employer ID" });
        }

        // Fetch users with paid verification and sort by createdAt in descending order
        const paidUsers = await UserVerification.find({ employer_id })
            .sort({ createdAt: -1 });

        if (!paidUsers.length) {
            return res.status(404).json({ message: "No paid users found for this employer" });
        }

        // Return the fetched users
        res.status(200).json(paidUsers);
    } catch (error) {
        console.error("Error fetching paid users:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.body;

        // Validate ID
        if (!id) {
            return res.status(400).json({ message: "ID is required" });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid ID format" });
        }

        // Delete user from database
        const deletedUser = await UserCartVerification.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Fetch updated user cart after deletion
        const employer_id = req.userId;
        const verificationCharge = 50;

        const userCarts = await UserCartVerification.find({ employer_id });

        let overallTotalVerifications = 0;
        let overallSubtotal = 0;

        // Prepare formatted response
        const formattedData = userCarts.map((cart) => {
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
                id: cart._id,
                name: cart.candidate_name,
                mobile: cart.candidate_mobile || "",
                payFor: payForArray.join(", "),
                amount: subtotal
            };
        });

        const overallGst = overallSubtotal * 0.18;
        const overallTotal = overallSubtotal + overallGst;

        return res.status(200).json({
            message: "User deleted successfully",
            updatedCart: {
                success: true,
                data: formattedData,
                overall_billing: {
                    total_verifications: overallTotalVerifications,
                    subtotal: overallSubtotal.toFixed(2),
                    gst: overallGst.toFixed(2),
                    total: overallTotal.toFixed(2)
                }
            }
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error deleting user",
            error: error.message,
        });
    }
};

export const getCartDetailsAadhatOTP = async (req, res) => {
  try {
    const employer_id = req.userId;
    const employer = await User.findOne({
      _id: employer_id,
      is_del: false,
    });
    if (!employer) {
      return res
        .status(404)
        .json({ success: false, message: "Employer not found" });
    }
    const userCarts = await UserCartVerificationAadhatOTP.find({
      employer_id,
      is_del: false,
    });

    // starts from here

    let verificationCharge = 0;

    if (employer.role === 3) {
      // Skip CompanyPackage if role = 3
      verificationCharge = parseFloat(userCarts[0]?.amount_for_demo_user) || 0; // or 50 (set default price if needed)
    } else {
      // Use company package for all other roles
      const discountPercentData = await CompanyPackage.findOne({
        companyId: employer_id,
      });

      verificationCharge = parseFloat(discountPercentData?.aadhar_price || 0);
    }

    // my code ends here

    /*
    const discountPercentData = await CompanyPackage.findOne({
      companyId: employer_id,
    });
 
    const verificationCharge = parseFloat(
      discountPercentData.aadhar_price || 0
    );
    */

    // it will end here

    const gstPercent = 18 / 100;

    let totalVerifications = 0;
    // const verificationCharge = 50;

    // Process each user's cart

    console.log("Verification Charge ==>", verificationCharge);
    const userData = userCarts.map((cart) => {
      let payFor = [];

      if (cart.aadhar_number) {
        totalVerifications++;
        payFor.push("Aadhar With OTP");
      }

      return {
        ...cart._doc, // Spread existing user cart data
        selected_verifications: payFor.join(","), // Add pay_for to each user entry
      };
    });

    const subtotal = totalVerifications * verificationCharge;

    const gstAmount = subtotal * gstPercent;
    const total = subtotal + gstAmount;

    const cgst = gstAmount / 2;
    const sgst = gstAmount / 2;

    res.status(200).json({
      success: true,
      data: userData, // Updated user list with pay_for field
      billing: {
        total_verifications: totalVerifications,
        wallet_amount: employer.wallet_amount || "0.00",
        fund_status: "NA",
        subtotal: subtotal.toFixed(2),
        discount: "0.00",
        discount_percent: "0.00",
        cgst: cgst.toFixed(2),
        cgst_percent: (gstPercent * 50).toFixed(2),
        sgst: sgst.toFixed(2),
        sgst_percent: (gstPercent * 50).toFixed(2),
        total: total.toFixed(2),
      },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Error fetching user verification carts",
      error: error.message,
    });
  }
};

export const addUserToCartAadharOTP = async (req, res) => {
  try {
    const user_id = req.userId;
    if (!user_id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findOne({
      _id: user_id,
      is_del: false,
    });

    if (!user) {
      return res.status(400).json({ message: "User Not Found" });
    }

    // Skip package check for role 3
    if (user.role !== 3) {
      const companyPackage = await CompanyPackage.findOne({
        companyId: user_id,
        is_del: false,
      });

      if (!companyPackage || companyPackage.aadhar_otp !== "enable") {
        return res.status(200).json({
          success: false,
          message: "Aadhar OTP verification is not enabled for this company.",
        });
      }
    }

    // Check for existing unpaid cart
    const existingCart = await UserCartVerificationAadhatOTP.findOne({
      employer_id: user_id,
      is_paid: 0,
    });

    if (existingCart) {
      return res.status(200).json({
        success: false,
        message:
          "A cart already exists for this user. Please complete the payment before adding a new one.",
      });
    }

    // Clean owner_id before destructuring
    if (req.body.owner_id === "null" || req.body.owner_id === "") {
      delete req.body.owner_id;
    }

    const {
      name,
      email,
      phone,
      dob,
      address,
      gender,
      aadhar_name,
      aadhar_number,
      aadhaardoc,
      owner_id, // this will be undefined if deleted above
    } = req.body;

    const aadharImageUrl = req.files?.aadhaardoc
      ? await uploadToCloudinary(
          req.files.aadhaardoc[0].buffer,
          req.files.aadhaardoc[0].originalname,
          req.files.aadhaardoc[0].mimetype
        )
      : null;

    // Special case for Demo User (role 3)
    let docType = "";
    let docNumber = "";
    let docFile = null;
    if (req.body.aadhar_number) {
      docType = "AADHAR";
      docNumber = req.body.aadhar_number;
      docFile = req.body.aadhaardoc;
    }
    const FREE_VERIFICATION_LIMIT = 1;
    let amount_for_demo_user = 0;
    if (user.role === 3) {
      const usedFree = await freeVerificationDetail.countDocuments({
        userId: user_id,
        free: true,
      });

      // Role 3 → Ignore package/plan, allow free verification
      if (usedFree < FREE_VERIFICATION_LIMIT) {
        await freeVerificationDetail.create({
          userId: user_id,
          docType,
          docNumber,
          free: true,
          status: "success",
        });
      } else {
        const verificationCartDetailsAadhar =
          await UserCartVerificationAadhatOTP.findOne({
            employer_id: user_id,
            is_del: false,
          });

        const verificationCartDetails = await UserCartVerification.findOne({
          employer_id: user_id,
          is_del: false,
        });

        if (
          (verificationCartDetailsAadhar &&
            verificationCartDetailsAadhar.is_paid === 0) ||
          (verificationCartDetails && verificationCartDetails.is_paid === 0)
        ) {
          const cartAmountAadhar = verificationCartDetailsAadhar
            ? parseInt(verificationCartDetailsAadhar.amount_for_demo_user, 10)
            : null;

          const cartAmount = verificationCartDetails
            ? parseInt(verificationCartDetails.amount, 10)
            : null;

          if (cartAmountAadhar === 0 || cartAmount === 0) {
            return res.status(200).json({
              success: false,
              message:
                "You already have a pending order. Please complete the payment for your current order (free trial) before adding a new one.",
            });
          }
        }
        amount_for_demo_user = parseFloat(user.demoUserAmount || 0);
      }
    }

    const newUserCart = new UserCartVerificationAadhatOTP({
      employer_id: user_id,
      candidate_name: name,
      candidate_email: email,
      candidate_mobile: phone,
      candidate_dob: dob,
      candidate_address: address,
      candidate_gender: gender,
      aadhar_name: aadhar_name,
      aadhar_number: aadhar_number,
      aadhar_image: aadharImageUrl,
      amount_for_demo_user: amount_for_demo_user,
      ...(owner_id && { owner_id }), // ✅ only include if exists
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

export const deleteUserAadharOTP = async (req, res) => {
  try {
    const { id } = req.body;
    const user_id = req.userId;

    // Validate ID
    if (!id) {
      return res.status(400).json({ message: "ID is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    // starts here

    const verificationCartDetails = await UserCartVerificationAadhatOTP.findOne(
      {
        employer_id: user_id,
        is_del: false,
        is_paid: 0,
      }
    );

    if (verificationCartDetails && verificationCartDetails.is_paid === 0) {
      console.log("For deleting purpose I am inside if block: ");
      const cartAmount = verificationCartDetails
        ? parseInt(verificationCartDetails.amount_for_demo_user, 10)
        : 0;

      console.log(
        "For deleting purpose I am inside if block:   amoutn==> ",
        cartAmount
      );

      if (cartAmount === 0) {
        console.log("I am inside delete happen block");
        const deletedFreeVerification =
          await freeVerificationDetail.findOneAndDelete({ userId: user_id });
      }
    }

    // ends here

    // Delete user from database
    const deletedUser = await UserCartVerificationAadhatOTP.findByIdAndDelete(
      id
    );

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Added: Check if employer/user exists before updating
    const user = await User.findOne({ _id: user_id, is_del: false });

    if (user) {
      await User.findByIdAndUpdate(user._id, {
        $set: { freeVerificationUsed: false },
      });
    }

    return res.status(200).json({
      success: true,
      data: [],
      overall_billing: {
        total_verifications: 0,
        wallet_amount: "0.00",
        fund_status: "0",
        subtotal: "0.00",
        discount: "0.00",
        discount_percent: "0.00",
        cgst: "0.00",
        cgst_percent: "0.00",
        sgst: "0.00",
        sgst_percent: "0.00",
        total: "0.00",
      },
      message: "No unpaid verification cart items found.",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error deleting user",
      error: error.message,
    });
  }
};