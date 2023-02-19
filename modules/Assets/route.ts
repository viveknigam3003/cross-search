import express, { Request, Response } from "express";
import { PipelineStage } from "mongoose";
import Project from "../Projects/model";
import { generateImages } from "./dataFaker";
import Asset from "./model";

const router = express.Router();

// Add an image
router.post("/", async (req: Request, res: Response) => {
  const { name, url, customFields } = req.body;

  // Create a new image instance
  const asset = new Asset({
    name,
    url,
    customFields,
  });

  try {
    // Save the image to the database
    await asset.save();

    res.status(201).send(asset);
  } catch (err) {
    console.error(err);
    res.status(400).send(err);
  }
});

router.post("/up/:count", async (req, res) => {
  const { count } = req.params;

  if (Number(count) <= 0) {
    return res.status(400).json({ message: "Count should be greater than 0" });
  }

  // Get Project Ids

  // Get list of ids from Project collection but randomly
  // Something like [id1, id2, id1];
  const getRandomProjectId = async () => {
    const projects = await Project.find();
    // list of random indexes within the range of projects
    const randomIndexes = Array.from({ length: Number(count) }, () =>
      Math.floor(Math.random() * projects.length)
    );
    // list of random projects ids
    const randomProjects = randomIndexes.map((index) => projects[index]._id);

    return randomProjects;
  };

  const ids = await getRandomProjectId();

  try {
    const images = generateImages(Number(count), ids);

    const result = await Asset.insertMany(images);
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// Route to delete all images
router.delete("/down", async (req, res) => {
  try {
    const result = await Asset.deleteMany({});
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

router.get("/search", async (req, res) => {
  const { projectName, page = 1, limit = 20 } = req.query;

  try {
    const pipeline: PipelineStage[] = [
      {
        $lookup: {
          from: "projects",
          localField: "customFields.project",
          foreignField: "_id",
          as: "project",
        },
      },
      {
        $match: {
          "project.name": {
            $regex: new RegExp(projectName as string, "gi"),
          },
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $skip: (Number(page) - 1) * Number(limit),
      },
      {
        $limit: Number(limit),
      },
    ];

    const filteredImages = await Asset.aggregate(pipeline).exec();

    res.json(filteredImages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export { router as AssetRouter };
