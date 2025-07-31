import ListConunty from "../../models/company_Models/ListConunty.js";
import ListState from "../../models/company_Models/ListState.js";
import ListCity from "../../models/company_Models/ListCity.js";
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
