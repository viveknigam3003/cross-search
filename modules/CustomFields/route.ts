import express from "express";
import Workspace from "../Workspace/model";
import CustomField from "./model";

const router = express.Router();

router.post("/new", async (req, res) => {
  try {
    const {
      name,
      type,
      entity,
      workspace,
      options,
      assetFieldCategories,
    } = req.body;

    // Finding first deleted field to reclaim
    const firstDeletedField = await CustomField.findOne({
      entity: "assets",
      workspaces: workspace,
      isDeleted: true,
    })

    // if there is a deleted field, update it
    if (firstDeletedField) {
        const updatedField = await CustomField.findOneAndUpdate(
            { _id: firstDeletedField._id },
            {
            name,
            type,
            entity,
            workspaces: [workspace],
            options,
            assetFieldCategories,
            isDeleted: false,
            },
            { new: true }
        );
    
        // update workspace with new field
        const updatedWorkspace = await Workspace.findOneAndUpdate(
            { _id: workspace },
            { $push: { orderedCustomFields: updatedField?._id } },
            { new: true }
        );
    
        return res.status(200).json({
            updatedField,
            updatedWorkspace,
        });
    }

    // Find existing fields count
    const existingFieldsCount = await CustomField.count({
      entity: "assets",
      workspaces: workspace,
    });
    
    // Create new field with new assetFieldKey
    const assetFieldKey = `customField_${existingFieldsCount + 1}`;

    const newField = await CustomField.create({
      name,
      type,
      entity,
      workspaces: [workspace],
      options,
      assetFieldKey,
      assetFieldCategories,
    });

    // update workspace with new field
    const updatedWorkspace = await Workspace.findOneAndUpdate(
      { _id: workspace },
      { $push: { orderedCustomFields: newField._id } },
      { new: true }
    );

    return res.status(200).json({
      newField,
      updatedWorkspace,
    });
  } catch (error) {
    return res.status(500).json("Server Error");
  }
});

router.delete("/down", async (req, res) => {
  try {
    const r = await CustomField.deleteMany({});
    return res.status(200).json(r);
  } catch (error) {
    return res.status(500).json("Server Error");
  }
});

export { router as CustomFieldRouter };
