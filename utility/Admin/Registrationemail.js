import jwt from "jsonwebtoken";
import { emailQueue } from "../../queues/emailQueue.js";

export const sendUserCredentialsEmail = async (user, password) => {
  const { name, email, _id } = user;

  const token = jwt.sign({ userId: _id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  await emailQueue.add("user_credentials_email", {
    name,
    email,
    password,
    token
  });
};
