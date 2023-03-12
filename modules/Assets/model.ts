import { model, Schema } from "mongoose";

export interface Assets {
  name: string;
  url: string;
  customFields: {
    [key: string]: any;
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
      default: null,
    }
  },
  { timestamps: true }
);

const Asset = model<Assets>("Assets_2", assetsSchema);

export default Asset;
