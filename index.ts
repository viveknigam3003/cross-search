import cors from "cors";
import express from "express";
import { config } from "dotenv";
import { connect, connection } from "mongoose";

config();
const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

connect(process.env.MONGO_URI || "")
  .then(() => {
    console.info("[INFO] Connected to MongoDB");
  })
  .catch((err) => {
    console.error("[ERROR] Failed to connect to MongoDB", err);
  });

connection.on("connected", () => {
  console.info("[INFO] Mongoose connected to MongoDB");
});

connection.on("error", (err) => {
  console.error("[ERROR] Mongoose connection error", err);
});

connection.on("disconnected", () => {
  console.info("[INFO] Mongoose disconnected from MongoDB");
});

process.on("SIGINT", () => {
  connection.close(() => {
    console.info("[INFO] Mongoose connection closed on app termination");
    process.exit(0);
  });
});

app.listen(port, () => {
  console.info(`[INFO] Server Started on PORT: ${port}`);
});
