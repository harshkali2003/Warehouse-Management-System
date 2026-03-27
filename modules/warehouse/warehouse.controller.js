const Warehouse = require("./warehouse.schema");
const AppError = require("../../shared/utils/GlobalError");
const { default: mongoose } = require("mongoose");

exports.createWarehouse = async (req, resp, next) => {
  try {
    const user = req.user?.id;
    if (!user) {
      return next(new AppError("Login first", 401));
    }

    const { name, longitude, latitude } = req.body;
    if (!name || longitude === null || latitude === null) {
      return next(new AppError("All fields are required", 400));
    }

    if (isNaN(longitude) || isNaN(latitude)) {
      return next(new AppError("Not a valid coordinates", 400));
    }

    if (latitude < -90 || latitude > 90) {
      return next(new AppError("Invalid latitude range", 400));
    }

    if (longitude < -180 || longitude > 180) {
      return next(new AppError("Invalid longitude range", 400));
    }

    const warehouse = await Warehouse.create({
      w_name: name,
      code: `warehouse-${Date.now()}`,
      w_location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
      isActive: true,
    });

    return resp.status(201).json({ message: "success", data: warehouse });
  } catch (err) {
    next(err);
  }
};

exports.getAll = async (req, resp, next) => {
  try {
    const user = req.user?.id;
    if (!user) {
      return next(new AppError("Login first", 401));
    }

    const warehouse = await Warehouse.find({ isActive: true }).lean();

    return resp
      .status(200)
      .json({ message: "success", count: warehouse.length, data: warehouse });
  } catch (err) {
    next(err);
  }
};

exports.getInfoById = async (req, resp, next) => {
  try {
    const user = req.user?.id;
    if (!user) {
      return next(new AppError("Login first", 401));
    }

    const { warehouseId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(warehouseId)) {
      return next(new AppError("Not a valid it", 400));
    }

    const warehouse = await Warehouse.findOne({
      _id: warehouseId,
      isActive: true,
    }).lean();
    if (!warehouse) {
      return next(new AppError("No Data found", 404));
    }

    return resp.status(200).json({ message: "success", data: warehouse });
  } catch (err) {
    next(err);
  }
};
