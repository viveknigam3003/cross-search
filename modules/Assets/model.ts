import { model, Schema } from "mongoose";
import { IProject } from "../Projects/model";

export interface Assets {
  name: string;
  url: string;
  customFields: {
    [key: string]: any;
    project: string & IProject;
  };
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
  },
  { timestamps: true }
);

const Asset = model<Assets>("Assets", assetsSchema);

export default Asset;
