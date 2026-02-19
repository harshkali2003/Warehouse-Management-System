const skuSchema = require("./sku.schema");
const skuAudit = require("./skuAudit.schema");

exports.postSKU = async (req, resp) => {
  try {
    const { name, category, unit } = req.body;
    if (!name || !category || !unit) {
      return resp.status(400).json({ message: "All fields are required" });
    }

    const skuCode = `SKU${category.slice(0, 3)}-${Date.now()}`;

    const data = await skuSchema.create({
      skuCode: skuCode,
      name,
      category,
      unit,
      isPerishable: false,
    });

    await skuAudit.create({
      skuId: data._id,
      action: "CREATED",
      changes: {
        name: { new: data.name },
        unit: { new: data.unit },
        category: { new: data.category },
      },
      performedBy: req.user?.id,
      reason: "Initial SKU creation",
    });

    return resp.status(201).json({ message: "SKU information created", data });
  } catch (err) {
    console.log(err);
    resp.status(500).json({ message: "Internal server error" });
  }
};

exports.getSKU = async (req, resp) => {
  try {
    const data = await skuSchema.find({});
    if (data.length === 0) {
      return resp.status(404).json({ message: "No sku data found" });
    }

    return resp.status(200).json({ message: "SKU information fetched", data });
  } catch (err) {
    console.log(err);
    resp.status(500).json({ message: "Internal server error" });
  }
};

exports.updateSKU = async (req, resp) => {
  try {
    const { id } = req.params;

    const { name, unit, category, isPerishable } = req.body;
    if (!name || !unit || !category || typeof isPerishable !== "boolean") {
      return resp.status(404).json({ message: "All fields are required" });
    }

    const updatedData = { name, unit, category, isPerishable };

    const data = await skuSchema.findByIdAndUpdate(
      id,
      { $set: updatedData },
      { new: true },
    );
    if (!data) {
      return resp.status(404).json({ message: "No SKU found" });
    }

    const sku = await skuSchema.findById(id);
    const changes = {};

    if (sku.name !== name) changes.name = { old: sku.name, new: name };
    if (sku.unit !== unit) changes.unit = { old: sku.unit, new: unit };
    if (sku.category !== category)
      changes.category = { old: sku.category, new: category };

    await skuAudit.create({
      skuId: id,
      action: "UPDATED",
      changes,
      performedBy: req.user?.id || "SYSTEM",
      reason: "SKU master correction",
    });

    return resp.status(200).json({ message: "SKU updated", data });
  } catch (err) {
    console.log(err);
    resp.status(500).json({ message: "Internal server error" });
  }
};
