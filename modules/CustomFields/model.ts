import { model, Schema } from "mongoose";

interface ICustomField {
  workspaces: string[];
  type: string;
  entity: string;
  name: string;
  options: string[];
  isRequired: boolean;
  isDeleted: boolean;
  assetFieldKey?: string;
  assetFieldCategories?: string[];
}

const customFieldSchema = new Schema<ICustomField>(
  {
    workspaces: {
      type: [String],
      default: [],
    },
    type: {
      type: String,
      required: true,
    },
    entity: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    options: {
      type: [String],
      default: [],
    },
    isRequired: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    assetFieldKey: {
      type: String,
      default: null,
    },
    assetFieldCategories: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const CustomField = model<ICustomField>("CustomField", customFieldSchema);

export default CustomField;
