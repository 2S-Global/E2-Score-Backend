import companylist from "../../models/CompanyListModel.js";
import { apiResponse } from "../../utility/apiResponse.js";

export const SearchFromCompany = async (req ,res) => {
    try {
        const fuzzysearchResult = await companylist.find().select("companyname")

        if (!fuzzysearchResult.length) {
            return apiResponse(res, 400, false, "No Company Found", null, null);
        }
        else {
            return apiResponse(res, 200, true, "Company Found", fuzzysearchResult, null);
        }

    } catch (error) {
        return apiResponse(res, 400, false, "Fatal Error", null, error)
    }
}