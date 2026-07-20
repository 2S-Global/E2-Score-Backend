import puppeteer from "puppeteer-core";

import ejs from 'ejs'

export const GeneratePdfDemo = async (data) => {
    try {
        // Run headlessly in production/testing
        const browser = await puppeteer.launch({
            headless: "new",
            executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
        });
        const newPage = await browser.newPage()

        // Spreading data solves the EJS ReferenceError
        const htmlContent = await ejs.renderFile("./utility/demoResume.ejs", {
            ...data
        })

        await newPage.setContent(htmlContent, {
            waitUntil: "networkidle0",
        });

        // Returning the buffer directly instead of writing to a non-existent directory
        const pdfBuffer = await newPage.pdf({
            format: 'A4',
        })

        await browser.close();
        const buffer = Buffer.from(pdfBuffer);
        return buffer;

    } catch (error) {
        // Fix standard Error construction
        throw new Error("Internal PDF generation error: " + error.message)
    }
}
