import mongoose, { Schema } from "mongoose";

export interface IFolder {
  name: string;
  description: string;
  parentFolderId: string | null;
}

const FolderSchema = new Schema<IFolder>(
  {
    name: { type: String, required: true },
    description: { type: String },
    parentFolderId: { type: Schema.Types.ObjectId, ref: "Folder" },
  },
  { timestamps: true }
);

const Folder = mongoose.model<IFolder>("Folder", FolderSchema);

export default Folder;
