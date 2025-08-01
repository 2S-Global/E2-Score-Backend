import ListConunty from "../../models/company_Models/ListConunty.js";
import ListState from "../../models/company_Models/ListState.js";
import ListCity from "../../models/company_Models/ListCity.js";
import CompanyBranch from "../../models/company_Models/CompanyBranch.js";
import User from "../../models/userModel.js";

// Get Conunty

export const getConunty = async (req, res) => {
  try {
    const conunty = await ListConunty.find(
      { is_del: 0, is_active: 1 },
      { name: 1 }
    );
    res.status(200).json({
      success: true,
      data: conunty,
      message: "Conunty Data Fetched Successfully",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//Get State By Conunty

export const getStateByConunty = async (req, res) => {
  try {
    const conuntyId = req.params.id;

    if (!conuntyId) {
      return res.status(400).json({ message: "Conunty ID is required" });
    }

    const conunty = await ListConunty.findById(conuntyId);

    if (!conunty) {
      return res.status(404).json({ message: "Conunty not found" });
    }

    const state = await ListState.find(
      { is_del: 0, is_active: 1, countryId: conunty.id },
      { name: 1 }
    );

    if (!state) {
      return res.status(404).json({ message: "State not found" });
    }

    res.status(200).json({
      success: true,
      data: state,
      message: "State Data Fetched Successfully",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//Get City By State

export const getCityByState = async (req, res) => {
  try {
    const stateId = req.params.id;

    if (!stateId) {
      return res.status(400).json({ message: "State ID is required" });
    }

    const state = await ListState.findById(stateId);

    if (!state) {
      return res.status(404).json({ message: "State not found" });
    }

    const city = await ListCity.find(
      { is_del: 0, is_active: 1, stateId: state.id },
      { name: 1 }
    );

    if (!city) {
      return res.status(404).json({ message: "City not found" });
    }

    res.status(200).json({
      success: true,
      data: city,
      message: "City Data Fetched Successfully",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//add branch

export const addBranch = async (req, res) => {
  try {
    const { name, country, state, city, address, phone, email } = req.body;
    const userId = req.userId;

    // Validate required fields
    if (!userId || !name || !address || !phone || !email) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Validate email format
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email format" });
    }

    // Check if user exists
    const user = await User.findOne({ _id: userId, is_del: false });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Prevent duplicate branch
    const existingBranch = await CompanyBranch.findOne({
      userId,
      name,
      is_del: false,
    });
    if (existingBranch) {
      return res.status(409).json({
        success: false,
        message: "Branch with this name already exists",
      });
    }

    // Create branch
    const branch = new CompanyBranch({
      name,
      country,
      state,
      city,
      address,
      phone,
      email,
      userId,
    });

    await branch.save();
    res.status(201).json({
      success: true,
      data: branch,
      message: "Branch added successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const editBranch = async (req, res) => {
  try {
    const { name, country, state, city, address, phone, email, id } = req.body;
    const userId = req.userId;

    if (!userId || !id || !name || !address || !phone || !email) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Validate email format
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email format" });
    }

    // Check if user exists
    const user = await User.findOne({ _id: userId, is_del: false });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Find branch
    const branch = await CompanyBranch.findOne({
      _id: id,
      is_del: false,
      userId,
    });
    if (!branch) {
      return res
        .status(404)
        .json({ success: false, message: "Branch not found" });
    }

    // Prevent duplicate branch
    const existingBranch = await CompanyBranch.findOne({
      userId,
      name,
      is_del: false,
      _id: { $ne: id },
    });
    if (existingBranch) {
      return res.status(409).json({
        success: false,
        message: "Branch with this name already exists",
      });
    }

    // Update branch fields
    Object.assign(branch, {
      name,
      country,
      state,
      city,
      address,
      phone,
      email,
    });
    await branch.save();

    res.status(200).json({
      success: true,
      data: branch,
      message: "Branch updated successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteBranch = async (req, res) => {
  try {
    const { id } = req.body;
    const userId = req.userId;
    if (!userId || !id) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Check if user exists
    const user = await User.findOne({ _id: userId, is_del: false });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Find branch
    const branch = await CompanyBranch.findOne({
      _id: id,
      is_del: false,
      userId,
    });
    if (!branch) {
      return res
        .status(404)
        .json({ success: false, message: "Branch not found" });
    }

    // Delete branch
    branch.is_del = true;
    await branch.save();

    res.status(200).json({
      success: true,
      data: branch,
      message: "Branch deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getBranches = async (req, res) => {
  try {
    const userId = req.userId;

    // Check if user exists
    const user = await User.findOne({ _id: userId, is_del: false });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const branches = await CompanyBranch.find({ is_del: false, userId })
      .populate("country", "name _id")
      .populate("state", "name _id")
      .populate("city", "name _id");

    res.status(200).json({
      success: true,
      data: branches,
      message: "Branches fetched successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
