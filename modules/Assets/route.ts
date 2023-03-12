import { Rekognition, S3 } from "aws-sdk";
import express from "express";
import mongoose, { PipelineStage } from "mongoose";
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

  try {
    const images = generateImages(Number(count));

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
  const { searchString, limit = 12 } = req.query;

  console.log("[INFO] Search String: ", searchString, "Limit: ", limit, "");
  if (!searchString || searchString === "" || searchString === "undefined") {
    return res.send([]);
  }

  const pipeline: PipelineStage[] = [
    {
      $search: {
        index: "assetSearch",
        compound: {
          should: [
            {
              text: {
                query: searchString as string,
                path: "name",
                fuzzy: {
                  maxEdits: 2,
                },
              },
            },
            {
              text: {
                query: searchString as string,
                path: "customFields.colors",
                fuzzy: {
                  maxEdits: 2,
                },
              },
            },
            {
              text: {
                query: searchString as string,
                path: "customFields.tags",
                fuzzy: {
                  maxEdits: 2,
                },
              },
            },
            {
              text: {
                query: searchString as string,
                path: "customFields.products",
                fuzzy: {
                  maxEdits: 2,
                },
              },
            },
          ],
        },
        highlight: {
          path: [
            "name",
            "customFields.colors",
            "customFields.products",
            "customFields.tags",
          ],
        },
      },
    },
    {
      $limit: limit as number,
    },
    {
      $project: {
        _id: 1,
        name: 1,
        customFields: 1,
        url: 1,
        highlights: {
          $meta: "searchHighlights",
        },
      },
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
        index: "assetAutocomplete",
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
                path: "customFields.colors",
                fuzzy: {
                  maxEdits: 2,
                },
              },
            },
            {
              autocomplete: {
                query: searchString as string,
                path: "customFields.products",
                fuzzy: {
                  maxEdits: 2,
                },
              },
            },
            {
              autocomplete: {
                query: searchString as string,
                path: "customFields.tags",
                fuzzy: {
                  maxEdits: 2,
                },
              },
            },
          ],
        },
        highlight: {
          path: [
            "name",
            "customFields.colors",
            "customFields.products",
            "customFields.tags",
          ],
        },
      },
    },
    {
      $limit: 5,
    },
    {
      $project: {
        _id: 1,
        name: 1,
        customFields: 1,
        url: 1,
        highlights: {
          $meta: "searchHighlights",
        },
      },
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
      console.error("[ERROR, /assets/upload/s3]", err);
      res.status(500).send("Server Error");
    }

    if (data) {
      try {
        const image = await Asset.create({
          name: data.Key,
          url: data.Location,
        });

        const imageDoc = {
          _id: image._id,
          name: image.name,
          url: image.url,
          customFields: image.customFields,
          parentFolderId: image.parentFolderId,
          bucket: data.Bucket,
        };

        console.log("[INFO, /assets/upload/mongo]", imageDoc);

        res.send(imageDoc);
      } catch (error) {
        console.error("[ERROR, /assets/upload/mongo]", error);
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

  console.log(
    `[INFO ${new Date().toISOString()}] Fetching labels for: ${imageName}`
  );

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

  const image = await Asset.findOne({ _id: imageId });

  if (
    image?.customFields?.colors?.length > 0 ||
    image?.customFields?.tags?.length > 0 ||
    image?.customFields?.products?.length > 0
  ) {
    console.log(
      "[INFO, /assets/labels] Image already has labels, skipping rekognition"
    );
    return res.send(image);
  }

  rekognitionClient.detectLabels(rekognitionParams, async (err, labels) => {
    if (err) {
      console.error("[ERROR, /assets/labels/rekognition]", err);
      res.status(500).send("Server Error");
    }

    if (labels) {
      const customFields = parseLabelsData(labels);

      console.log("[INFO, /assets/labels/rekognition]", customFields);
      try {
        const image = await Asset.findOneAndUpdate(
          { _id: imageId },
          { customFields },
          { new: true }
        );
        console.log("[INFO, /assets/labels/mongo updated-image]", image);
        res.send(image);
      } catch (error) {
        console.error("[ERROR, /assets/labels/mongo", error);
        res.status(500).send("Server Error");
      }
    }
  });
});

router.patch("/custom-fields", async (req, res) => {
  const { imageId, key, value } = req.body;

  if (!imageId || imageId === "" || imageId === "undefined") {
    console.error("[ERROR, /assets/custom-fields] Image id is not defined");
    return res.status(400).send("Bad Request");
  }

  try {
    const image = await Asset.findOne({ _id: imageId });

    if (!image) {
      console.error("[ERROR, /assets/custom-fields] Image not found");
      return res.status(404).send("Not Found");
    }

    const customFields = image.customFields;
    customFields[key] = value;

    const updatedImage = await Asset.findOneAndUpdate(
      { _id: imageId },
      { customFields },
      { new: true }
    );

    res.send(updatedImage);
  } catch (error) {
    console.error("[ERROR, /assets/custom-fields/mongo]", error);
    res.status(500).send("Server Error");
  }
});

export { router as AssetRouter };
