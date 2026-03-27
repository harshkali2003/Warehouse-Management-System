const Location = require("./Location.schema");
const AppError = require("../../shared/utils/GlobalError");
const { default: mongoose } = require("mongoose");

exports.createLocation = async (req, resp, next) => {
  try {
    const user = req.user?.id;
    if (!user) {
      return next(new AppError("Login first", 401));
    }

    const { name, type, warehouseId, parentId } = req.body;
    if (!name || !type || !warehouseId) {
      return next(new AppError("All fields are required", 400));
    }

    const validTypes = ["ZONE", "RACK", "BIN"];
    if (!validTypes.includes(type)) {
      return next(new AppError("Invalid location type", 400));
    }

    if (
      !mongoose.Types.ObjectId.isValid(warehouseId) ||
      !mongoose.Types.ObjectId.isValid(parentId)
    ) {
      return next(new AppError("Not a valid id", 400));
    }

    if (type === "ZONE" && parentId) {
      return next(new AppError("Zone can't have parent", 400));
    }

    let parent = null;

    if (type !== "ZONE") {
      if (!parentId) {
        return next(new AppError(`${type} must have a parent`, 400));
      }

      parent = await Location.findById(parentId);

      if (!parent) {
        return next(new AppError("Parent not found", 404));
      }

      if (parent.warehouse_id.toString() !== warehouseId) {
        return next(new AppError("Parent must belong to same warehouse", 400));
      }

      if (type === "RACK" && parent.type !== "ZONE") {
        return next(new AppError("Rack must be under Zone", 400));
      }

      if (type === "BIN" && parent.type !== "RACK") {
        return next(new AppError("Bin must be under Rack", 400));
      }
    }

    const location = await Location.create({
      name,
      type,
      warehouse_id: warehouseId,
      parent_id: type === "ZONE" ? null : parentId,
      isActive: true,
    });

    return resp.status(201).json({ message: "success", data: location });
  } catch (err) {
    next(err);
  }
};

exports.getLocationByWarehouse = async (req, resp, next) => {
  try {
    const user = req.user?.id;
    if (!user) {
      return next(new AppError("Login first", 401));
    }

    const { warehouseId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(warehouseId)) {
      return next(new AppError("Not a valid it", 400));
    }

    const location = await Location.find({
      warehouse_id: warehouseId,
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .lean();

    return resp
      .status(200)
      .json({ message: "success", count: location.length, data: location });
  } catch (err) {
    next(err);
  }
};

exports.getChildrenByParent = async (req, resp, next) => {
  try {
    const user = req.user?.id;
    if (!user) {
      return next(new AppError("Login first", 401));
    }

    const { parentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(parentId)) {
      return next(new AppError("Not a valid it", 400));
    }

    const child = await Location.find({
      parent_id: parentId,
      isActive: true,
    }).lean();

    return resp
      .status(200)
      .json({ message: "success", count: child.length, data: child });
  } catch (err) {
    next(err);
  }
};
