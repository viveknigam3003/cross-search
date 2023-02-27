import mongoose from "mongoose";

export interface RocketiumAsset {
  _id: string;
  allowedTeams: string[];
  category: string;
  creatorId: string;
  description: string[];
  fileSize: number;
  folderId: string;
  fontFamily: boolean;
  isDeleted: boolean;
  isPurchased: boolean;
  keywords: string[];
  lastUsed: Date;
  link: string;
  mood: string[];
  originalFileName: string;
  originalFileNameAllSmallcase: string;
  productionId: string;
  svgString: string | null;
  tags: string[];
  teamId: string;
  type: string;
  users: string[];
  uploadedAt: Date;
}

const RocketiumAssetSchema = new mongoose.Schema<RocketiumAsset>(
  {
    _id: { type: String, required: true },
    allowedTeams: { type: [String] },
    category: { type: String },
    creatorId: { type: String },
    description: { type: [String] },
    fileSize: { type: Number },
    folderId: { type: String },
    fontFamily: { type: Boolean },
    isDeleted: { type: Boolean },
    isPurchased: { type: Boolean },
    keywords: { type: [String] },
    lastUsed: { type: Date },
    link: { type: String },
    mood: { type: [String] },
    originalFileName: { type: String },
    originalFileNameAllSmallcase: { type: String },
    productionId: { type: String },
    svgString: { type: String },
    tags: { type: [String] },
    teamId: { type: String },
    type: { type: String },
    uploadedAt: { type: Date },
    users: { type: [String] },
  },
  { timestamps: true }
);

const RocketiumAsset = mongoose.model<RocketiumAsset>(
  "assets",
  RocketiumAssetSchema
);

export default RocketiumAsset;