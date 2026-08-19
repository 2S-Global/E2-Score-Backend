import CandidateKYC from "../../models/CandidateKYCModel.js"
import { apiResponse } from "../../utility/apiResponse.js"

export const isPanAdded = async (req, res) => {
    const userId = req.userId
    // const userId = '682ee0254fb9463996a65178'
    try {
        const response = await CandidateKYC.findOne({ userId })
        if (!response || !response.pan_number || response.pan_number == undefined || response.pan_number == null || response.pan_number == "") {
            return apiResponse(res, 404, false, "PAN is not added yet", {
                isPanAdded: false
            })
        }
        return apiResponse(res, 200, true, "PAN is already added", {
            isPanAdded: true
        })

    } catch (error) {
        console.log(error)
        return apiResponse(res, 500, false, "Internal server error")
    }
}