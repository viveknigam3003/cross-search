import cors from "cors";
import { config } from "dotenv";
import express from "express";
import { AssetRouter } from "./modules/Assets/route";
import { ProjectRouter } from "./modules/Projects/route";
import { connectToMongo } from "./mongo/connect";

config();
const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectToMongo();

app.use("/api/projects", ProjectRouter);
app.use("/api/assets", AssetRouter);

app.listen(port, () => {
  console.info(`[INFO] Server Started on PORT: ${port}`);
});
