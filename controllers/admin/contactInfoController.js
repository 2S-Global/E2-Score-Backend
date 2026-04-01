import Contact from "../../models/ContactInfo.js";

// ✅ Insert Fake Data
export const insertFakeContacts = async (req, res) => {
  try {
    const fakeData = [
      {
        address: "Kolkata, West Bengal",
        phone: "9876543210",
        email: "test1@gmail.com",
      },
    ];

    const result = await Contact.insertMany(fakeData);

    res.status(201).json({
      success: true,
      message: "Fake contacts inserted",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Get All Contacts
export const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Update Contact
export const updateContact = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Contact.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Contact updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
