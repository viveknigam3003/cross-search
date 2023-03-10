import { model, Schema } from "mongoose";

interface IWorkspace {
  name: string;
  orderedCustomFields: string[];
}

const workspaceSchema = new Schema<IWorkspace>(
  {
    name: {
      type: String,
      required: true,
    },
    orderedCustomFields: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const Workspace = model<IWorkspace>("Workspace", workspaceSchema);

export default Workspace;
