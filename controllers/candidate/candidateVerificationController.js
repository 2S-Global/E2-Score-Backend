import User from "../../models/userModel.js";
import CandidateVerificationCart from "../../models/candidateVerificationCartModel.js";
import candidate_verification_price from "../../models/candidateVerificationPriceModel.js";
import ListVerificationList from "../../models/monogo_query/verificationListModel.js";

// Add Candidate Cart API
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

    const { fieldname, name, number } = req.body;

    if (!fieldname || !name || !number) {
      return res
        .status(400)
        .json({ success: false, message: "fieldname, name, and number are required" });
    }

    // -------------------------
    // Fetch regex dynamically from list_verification_lists
    // -------------------------
    const verificationMeta = await ListVerificationList.findOne({
      verification_name: fieldname,
      isDel: false,
      isActive: true,
    });

    if (!verificationMeta) {
      return res.status(404).json({
        success: false,
        message: `Verification config not found for ${fieldname}`,
      });
    }

    const regex = new RegExp(verificationMeta.regex);
    if (!regex.test(number)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${fieldname.toUpperCase()} number format.`,
      });
    }

    // -------------------------
    // Fetch price dynamically
    // -------------------------
    const priceDoc = await candidate_verification_price.findOne({ name: fieldname });
    if (!priceDoc) {
      return res.status(404).json({
        success: false,
        message: `Price not found for ${fieldname}`,
      });
    }

    // Save to cart
    const newUserCart = new CandidateVerificationCart({
      candidate_id: user_id,
      candidate_name: name,
      amount: priceDoc.price,
      fields: {
        number: number,
        name: name,
      },
      verification_type: fieldname,
    });

    await newUserCart.save();

    res.status(201).json({
      success: true,
      message: `${fieldname.toUpperCase()} added to cart successfully`,
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

// List Candidate Cart API
export const listCandidateCart = async (req, res) => {
  try {
    const user_id = req.userId;

    // Ensure employer is valid
    const candidate = await User.findOne({
      _id: user_id,
      is_del: false,
    });

    if (!candidate) {
      return res
        .status(404)
        .json({ success: false, message: "Candidate not found" });
    }

    const userCarts = await CandidateVerificationCart.find({
      candidate_id: user_id,
      is_del: false,
      is_paid: 0,
    });

    console.log("I am inside listCandidateCart API: ");
    console.log("Here are my cart details: ", userCarts);

    if (!userCarts || userCarts.length === 0) {
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
    }

    let overallTotalVerifications = 0;
    let overallSubtotal = 0;
    let gstPercent = 18 / 100;

    let discountPercent = 0;

    const formattedData = await Promise.all(
      userCarts.map(async (cart) => {
        // console.log("Plan ID ==>>", cart.plan);

        const verificationCharge = parseFloat(cart.amount) || 0;

        let payFor = "Unknown";
        if (cart.verification_type === "pan") payFor = "PAN";
        else if (cart.verification_type === "aadhar") payFor = "Aadhaar";
        else if (cart.verification_type === "driving_license") payFor = "Driving Licence";
        else if (cart.verification_type === "passport") payFor = "Passport";
        else if (cart.verification_type === "epic") payFor = "Voter ID (EPIC)";
        else if (cart.verification_type === "uan") payFor = "UAN";


        const totalVerifications = 1;

        const subtotal = verificationCharge;

        overallTotalVerifications += totalVerifications;
        overallSubtotal += subtotal;

        return {
          id: cart._id,
          name: cart.candidate_name,
          // mobile: cart.candidate_mobile || "",
          payFor: payFor,
          amount: subtotal,
        };
      })
    );

    const discountAmount = overallSubtotal * discountPercent;
    const discountedSubtotal = overallSubtotal - discountAmount;

    const gstAmount = discountedSubtotal * gstPercent;
    const cgst = gstAmount / 2;
    const sgst = gstAmount / 2;

    const total = discountedSubtotal + gstAmount;

    //  const fundStatus = wallet_amount >= total ? "1" : "0";

    res.status(200).json({
      success: true,
      data: formattedData,
      overall_billing: {
        total_verifications: overallTotalVerifications,
        wallet_amount: candidate.wallet_amount || "0.00",
        fund_status: "NA",
        subtotal: overallSubtotal.toFixed(2),
        discount: discountAmount.toFixed(2),
        discount_percent: (discountPercent * 100).toFixed(2),
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
      message: "Error fetching candidate verification carts",
      error: error.message,
    });
  }
};