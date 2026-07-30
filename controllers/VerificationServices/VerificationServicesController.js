import VerificationServicesModel from "../../models/VerificationServicesModel.js"
import { apiResponse } from "../../utility/apiResponse.js"


export const VerificationServices = async (req, res) => {
    // const userId = req.user.userId
    const { title, icon, backgroundColor, description , iconColor } = req.body
    try {
        const existing = await VerificationServicesModel.findOne({ title });
        if (existing) {
            existing.isdel = false;
            existing.icon = icon;
            existing.backgroundColor = backgroundColor;
            existing.description = description;
            existing.iconColor = iconColor;

            await existing.save();

            return apiResponse(
                res,
                200,
                true,
                "Verification service restored successfully.",
                existing
            );
        }

        const response = await VerificationServicesModel.create({
            title,
            icon,
            backgroundColor,
            description,
            iconColor
        })


        if (!response) {
            return apiResponse(res, 404, false, "Failed to create verification service")
        }

        return apiResponse(res, 200, true, "Verification service created successfully", response)
    } catch (error) {
        return apiResponse(res, 500, false, "Internal server error", error)
    }



}




export const UpdateVerificationServices = async (req, res) => {

    const { _id } = req.params
    const { title, icon, backgroundColor, description  , iconColor } = req.body
    try {
        const response = await VerificationServicesModel.findByIdAndUpdate(_id, {
            $set: {
                title,
                icon,
                backgroundColor,
                description,
                iconColor
            }
        }, {
            new: true
        })


        if (!response) {
            return apiResponse(res, 400, false, "Failed to update verification service")
        }

        return apiResponse(res, 200, true, "Verification service updated successfully", response)


    } catch (error) {


        return apiResponse(res, 500, false, "Internal server error", error)

    }

}


export const DeleteVerificationServices = async (req, res) => {

    const { _id } = req.params
    console.log("did it worked==>", _id)
    try {
        const response = await VerificationServicesModel.findByIdAndUpdate(_id, {
            $set: {
                isdel: true
            }
        }, {
            new: true
        })


        if (!response) {
            return apiResponse(res, 400, false, "Failed to delete verification service")
        }

        return apiResponse(res, 200, true, "Verification service deleted successfully", response)


    } catch (error) {


        return apiResponse(res, 500, false, "Internal server error", error)

    }

}

export const getAllVerificationServices = async (req, res) => {
    try {
        const response = await VerificationServicesModel.find({
            isdel: false,

        })
        if (!response) {
            return apiResponse(res, 404, false, "No verification services found", null)
        }

        return apiResponse(res, 200, true, "Verification services fetched successfully", response)
    } catch (error) {

        return apiResponse(res, 500, false, "Internal server error", error)

    }

}
