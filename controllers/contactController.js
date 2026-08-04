import Contact from "../models/contactModels.js";
import { emailQueue } from "../queues/emailQueue.js";

export const addContact = async (req, res) => {
  try {
    const { name, email, subject, message, dispute } = req.body;

    // Basic validation
    if (!name || !email || !subject || !message) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Save to DB
    const contact = new Contact({
      name,
      email,
      subject,
      message,
      dispute,
    });

    await contact.save();

    // Send email using queue
    await emailQueue.add("contact_submission", {
      name,
      email,
      subject,
      message,
      dispute,
    });

    // Response
    res.status(201).json({
      success: true,
      message: dispute
        ? "Dispute submitted and email sent successfully"
        : "Contact submitted and email sent successfully",
      data: contact,
    });
  } catch (error) {
    console.error("Error adding contact:", error);
    res.status(500).json({
      success: false,
      message: "Server error, please try again later",
    });
  }
};
