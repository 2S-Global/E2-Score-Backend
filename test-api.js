import JWT from "jsonwebtoken";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const port = process.env.PORT || 8080;
const secret = process.env.JWT_SECRET || "123456hhhwwwppp";

console.log("Configured Port:", port);
console.log("Configured JWT Secret:", secret);

// Create a valid JWT token
const payload = {
  userId: "69089a4b63d40bedba5f4a9b",
};

const token = JWT.sign(payload, secret);
console.log("Generated Token:", token);

async function testApi() {
  try {
    const url = `http://localhost:${port}/api/jobposting/save-recent-searches`;
    console.log(`Sending POST request to ${url}...`);

    const response = await axios.post(
      url,
      {
        query: "Frontend Developer",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Response Status:", response.status);
    console.log("Response Data:", response.data);
  } catch (error) {
    if (error.response) {
      console.error("Error Response Status:", error.response.status);
      console.error("Error Response Data:", error.response.data);
    } else {
      console.error("Error Message:", error.message);
    }
  }
}

testApi();
