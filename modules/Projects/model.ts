import mongoose from "mongoose";

export interface IProject {
  name: string;
}

const projectSchema = new mongoose.Schema<IProject>(
  {
    name: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model("Project", projectSchema);

export default Project;
