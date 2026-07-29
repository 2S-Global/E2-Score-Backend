import WhyGeisil from "../../models/WhyGeisil.js";
import { apiResponse } from "../../utility/apiResponse.js"

export const CreateWhyGeisil = async (req, res) => {
    const { title, icon, backgroundColor, description } = req.body
    // console.log("is this dowkring  ===>", title, icon, backgroundColor, description)
    try {
        const response = await WhyGeisil.create({
            title,
            icon,
            backgroundColor,
            description
        })
        if (!response) {
            return apiResponse(res, 400, false, "Failed to add why geisil")
        }







        return apiResponse(res, 200, true, "Why Geisil added successfully", response)



    } catch (error) {

        return apiResponse(res, 500, false, "Internal Server Error", error.message)

    }
}

export const GetWhyGeisil = async (req, res) => {
    try {
        const response = await WhyGeisil.find({ isdel: false })
        if (!response) {
            return apiResponse(res, 400, false, "Failed to get why geisil")
        }
        return apiResponse(res, 200, true, "Why Geisil fetched successfully", response)


    } catch (error) {
        return apiResponse(res, 500, false, "Internal Server Error")
    }
}

export const UpdateWhyGeisil = async (req, res) => {
    try {
        const { title, icon, backgroundColor, description } = req.body
        const response = await WhyGeisil.findByIdAndUpdate(req.params.id, {
            title,
            icon,
            backgroundColor,
            description
        }, { new: true })
        if (!response) {
            return apiResponse(res, 400, false, "Failed to update why geisil")
        }
        return apiResponse(res, 200, true, "Why Geisil updated successfully", response)
    } catch (error) {
        return apiResponse(res, 500, false, "Internal Server Error")
    }
}


export const DeleteWhyGeisil = async (req, res) => {
    try {
        const response = await WhyGeisil.findByIdAndUpdate(req.params.id, {
            isdel: true
        }, { new: true })
        if (!response) {
            return apiResponse(res, 400, false, "Failed to delete why geisil")
        }
        return apiResponse(res, 200, true, "Why Geisil deleted successfully", response)
    } catch (error) {
        return apiResponse(res, 500, false, "Internal Server Error")
    }
}