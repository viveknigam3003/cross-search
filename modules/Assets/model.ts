import { model, Schema } from "mongoose";
import { IProject } from "../Projects/model";

export interface Assets {
  name: string;
  url: string;
  customFields: {
    [key: string]: any;
    project: string & IProject;
  };
  parentFolderId: string | null;
}

const assetsSchema = new Schema<Assets>(
  {
    name: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    customFields: {
      type: Object,
      of: Schema.Types.Mixed,
      default: {},
    },
    parentFolderId: {
      type: Schema.Types.ObjectId,
      ref: "Folder",
    }
  },
  { timestamps: true }
);

const Asset = model<Assets>("Assets_1", assetsSchema);

export default Asset;
