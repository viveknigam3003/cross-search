import cors from "cors";
import { config } from "dotenv";
import express from "express";
import { RocketiumAssetRouter } from "./modules/Assets/rocketium/route";
import { AssetRouter } from "./modules/Assets/route";
import { CustomFieldRouter } from "./modules/CustomFields/route";
import { FolderRouter } from "./modules/Folders/route";
import { ProjectRouter } from "./modules/Projects/route";
import { WorkspaceRouter } from "./modules/Workspace/route";
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
app.use("/api/folders", FolderRouter);
app.use("/api/rocketium/assets", RocketiumAssetRouter);
app.use("/api/workspace", WorkspaceRouter);
app.use("/api/customFields", CustomFieldRouter);

app.listen(port, () => {
  console.info(`[INFO] Server Started on PORT: ${port}`);
});
