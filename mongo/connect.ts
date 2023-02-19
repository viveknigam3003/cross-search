import { connect, connection } from "mongoose";

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

const connectToMongo = async () => {
  try {
    await connect(process.env.MONGO_URI || "");
    console.info("[INFO] Connected to MongoDB");
  } catch (err) {
    console.error("[ERROR] Failed to connect to MongoDB", err);
  }
};

export { connectToMongo };
