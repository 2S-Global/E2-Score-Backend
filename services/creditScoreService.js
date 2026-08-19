import axios from "axios";

//to get CIBIL SCORE
export const getCibilScore = async (userData) => {
  const API_URL = `${process.env.CIBIL_URL}/srv2/credit-report/check-score`;

  const sendRequest = {
    ...userData,
    api_id: process.env.CIBIL_API_ID,
    api_key: process.env.CIBIL_API_KEY,
    token_id: process.env.CIBIL_TOKEN_ID,
  };
  console.log('is it working===>1526', sendRequest)

  let response;
  try {
    response = await axios.post(API_URL, sendRequest, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    console.log('is it working===>1526', response?.data)

  } catch (error) {

    console.log("error.response.data==>", error?.response?.data)
    console.log("error.response.status==>", error)
    console.log('is it working===>1528', error)
  }

  const score = response?.data?.data?.score;
  const rawData = response?.data
  console.log("this is CIBIL SCORE ==>", score)
  console.log("this is CIBIL RAW DATA ==>", rawData)

  return {
    score: score || "",
    data: rawData,
  };
};

//to get EXPERIAN SCORE
export const getExperianScore = async (userData) => {
  const API_URL = process.env.EXPERIAN_URL;

  const sendRequest = {
    ...userData,
    api_id: process.env.CIBIL_API_ID,
    api_key: process.env.CIBIL_API_KEY,
    token_id: process.env.CIBIL_TOKEN_ID,
  };

  const response = await axios.post(API_URL, sendRequest, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });





  const score = response?.data?.data?.result_json?.INProfileResponse?.SCORE?.BureauScore


  // const rawData = response?.data

  console.log("this is experian SCORE ==>", score)
  // console.log("this is experian RAW DATA ==>", rawData)


  return {
    score: score || "",
    // data: rawData,
  };
};



