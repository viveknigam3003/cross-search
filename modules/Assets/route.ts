import express, { Request, Response } from "express";
import Project from "../Projects/model";
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

router.post("/up", async (req, res) => {
  // Get Project Ids

  // Get list of ids from Project collection but randomly
  // Something like [id1, id2, id1];
  const getRandomProjectId = async () => {
    const projects = await Project.find();
    // list of random indexes within the range of projects
    const randomIndexes = Array.from({ length: 3 }, () =>
      Math.floor(Math.random() * projects.length)
    );
    // list of random projects ids
    const randomProjects = randomIndexes.map((index) => projects[index]._id);

    return randomProjects;
  };

  const ids = await getRandomProjectId();

  try {
    const images = [
      {
        name: "Image 1",
        url: "https://fastly.picsum.photos/id/620/200/200.jpg?hmac=i-QlnBFXHK0SDe5o7B85DMYehiO7H-fZxsKLRrfFCcU",
        customFields: {
          project: ids[0],
        },
      },
      {
        name: "Image 2",
        url: "https://fastly.picsum.photos/id/558/200/200.jpg?hmac=tFHyh9KzOASFBog3Hpj6oSkBkBr90f67Yuejl0XnFDM",
        customFields: {
          project: ids[1],
        },
      },
    ];

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
  const { projectName } = req.query;

  console.log(projectName);

  try {
    const pipeline = [
        {
          $lookup: {
            from: 'projects',
            localField: 'customFields.projectId',
            foreignField: '_id',
            as: 'project'
          }
        },
        {
          $match: {
            'project.name': {
              $regex: new RegExp(projectName as string, 'i')
            }
          }
        }
      ];

    // const images = await Asset.find({})
    //   .populate({
    //     path: 'customFields.projectId',
    //     model: 'Project',
    //   })
    //   .exec();

    // const filteredImages = images.filter((image) => {
    //     return image.customFields.projectId?.name.match(new RegExp(projectName as string, 'i'));
    // });
    const filteredImages = await Asset.aggregate(pipeline);

    res.json(filteredImages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as imageRouter };

export { router as AssetRouter };
