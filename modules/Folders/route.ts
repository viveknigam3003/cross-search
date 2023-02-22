import express, { Request, Response } from "express";
import mongoose from "mongoose";
import Folder from "./model";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  const folders = await Folder.find();
  res.send(folders);
});

// Get folders using parentFolderId
router.get("/:parentFolderId", async (req: Request, res: Response) => {
  const { parentFolderId } = req.params;

  console.log("Parent", parentFolderId);

  if (parentFolderId === 'undefined') {
    const folders = await Folder.find({ parentFolderId: null });
    return res.send(folders);
  }

  try {
    const folders = await Folder.find({
      parentFolderId: new mongoose.Types.ObjectId(parentFolderId),
    });
    console.log("Folders", folders);
    res.send(folders);
  } catch (err) {
    console.error(err);
    res.status(400).send(err);
  }
});

// Add folders
router.post("/up", async (req: Request, res: Response) => {
  const foldersData = [
    {
      name: "Folder 1",
      description: "Folder 1 description",
      parentFolderId: null,
    },
    {
      name: "Folder 2",
      description: "Folder 2 description",
      parentFolderId: null,
    },
    {
      name: "Folder 3",
      description: "Folder 3 description",
      parentFolderId: null,
    },
  ];

  try {
    const folders = await Folder.insertMany(foldersData);
    res.send(folders);
  } catch (err) {
    console.error(err);
    res.status(400).send(err);
  }
});

router.delete("/down", async (req: Request, res: Response) => {
  // Delete all folders
  try {
    await Folder.deleteMany({});
    res.send("Deleted all folders");
  } catch (err) {
    console.error(err);
    res.status(400).send(err);
  }
});

router.patch("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, parentFolderId } = req.body;

  try {
    const folders = Folder.updateOne(
      { _id: id },
      {
        name,
        description,
        parentFolderId: new mongoose.Types.ObjectId(parentFolderId),
      }
    );
    res.send(folders);
  } catch (err) {
    console.error(err);
    res.status(400).send(err);
  }
});

export { router as FolderRouter };
