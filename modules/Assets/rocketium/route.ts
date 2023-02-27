import express, { Request, Response } from "express";
import RocketiumAsset from "./model";

const router = express.Router();

router.get("/id/:id", async (req: Request, res: Response) => {
  try {
    const folders = await RocketiumAsset.find({ _id: req.params.id });
    res.send(folders);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

export { router as RocketiumAssetRouter };