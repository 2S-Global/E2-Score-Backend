import ListConunty from "../../models/company_Models/ListConunty.js";
import ListState from "../../models/company_Models/ListState.js";
import ListCity from "../../models/company_Models/ListCity.js";
import CompanyBranch from "../../models/company_Models/CompanyBranch.js";
import User from "../../models/userModel.js";
import Employment from "../../models/Employment.js";
import CandidateDetails from "../../models/CandidateDetailsModel.js";
import mongoose from "mongoose";
import list_tbl_countrie from "../../models/monogo_query/countriesModel.js";
import personalDetails from "../../models/personalDetails.js";
import list_gender from "../../models/monogo_query/genderModel.js";

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

export const getUserAssociatedWithCompany = async (req, res) => {
  try {
    const company_id = req.companyId;

    if (!company_id) {
      return res.status(400).json({
        success: false,
        message: "company_id is required in query parameter",
      });
    }

    // Search employments collection where companyName = company_id
    const employments = await Employment.find({ companyName: company_id, isVerified: false });

    if (!employments || employments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No users found for this company",
      });
    }

    const userIds = [
      ...new Set(employments.map(emp => emp.user.toString())),
    ].map(id => new mongoose.Types.ObjectId(id));

    // 3. Fetch user details (name, photo)
    const users = await User.find(
      { _id: { $in: userIds } },
      {
        name: 1,
        email: 1,
        profilePicture: 1
      } // only select required fields
    ).lean();

    // 4. Fetch candidate details (currentLocation, countryId, hometown)
    const candidateDetails = await CandidateDetails.find(
      { userId: { $in: userIds } },
      { currentLocation: 1, country_id: 1, hometown: 1, userId: 1 }
    ).lean();

    // 4. Collect unique countryIds
    const countryIds = [...new Set(candidateDetails.map(c => c.country_id).filter(Boolean))];

    // 5. Fetch country details
    const countries = await list_tbl_countrie.find(
      { id: { $in: countryIds } },
      { name: 1, id: 1 }
    ).lean();

    // Create a lookup map: countryId → countryName
    const countryMap = {};
    countries.forEach(c => {
      countryMap[c.id.toString()] = c.name;
    });

    // 5. Merge all results

    /*
    const result = userIds.map(userId => {

      const user = users.find(u => u._id && u._id.equals(userId));
      const employment = employments.find(e => e.user && e.user.equals(userId));
      const candidate = candidateDetails.find(c => c.userId && c.userId.equals(userId));

      const countryId = candidate && candidate.country_id ? candidate.country_id.toString() : null;
      const countryName = countryId && countryMap[countryId] ? countryMap[countryId] : "Not Provided";

      return {
        userId,
        name: user && user.name ? user.name : "N/A",
        email: user && user.email ? user.email : "N/A",
        photo: user && user.profilePicture ? user.profilePicture : null,
        jobTitle: employment && employment.jobTitle ? employment.jobTitle : "Not Provided",
        //currentLocation: candidate && candidate.currentLocation ? candidate.currentLocation : "Not Provided",
        //countryId: candidate && candidate.country_id ? candidate.country_id : null,
        //countryName: countryName,
        // hometown: candidate && candidate.hometown ? candidate.hometown : "Not Provided",
        // currentAddress: `${candidate?.currentLocation || "Not Provided"}, ${countryName}`,
      };
    });
    */

    // 6. Build result based on employments (not unique users)
    const result = employments.map(emp => {
      const user = users.find(u => u._id && u._id.equals(emp.user));
      const candidate = candidateDetails.find(c => c.userId && c.userId.equals(emp.user));

      //const countryId = candidate?.country_id?.toString() || null;
      //const countryName = countryId && countryMap[countryId] ? countryMap[countryId] : "Not Provided";

      return {
        userId: emp.user,
        name: user?.name || "N/A",
        email: user?.email || "N/A",
        photo: user?.profilePicture || null,
        jobTitle: emp.jobTitle || "Not Provided",
        // currentLocation: candidate?.currentLocation || "Not Provided",
        // countryName,
        // hometown: candidate?.hometown || "Not Provided",
        // currentAddress: `${candidate?.currentLocation || "Not Provided"}, ${countryName}`,
        employmentId: emp._id, // to differentiate employments if needed
      };
    });

    res.status(200).json({
      success: true,
      data: result,
      message: "User associated with company fetched successfully",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMultipleEmployeeDetails = async (req, res) => {

  try {
    const user_id = req.userId;
    const company_id = req.companyId;

    // Check if user exists
    const user = await User.findOne({ _id: user_id, is_del: false });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const { userId, employmentId } = req.query;

    if (!userId || !employmentId) {
      return res.status(400).json({
        success: false,
        message: "userIds, employmentId query parameter is required",
      });
    }

    // Run queries in parallel
    const [users, candidateDetails, personalDetail, employments] = await Promise.all([
      User.findOne(
        { _id: userId },
        { name: 1, email: 1, gender: 1, phone_number: 1 }
      ).lean(),

      CandidateDetails.findOne(
        { userId },
        { dob: 1, fatherName: 1, _id: 0 }
      ).lean(),

      personalDetails.findOne(
        { user: userId },
        { permanentAddress: 1, pan_number: 1, _id: 0 }
      ).lean(),

      Employment.findOne(
        { _id: employmentId, user: userId, companyName: company_id },
        {
          jobTitle: 1,
          employmentType: 1,
          joiningDate: 1,
          leavingDate: 1,
          companyName: 1,
          currentEmployment: 1,
          isVerified: 1,
          jobTypeVerified: 1,
          designationVerified: 1,
          jobDurationVerified: 1,
          servedNoticePeriod: 1,
          hasNOC: 1,
          hasDues: 1,
          remarks: 1,
          _id: 0
        }
      ).lean()
    ]);

    // Fetch gender name separately (parallelize this too if needed)
    let genderName = null;
    if (users?.gender) {
      const genderDoc = await list_gender.findById(users.gender, { name: 1 }).lean();
      genderName = genderDoc ? genderDoc.name : null;
    }
    if (users) users.gender = genderName;

    // Format DOB
    if (candidateDetails?.dob) {
      const dateObj = new Date(candidateDetails.dob);
      const day = String(dateObj.getDate()).padStart(2, "0");
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const year = dateObj.getFullYear();
      candidateDetails.dob = `${day}-${month}-${year}`;
    }

    if (employments) {
      // Format employment dates
      if (employments?.joiningDate?.year && employments?.joiningDate?.month) {
        const { year, month } = employments.joiningDate;
        employments.joiningYear = year;
        employments.joiningMonth = month;
        employments.joiningDate = `${new Date(year, month - 1).toLocaleString("en-US", { month: "long" })}, ${year}`;
      } else {
        employments.joiningDate = "";
      }

      if (employments?.leavingDate?.year && employments?.leavingDate?.month) {
        const { year, month } = employments.leavingDate;
        employments.leavingYear = year;
        employments.leavingMonth = month;
        employments.leavingDate = `${new Date(year, month - 1).toLocaleString("en-US", { month: "long" })}, ${year}`;
      } else {
        employments.leavingDate = "Present";
      }
    }

    // Merge
    const mergedData = {
      ...(users || {}),
      ...(candidateDetails || {}),
      ...(personalDetail || {}),
      ...(employments || {}),
    };

    res.status(200).json({
      success: true,
      data: mergedData,
      message: "Employee details fetched successfully",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addEmployeeVerificationDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const companyId = req.companyId;

    // Check if user exists
    const user = await User.findOne({ _id: userId, is_del: false });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const {
      _id,
      employmentId,
      designation,
      employmenttype,
      joiningdate,
      leavedate,
      joining_year,
      joining_month,
      leaving_year,
      leaving_month,
      Verified,
      designation_verified,
      duration_verified,
      employmenttype_verified,
      Serverd_notice_period,
      has_noc,
      has_due,
      remarks
    } = req.body;

    if (!_id || !employmentId) {
      return res.status(400).json({ message: "_id is required" });
    }

    const existingEmployment = await Employment.findOne({
      _id: employmentId,
      user: _id,
      companyName: companyId,
      isDel: false,
    });
    if (!existingEmployment) {
      return res.status(404).json({ message: "Employment record not found" });
    }

    // Prepare updated fields
    const updatedFields = {
      jobTitle: designation,
      employmentType: employmenttype,
      joiningDate: {
        year: joining_year,
        month: joining_month,
      },
      leavingDate: {
        year: leaving_year,
        month: leaving_month,
      },
      isVerified: Verified,
      jobTypeVerified: employmenttype_verified,
      designationVerified: designation_verified,
      jobDurationVerified: duration_verified,
      servedNoticePeriod: Serverd_notice_period,
      hasNOC: has_noc,
      hasDues: has_due,
      remarks: remarks
    };

    // Update employment based on conditions
    const updatedEmployment = await Employment.findOneAndUpdate(
      { _id: employmentId, user: _id, companyName: companyId, isDel: false },
      { $set: updatedFields },
      { new: true }
    ).lean();

    if (!updatedEmployment) {
      return res.status(404).json({ message: "Employment update failed" });
    }

    res.status(201).json({
      success: true,
      message: "Employee Verification Details added successfully",
      data: updatedEmployment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error Saving Employment Details",
      error: error.message,
    });
  }
};

export const getVerifiedUser = async (req, res) => {
  try {
    const company_id = req.companyId;

    if (!company_id) {
      return res.status(400).json({
        success: false,
        message: "company_id is required in query parameter",
      });
    }

    // Search employments collection where companyName = company_id
    const employments = await Employment.find({ companyName: company_id, isVerified: true });

    if (!employments || employments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No users found for this company",
      });
    }

    const userIds = [
      ...new Set(employments.map(emp => emp.user.toString())),
    ].map(id => new mongoose.Types.ObjectId(id));

    // 3. Fetch user details (name, photo)
    const users = await User.find(
      { _id: { $in: userIds } },
      {
        name: 1,
        email: 1,
        profilePicture: 1
      } // only select required fields
    ).lean();

    // 4. Fetch candidate details (currentLocation, countryId, hometown)
    const candidateDetails = await CandidateDetails.find(
      { userId: { $in: userIds } },
      { currentLocation: 1, country_id: 1, hometown: 1, userId: 1 }
    ).lean();

    // 4. Collect unique countryIds
    const countryIds = [...new Set(candidateDetails.map(c => c.country_id).filter(Boolean))];

    // 5. Fetch country details
    const countries = await list_tbl_countrie.find(
      { id: { $in: countryIds } },
      { name: 1, id: 1 }
    ).lean();

    // Create a lookup map: countryId → countryName
    const countryMap = {};
    countries.forEach(c => {
      countryMap[c.id.toString()] = c.name;
    });

    // 5. Merge all results

    /*
    const result = userIds.map(userId => {

      const user = users.find(u => u._id && u._id.equals(userId));
      const employment = employments.find(e => e.user && e.user.equals(userId));
      const candidate = candidateDetails.find(c => c.userId && c.userId.equals(userId));

      const countryId = candidate && candidate.country_id ? candidate.country_id.toString() : null;
      const countryName = countryId && countryMap[countryId] ? countryMap[countryId] : "Not Provided";

      return {
        userId,
        name: user && user.name ? user.name : "N/A",
        email: user && user.email ? user.email : "N/A",
        photo: user && user.profilePicture ? user.profilePicture : null,
        jobTitle: employment && employment.jobTitle ? employment.jobTitle : "Not Provided",
        //currentLocation: candidate && candidate.currentLocation ? candidate.currentLocation : "Not Provided",
        //countryId: candidate && candidate.country_id ? candidate.country_id : null,
        //countryName: countryName,
        // hometown: candidate && candidate.hometown ? candidate.hometown : "Not Provided",
        // currentAddress: `${candidate?.currentLocation || "Not Provided"}, ${countryName}`,
      };
    });
    */

    // 6. Build result based on employments (not unique users)
    const result = employments.map(emp => {
      const user = users.find(u => u._id && u._id.equals(emp.user));
      const candidate = candidateDetails.find(c => c.userId && c.userId.equals(emp.user));

      //const countryId = candidate?.country_id?.toString() || null;
      //const countryName = countryId && countryMap[countryId] ? countryMap[countryId] : "Not Provided";

      return {
        userId: emp.user,
        name: user?.name || "N/A",
        email: user?.email || "N/A",
        photo: user?.profilePicture || null,
        jobTitle: emp.jobTitle || "Not Provided",
        // currentLocation: candidate?.currentLocation || "Not Provided",
        // countryName,
        // hometown: candidate?.hometown || "Not Provided",
        // currentAddress: `${candidate?.currentLocation || "Not Provided"}, ${countryName}`,
        employmentId: emp._id, // to differentiate employments if needed
      };
    });

    res.status(200).json({
      success: true,
      data: result,
      message: "User associated with company fetched successfully",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};