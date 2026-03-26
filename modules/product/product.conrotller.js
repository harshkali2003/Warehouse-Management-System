const mongoose = require("mongoose");

const productSchema = require("./product.shcema");
const AppError = require("../../shared/utils/GlobalError");

exports.createProduct = async (req, resp, next) => {
  try {
    const user = req.user?.id;
    if (!user) {
      return next(new AppError("Log in first", 401));
    }

    const { name, category, price } = req.body;
    if (!name || !category || !price) {
      return next(new AppError("All fields are required", 400));
    }

    if (typeof price !== "number" || price < 0) {
      return next(
        new AppError("price can be only number and non-negative", 400),
      );
    }

    const product = new productSchema.create({
      p_name: name,
      p_category: category,
      p_price: price,
      createdBy: req.user?.id,
    });

    return resp.status(201).json({ message: "success", data: product });
  } catch (err) {
    next(err);
  }
};

exports.getAllProducts = async (req, resp, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
    }

    if (req.query.serach) {
      filter.name = { $regex: req.query.serach, $options: "i" };
    }

    const total = await productSchema.countDocuments(filter);

    const products = await productSchema.find().skip(skip).limit(limit);

    if (products.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Products fetched successfully",
        data: [],
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    }

    return resp.status(200).json({
      message: "success",
      data: products,
      pagination: {
        total,
        page,
        limit,
        totalPage: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getSingleProduct = async (req, resp, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError("Invalid product Id", 400));
    }

    const product = await productSchema.findById(id);
    if (!product) {
      return next(new AppError("No Product Details found", 404));
    }

    return resp.status(200).json({ message: "success", product });
  } catch (err) {
    next(err);
  }
};

exports.editProduct = async (req, resp, next) => {
  try {
    const user = req.user?.id;
    if (!user) {
      return next(new AppError("Log in first", 401));
    }

    const {id} = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return next(new AppError("Invalid product Id" , 400))
    }

    const {name , category , price} = req.body;
    if(!name || !category || price === undefined){
        return next(new AppError("All fields are required" , 400))
    }

    if(typeof(price) !== "number" || price < 0){
        return next(new AppError("Invalid price" , 400))
    }

    const updatedData = {name , category , price};

    const product = await productSchema.findByIdAndUpdate(
        id,
        {$set : updatedData},
        {new : true , runValidators : true}
    )

    if(!product){
        return next(new AppError("No product found" , 404))
    }

    return resp.status(200).json({message : "success" , data : product})
  } catch (err) {
    next(err);
  }
};

exports.deleteProduct = async (req, resp, next) => {
  try {
    const user = req.user?.id;
    if (!user) {
      return next(new AppError("Log in first", 401));
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError("Invalid product Id", 400));
    }

    const product = await productSchema.findById(IDBTransaction);

    if (!product) {
      return next(new AppError("No product found", 404));
    }

    await product.deleteOne();

    return resp.status(200).json({ message: "success", data: product });
  } catch (err) {
    next(err);
  }
};
