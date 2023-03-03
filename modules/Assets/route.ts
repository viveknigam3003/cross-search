import { Rekognition, S3 } from "aws-sdk";
import express from "express";
import mongoose, { PipelineStage } from "mongoose";
import Project from "../Projects/model";
import { generateImages } from "./dataFaker";
import { parseLabelsData } from "./labels/parseLabels";
import { rekognitionClient } from "./labels/rekognition";
import Asset from "./model";
import { upload } from "./upload/multerUpload";
import { s3Client } from "./upload/s3";

const router = express.Router();

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

router.get("/parent/:parentFolderId", async (req, res) => {
  const { parentFolderId } = req.params;

  if (parentFolderId === "undefined") {
    const images = await Asset.find({ parentFolderId: null });
    console.log("Images", images);
    return res.send(images);
  }

  try {
    const images = await Asset.find({
      parentFolderId: new mongoose.Types.ObjectId(parentFolderId),
    });
    res.send(images);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

router.get("/search", async (req, res) => {
  const { searchString, limit = 20 } = req.query;

  if (!searchString || searchString === "" || searchString === "undefined") {
    return res.send([]);
  }

  const pipeline: PipelineStage[] = [
    {
      $search: {
        index: "assets",
        compound: {
          should: [
            {
              text: {
                query: searchString as string,
                path: "name",
              },
            },
            {
              text: {
                query: searchString as string,
                path: "customFields.color",
              },
            },
            {
              text: {
                query: searchString as string,
                path: "customFields.brand",
              },
            },
            {
              text: {
                query: searchString as string,
                path: "customFields.product",
              },
            },
          ],
        },
      },
    },
    {
      $limit: limit as number,
    },
  ];

  try {
    const result = await Asset.aggregate(pipeline);
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// create an autocomplete route
router.get("/autocomplete", async (req, res) => {
  const { searchString } = req.query;

  if (!searchString || searchString === "" || searchString === "undefined") {
    return res.send([]);
  }

  const pipeline: PipelineStage[] = [
    {
      $search: {
        index: "assetsAutocomplete",
        compound: {
          should: [
            {
              autocomplete: {
                query: searchString as string,
                path: "name",
                fuzzy: {
                  maxEdits: 2,
                },
              },
            },
            {
              autocomplete: {
                query: searchString as string,
                path: "customFields.color",
                fuzzy: {
                  maxEdits: 2,
                },
              },
            },
            {
              autocomplete: {
                query: searchString as string,
                path: "customFields.product",
                fuzzy: {
                  maxEdits: 2,
                },
              },
            },
            {
              autocomplete: {
                query: searchString as string,
                path: "customFields.brand",
                fuzzy: {
                  maxEdits: 2,
                },
              },
            },
          ],
        },
      },
    },
    {
      $limit: 10,
    },
  ];

  try {
    const result = await Asset.aggregate(pipeline);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

router.post("/upload", upload.single("file"), async (req, res) => {
  const params: S3.Types.PutObjectRequest = {
    Bucket: process.env.AWS_BUCKET_NAME || "", // bucket that we made earlier
    Key: req.file?.originalname || "image", // Name of the image
    Body: req.file?.buffer, // Body which will contain the image in buffer format
    ACL: "public-read-write", // defining the permissions to get the public link
    ContentType: "image/jpeg", // Necessary to define the image content-type to view the photo in the browser with the link
  };

  s3Client.upload(params, async (err, data) => {
    if (err) {
      console.error('[ERROR, /assets/upload/s3]', err);
      res.status(500).send("Server Error");
    }

    if (data) {
      try {
        const image = await Asset.create({
          name: data.Key,
          url: data.Location,
        });
        res.send({
          _id: image._id,
          name: image.name,
          url: image.url,
          customFields: image.customFields,
          parentFolderId: image.parentFolderId,
          bucket: data.Bucket,
        });
      } catch (error) {
        console.error('[ERROR, /assets/upload/mongo]',error);
        res.status(201).send({
          url: data.Location,
          fileName: data.Key,
          bucket: data.Bucket,
        });
      }
    }
  });
});

router.get("/labels", async (req, res) => {
  const { imageName, imageId } = req.query;

  console.log(`[INFO ${new Date().toISOString()}] Fetching labels for: ${imageName}`);

  if (!imageName || imageName === "" || imageName === "undefined") {
    console.error("[ERROR, /assets/labels] Image name is not defined");
    return res.status(400).send("Bad Request");
  }

  const rekognitionParams: Rekognition.Types.DetectLabelsRequest = {
    Image: {
      S3Object: {
        Bucket: process.env.AWS_BUCKET_NAME || "",
        Name: imageName as string,
      },
    },
    MaxLabels: 10,
    MinConfidence: 75,
    Features: ["GENERAL_LABELS", "IMAGE_PROPERTIES"],
  };

  rekognitionClient.detectLabels(rekognitionParams, async (err, labels) => {
    if (err) {
      console.error('[ERROR, /assets/labels/rekognition]', err);
      res.status(500).send("Server Error");
    }

    if (labels) {
      const customFields = parseLabelsData(labels);

      try {
        const image = await Asset.findOneAndUpdate(
          { _id: imageId },
          { customFields },
          { new: true }
        );
        res.send(image);
      } catch (error) {
        console.error('[ERROR, /assets/labels/mongo', error);
        res.status(500).send("Server Error");
      }
    }
  });
});

export { router as AssetRouter };
