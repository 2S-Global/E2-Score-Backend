import { apiResponse } from "../../utility/apiResponse.js"
import { GeneratePdfDemo } from "../../utility/generatePdfDemo.js"
import companylist from "../../models/CompanyListModel.js";
export const GeneratePdf = async (req, res) => {
    try {
        const response = await GeneratePdfDemo(req.body)

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            "inline; filename=resume.pdf"
        );
        res.setHeader("Content-Length", response.length);
        return res.end(response);

    } catch (error) {
        return apiResponse(res, 400, false, "Fatal Error", null, error)
    }



}


export const GetAllcompanydata = async (req, res) => {

    try {
        const response = await companylist.find({}).limit(10).select("companyname _id")
       
        if (response.length > 0) {
            return apiResponse(res, 200, true, "Company Data", response)
        }
        else {
            return apiResponse(res, 200, true, "Company Data", [])
        }

    } catch (error) {
        return apiResponse(res, 400, false, "Fatal Error", null, error)

    }


}