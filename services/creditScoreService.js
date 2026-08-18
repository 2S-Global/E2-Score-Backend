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


  try {
    const response = await axios.post(API_URL, sendRequest, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    console.log('is it working===>1526', response)

  } catch (error) {

    console.log('is it working===>1528', error)

  }



  const rawData = response.data;
  let score = null;

  // Defensively search for score in expected paths
  // if (rawData) {
  //   score = rawData.score || rawData.Score || rawData.cibil_score || rawData.cibilScore;
  //   if (!score && rawData.data) {
  //     score = rawData.data.score || rawData.data.Score || rawData.data.cibil_score || rawData.data.cibilScore;
  //   }
  // }

  return {
    score: score || "N/A",
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

  const rawData = response.data;
  let score = null;

  // Defensively search for score in expected paths
  if (rawData) {
    score = rawData.score || rawData.Score || rawData.experian_score || rawData.experianScore;
    if (!score && rawData.data) {
      score = rawData.data.score || rawData.data.Score || rawData.data.experian_score || rawData.data.experianScore;
    }
  }

  return {
    score: score || "N/A",
    data: rawData,
  };
};
