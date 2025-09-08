import User from "../../models/userModel.js";
import CandidateVerificationCart from "../../models/candidateVerificationCartModel.js";
import candidate_verification_price from "../../models/candidateVerificationPriceModel.js";
import ListVerificationList from "../../models/monogo_query/verificationListModel.js";
import mongoose from "mongoose";
import allOrdersData from "../../models/allOrders.js";
import generateInvoiceNo from "../Helpers/generateInvoiceno.js";
import CandidateVerification from "../../models/candidateVerificationModel.js";
import Transaction from "../../models/transactionModel.js";
import nodemailer from "nodemailer";

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

// Delete Candidate Cart API
export const deleteCandidateCart = async (req, res) => {
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

    // Delete user from database
    const deletedUser = await CandidateVerificationCart.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Candidate user cart deleted successfully !",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error deleting user",
      error: error.message,
    });
  }
};

// Pay now Candidate Cart
export const payNowCandidateCart = async (req, res) => {
  try {

    console.log("payNowCandidateCart API is running from frontend: ");


    const employer_id = req.userId;

    if (!employer_id) {
      return res.status(400).json({ error: "User ID is missing." });
    }

    const {
      razorpay_response,
      amount,
      paymentIds,
      payment_method,
      overall_billing,
    } = req.body;

    if (!amount || !payment_method) {
      return res.status(400).json({ error: "Payment details are incomplete." });
    }

    const user = await User.findById(employer_id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (payment_method === "online") {
      if (!razorpay_response?.razorpay_payment_id) {
        return res
          .status(400)
          .json({ error: "Razorpay payment ID is missing." });
      }
    } else {
      return res.status(400).json({ error: "Invalid payment method." });
    }

    // Add all data in Orders Table
    //const moment = require('moment');
    // Get current date and time
    //const now = ${Date.now()};
    // Generate order number
    const orderNumber = `ORD-${Date.now()}`;

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNo();

    const newUserCart = new allOrdersData({
      candidate_id: employer_id,
      order_number: orderNumber,
      invoice_number: invoiceNumber,
      subtotal: overall_billing.subtotal,
      cgst: overall_billing.cgst,
      cgst_percent: overall_billing.cgst_percent,
      sgst: overall_billing.sgst,
      sgst_percent: overall_billing.sgst_percent,
      total_amount: overall_billing.total,
      discount_percent: overall_billing.discount_percent,
      discount_amount: overall_billing.discount,
      total_numbers_users: overall_billing.total_verifications,
    });

    const savedCart = await newUserCart.save();
    const insertedId = savedCart._id;

    // Update is_paid field
    const updatedUsers = await CandidateVerificationCart.updateMany(
      { candidate_id: employer_id },
      { $set: { is_paid: 1, createdAt: new Date(), order_ref_id: insertedId } }
    );

    if (updatedUsers.modifiedCount === 0) {
      return res
        .status(404)
        .json({ message: "No users found for this User" });
    }

    // Fetch all cart items for this order
    const cartItems = await CandidateVerificationCart.find({
      order_ref_id: insertedId,
    }).populate("candidate_id", "name email");

    //candidate_id,

    // Step 2: Group by candidate
    const groupedCandidates = {};

    cartItems.forEach((item) => {
      const candidate = item.candidate_id; // populated User doc
      const key = candidate._id.toString();

      if (!groupedCandidates[key]) {
        groupedCandidates[key] = {
          candidate_name: candidate.name || "N/A",
          candidate_email: candidate.email || "N/A",
          verifications: [],
          totalAmount: 0,
        };
      }

      // Map verification_type to a readable label
      let payFor = "Unknown";
      if (item.verification_type === "pan") payFor = "PAN";
      else if (item.verification_type === "aadhar") payFor = "Aadhaar";
      else if (item.verification_type === "driving_license") payFor = "Driving Licence";
      else if (item.verification_type === "passport") payFor = "Passport";
      else if (item.verification_type === "epic") payFor = "Voter ID (EPIC)";
      else if (item.verification_type === "uan") payFor = "UAN";

      groupedCandidates[key].verifications.push(payFor);

      // Add amount if available
      groupedCandidates[key].totalAmount += item.amount || 0;
    });

    // Step 3: Build rows (one per candidate, multiple verifications merged)
    const orderDetailsTable = Object.values(groupedCandidates)
      .map((candidate, index) => {
        const selectedVerifications = candidate.verifications.join(", ");

        return `
      <tr>
        <td style="text-align: center;">${index + 1}</td>
        <td style="text-align: center;">${candidate.candidate_name}</td>
        <td style="text-align: center;">${candidate.candidate_email}</td>
        <td style="text-align: center;">${selectedVerifications}</td>
        <td style="text-align: center;">₹${candidate.totalAmount}</td>
      </tr>
    `;
      })
      .join("");

    // Step 4: Wrap in table
    const emailTable = `
  <table border="1" cellpadding="8" cellspacing="0" style="width: 100%; border-collapse: collapse;">
    <thead>
      <tr>
        <th>S.No</th>
        <th>Candidate Name</th>
        <th>Candidate Email</th>
        <th>Paid for</th>
        <th>Total Amount</th>
      </tr>
    </thead>
    <tbody>
      ${orderDetailsTable}
    </tbody>
  </table>
`;

    const usersToArchive = await CandidateVerificationCart.find({
      candidate_id: employer_id,
      is_paid: 1,
    });

    if (usersToArchive.length === 0) {
      return res.status(404).json({ message: "No updated users to archive" });
    }

    // ✅ Generate and assign order_id to each record
    const orderPrefix = `ORD-${Date.now()}`;
    const usersWithOrderId = usersToArchive.map((user, index) => {
      const obj = user.toObject();
      obj.order_id = `${orderPrefix}-${index + 1}`;
      delete obj._id; // Remove _id so MongoDB can generate a new one
      return obj;
    });

    await CandidateVerification.insertMany(usersWithOrderId);

    const userIds = usersToArchive.map((user) => user._id);

    await CandidateVerificationCart.deleteMany({
      candidate_id: employer_id,
      is_paid: 1,
    });

    const transaction = new Transaction({
      candidate_id: employer_id,
      order_ref_id: insertedId,
      transactionId:
        payment_method === "online"
          ? razorpay_response.razorpay_payment_id
          : "Not Defined",
      amount: amount,
      paymentids: paymentIds || null,
      order_ids: userIds.join(","),
      payment_method: payment_method,
      payment_type: "debit",
    });

    await transaction.save();

    // Send email with login credentials
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: true, // true for port 465
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Geisil Team" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Order Confirmation : QuikChek - Thank You for Your Purchase!",
      html: `
      <div style="text-align: center; margin-bottom: 20px;">
    <img src="https://res.cloudinary.com/da4unxero/image/upload/v1745565670/QuikChek%20images/New%20banner%20images/bx5dt5rz0zdmowryb0bz.jpg" alt="Banner" style="width: 100%; height: auto;" />
  </div>
        <p>Dear <strong>${user.name}</strong>,</p>
        <p>Thank you for shopping with QuikChek. We have successfully received your order, and it's now being processed.</p>
        <p><strong>Order Details:</strong></p>
        <p>Order Number: #${orderNumber}</p>
        <p>Payment Amount: #${overall_billing.total}</p>
        <p>Payment Method: Online</p>

        <p>Thank you for shopping with QuikChek. Here are your order details:</p>
        ${emailTable}
      
        <p>If you have any questions or need further assistance, feel free to reach out to our support team at support@quikchek.in or call us at 8697744701.</p>
        <p>Thank you for choosing QuikChek. We appreciate your trust in us and look forward to serving you again.</p>
        <br />
        <p>Sincerely,<br />
        The Admin Team<br />
        <strong>Global Employability Information Services India Limited</strong></p>

        <div style="text-align: center; margin-top: 30px;">
      <img src="https://res.cloudinary.com/da4unxero/image/upload/v1746776002/QuikChek%20images/ntvxq8yy2l9de25t1rmu.png" alt="Footer" style="width:97px; height: 116px;" />
    </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    const mailOptions2 = {
      from: `"Geisil Team" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Payment Received: QuikChek - Your Order is Confirmed!",
      html: `
      <div style="text-align: center; margin-bottom: 20px;">
    <img src="https://res.cloudinary.com/da4unxero/image/upload/v1745565670/QuikChek%20images/New%20banner%20images/bx5dt5rz0zdmowryb0bz.jpg" alt="Banner" style="width: 100%; height: auto;" />
  </div>
        <p>Dear <strong>${user.name}</strong>,</p>
        <p>Thank you for your payment! We are pleased to inform you that your payment for Order #${orderNumber} has been successfully processed.</p>
       
        <p>Thank you for shopping with QuikChek. Here are your order details:</p>
        ${emailTable}
      
        <p>If you have any questions or need further assistance, feel free to reach out to our support team at support@quikchek.in or call us at 8697744701.</p>
        <p>Thank you for choosing QuikChek. We appreciate your trust in us and look forward to serving you again.</p>
        <br />
        <p>Sincerely,<br />
        The Admin Team<br />
        <strong>Global Employability Information Services India Limited</strong></p>

                <div style="text-align: center; margin-top: 30px;">
      <img src="https://res.cloudinary.com/da4unxero/image/upload/v1746776002/QuikChek%20images/ntvxq8yy2l9de25t1rmu.png" alt="Footer" style="width:97px; height: 116px;" />
    </div>
      `,
    };

    await transporter.sendMail(mailOptions2);

    const mailOptions3 = {
      from: `"Geisil Team" <${process.env.EMAIL_USER}>`,
      to: "kp.sunit@gmail.com",
      subject:
        "Payment Received: QuikChek - " +
        user.name +
        " Has Paid for Order #" +
        orderNumber,
      cc: ["kp.sunit@gmail.com", "avik@2sglobal.co", "dipanwita@2sglobal.co"],
      html: `
    <div style="text-align: center; margin-bottom: 20px;">
      <img src="https://res.cloudinary.com/da4unxero/image/upload/v1745565670/QuikChek%20images/New%20banner%20images/bx5dt5rz0zdmowryb0bz.jpg" alt="Banner" style="width: 100%; height: auto;" />
    </div>

    <p>Dear <strong>Admin</strong>,</p>

    <p>We are pleased to inform you that <strong>${user.name}</strong> has successfully completed the payment for <strong>Order #${orderNumber}</strong> via QuikChek.
    Amount: <strong>₹ ${amount}</strong>
    </p>

    <p>Below are the order details:</p>
    ${emailTable}

    <p>Please process the order accordingly and ensure timely delivery/service.</p>

    <p>If you need any assistance, feel free to contact us at <a href="mailto:support@quikchek.in">support@quikchek.in</a> or call <strong>8697744701</strong>.</p>

    <p>Thank you for being a part of the QuikChek team!</p>

    <br />
    <p>Sincerely,<br />
    The Admin Team<br />
    <strong>Global Employability Information Services India Limited</strong></p>

    <div style="text-align: center; margin-top: 30px;">
      <img src="https://res.cloudinary.com/da4unxero/image/upload/v1746776002/QuikChek%20images/ntvxq8yy2l9de25t1rmu.png" alt="Footer" style="width:97px; height: 116px;" />
    </div>
  `,
    };

    await transporter.sendMail(mailOptions3);

    return res.status(200).json({
      message:
        "Payment processed, verifications archived, and transaction recorded",
      archivedUsersCount: usersWithOrderId.length,
      remainingWalletBalance: user.wallet_amount,
    });
  } catch (error) {
    console.error("Payment Error:", error);
    return res.status(500).json({
      message: "Error processing payment22",
      error: error.message,
    });
  }
};