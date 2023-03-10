import { faker } from "@faker-js/faker";
import express from "express";
import Workspace from "./model";

const router = express.Router();

router.get("/all", async (req, res) => {
  try {
    const r = await Workspace.find({});
    return res.status(200).json(r);
  } catch (error) {
    return res.status(500).json("Server Error");
  }
});

router.get("/up/:count", async (req, res) => {
  const { count } = req.params;

  if (Number(count) <= 0) {
    return res.status(400).json({ message: "Count should be greater than 0" });
  }

  try {
    const w = Array.from({ length: Number(count) }).map(() => ({
      name: faker.company.name() + " workspace",
    }));

    const r = await Workspace.create(w);
    return res.status(200).json(r);
  } catch (error) {
    return res.status(500).json("Server Error");
  }
});

router.delete("/down", async (req, res) => {
  try {
    const r = await Workspace.deleteMany({});
    return res.status(200).json(r);
  } catch (error) {
    return res.status(500).json("Server Error");
  }
});

export { router as WorkspaceRouter };
