import AWS from "aws-sdk";
import { config } from "dotenv";
config();

export const rekognitionClient = new AWS.Rekognition({
  region: process.env.AWS_BUCKET_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY || "",
    secretAccessKey: process.env.AWS_SECRET_KEY || "",
  },
});
