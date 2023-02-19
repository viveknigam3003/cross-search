/* eslint-disable @typescript-eslint/no-explicit-any */
import express from "express";
import { generateProjects } from "./dataFaker";
import Project from "./model";
const router = express.Router();

console.log("[INFO] Project routes available at /api/projects");
// GET /api/projects
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find();
    res.status(200).json(projects);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/projects
router.post("/", async (req, res) => {
  const project = new Project({
    name: req.body.name,
  });

  try {
    const newProject = await project.save();
    res.status(201).json(newProject);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

router.post("/up/:count", async (req, res) => {
  const { count } = req.params;

  if (Number(count) <= 0) {
    return res.status(400).json({ message: "Count should be greater than 0" });
  }

  try {
    const projectsData = generateProjects(Number(count));

    const projects = await Project.create(projectsData);

    res.status(201).json({ message: "All Projects created", projects });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create projects" });
  }
});

router.delete("/down", async (req, res) => {
  try {
    await Project.deleteMany();

    res.status(200).json({ message: "All Projects deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete projects" });
  }
});

export { router as ProjectRouter };
