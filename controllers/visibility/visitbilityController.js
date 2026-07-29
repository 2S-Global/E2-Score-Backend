import personalDetails from "../../models/personalDetails.js";
import { apiResponse } from "../../utility/apiResponse.js";



export const getVisibilityController = async (req, res) => {

    const userId = req.userId

    try {
        const response = await personalDetails.findOne({ user: userId }).select('visibility')

        if (!response) {
            return apiResponse(res, 404, false, 'visibility not found')
        }

        return apiResponse(res, 200, true, 'visibility fetched successfully', response.visibility)

    } catch (error) {
        console.log(error)
        return apiResponse(res, 500, false, 'internal server error')

    }



}




export const updateVisibilityController = async (req, res) => {

    const userId = req.userId

    try {
        const visibilityType = req.body;
        const [key, value] = Object.entries(visibilityType)[0]

        const response = await personalDetails.findOneAndUpdate(

            { user: userId },
            {
                $set: {
                    [`visibility.${key}`]: value
                }
            }, {
            new: true,
            upsert: true
        }

        )
        if (!response) {
            return apiResponse(res, 400, false, 'visibility is not updated')
        }

        return apiResponse(res, 200, true, 'visibility updated successfully', response)

    } catch (error) {
        console.log(error)
        return apiResponse(res, 500, false, 'internal server error')

    }



}