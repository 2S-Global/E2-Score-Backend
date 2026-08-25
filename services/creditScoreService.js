import axios from "axios";
import { externalApiClient } from "../logger/externalApiClient.js";

//to get CIBIL SCORE
export const getCibilScore = async (userData, userId) => {
  const API_URL = `${process.env.CIBIL_URL}/srv2/credit-report/check-score`;

  const sendRequest = {
    ...userData,
    api_id: process.env.CIBIL_API_ID,
    api_key: process.env.CIBIL_API_KEY,
    token_id: process.env.CIBIL_TOKEN_ID,
  };

  //RESPONSE LOG 
  const response = await externalApiClient({
    provider: "CIBIL",
    service: "credit-report",
    url: API_URL,
    method: "POST",
    data: sendRequest,
    userId,
  });

  console.log('external API response', response)


  const score = response?.data?.score;
  const rawData = response?.data


  return {
    score: score || "",
    data: rawData,
  };
};

//to get EXPERIAN SCORE
export const getExperianScore = async (userData, userId) => {
  const API_URL = process.env.EXPERIAN_URL;

  const sendRequest = {
    ...userData,
    api_id: process.env.CIBIL_API_ID,
    api_key: process.env.CIBIL_API_KEY,
    token_id: process.env.CIBIL_TOKEN_ID,
  };


  //RESPONSE LOG
  const response = await externalApiClient({
    provider: "EXPERIAN",
    service: "credit-report",
    url: API_URL,
    method: "POST",
    data: sendRequest,
    userId,
  });

  console.log('EXPERIAN API TESTING ==> ', response)

  const score = response?.data?.result_json?.INProfileResponse?.SCORE?.BureauScore;

  console.log("this is experian SCORE ==>", score);

  return {
    score: score || "",
  };
};



