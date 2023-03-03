import { config } from "dotenv";
import AWS from "aws-sdk";
config();

export const s3Client = new AWS.S3({
  region: process.env.AWS_BUCKET_REGION || "us-east-1",
  accessKeyId: process.env.AWS_ACCESS_KEY || "",
  secretAccessKey: process.env.AWS_SECRET_KEY || "",
});
