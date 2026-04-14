const Product = require("./product.shcema");
const AppError = require("../../shared/utils/GlobalError");
const mongoose = require("mongoose");

// 🔹 Create Product
exports.createProductService = async ({ userId, body }) => {
  if (!userId) throw new AppError("Log in first", 401);

  const { name, category, price } = body;

  if (!name || !category || price === undefined) {
    throw new AppError("All fields are required", 400);
  }

  if (typeof price !== "number" || price < 0) {
    throw new AppError("Invalid price", 400);
  }

  return await Product.create({
    p_name: name,
    p_category: category,
    p_price: price,
    createdBy: userId,
  });
};

// 🔹 Get All Products
exports.getAllProductsService = async (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = {};

  if (query.category) filter.p_category = query.category;

  if (query.minPrice || query.maxPrice) {
    filter.p_price = {};
    if (query.minPrice) filter.p_price.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.p_price.$lte = Number(query.maxPrice);
  }

  if (query.search) {
    filter.p_name = { $regex: query.search, $options: "i" };
  }

  const total = await Product.countDocuments(filter);

  const products = await Product.find(filter).skip(skip).limit(limit);

  return {
    products,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// 🔹 Get Single
exports.getSingleProductService = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid product Id", 400);
  }

  const product = await Product.findById(id);
  if (!product) throw new AppError("No Product found", 404);

  return product;
};

// 🔹 Update
exports.updateProductService = async ({ userId, id, body }) => {
  if (!userId) throw new AppError("Log in first", 401);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid product Id", 400);
  }

  const { name, category, price } = body;

  if (!name || !category || price === undefined) {
    throw new AppError("All fields are required", 400);
  }

  if (typeof price !== "number" || price < 0) {
    throw new AppError("Invalid price", 400);
  }

  const product = await Product.findByIdAndUpdate(
    id,
    {
      p_name: name,
      p_category: category,
      p_price: price,
    },
    { new: true, runValidators: true }
  );

  if (!product) throw new AppError("No product found", 404);

  return product;
};

// 🔹 Delete
exports.deleteProductService = async ({ userId, id }) => {
  if (!userId) throw new AppError("Log in first", 401);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid product Id", 400);
  }

  const product = await Product.findById(id);
  if (!product) throw new AppError("No product found", 404);

  await product.deleteOne();

  return product;
};