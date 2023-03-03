import express, { Request, Response } from "express";
import { PipelineStage } from "mongoose";
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

router.get("/autocomplete", async (req: Request, res: Response) => {
  const { searchString } = req.query;

  if (!searchString || searchString === "" || searchString === "undefined") {
    return res.send([]);
  }

  const pipeline: PipelineStage[] = [
    {
      $search: {
        index: "assetName",
        autocomplete: {
          query: searchString as string,
          path: "originalFileName",
        },
      },
    },
    {
      $sort: {
        uploadedAt: -1,
      },
    },
    {
      $project: {
        _id: 1,
        originalFileName: 1,
        link: 1,
        uploadedAt: 1,
      },
    },
    {
      $limit: 10,
    },
  ];

  try {
    const filteredImages = await RocketiumAsset.aggregate(pipeline);
    res.send(filteredImages);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

router.get("/search", async (req: Request, res: Response) => {
  const { searchString, page = 1, limit = 20 } = req.query;

  if (!searchString || searchString === "" || searchString === "undefined") {
    return res.send([]);
  }

  const pipeline: PipelineStage[] = [
    {
      $search: {
        index: "assetName",
        text: {
          query: searchString as string,
          path: "originalFileName",
        },
        highlight: {
          path: "originalFileName",
        },
      },
    },
    {
      $sort: {
        uploadedAt: -1,
      },
    },
    {
      $project: {
        _id: 1,
        originalFileName: 1,
        link: 1,
        uploadedAt: 1,
        highlight: {
          $meta: "searchHighlights",
        },
      },
    },
  ];

  try {
    const filteredImages = await RocketiumAsset.aggregate(pipeline);
    console.log(
      "[Search] string = ",
      searchString,
      "[Results] ",
      filteredImages.length
    );
    res.send(filteredImages);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

export { router as RocketiumAssetRouter };
