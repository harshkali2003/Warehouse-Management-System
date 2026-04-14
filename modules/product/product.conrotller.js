const productService = require("./product.service");

// 🔹 Create Product
exports.createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProductService({
      userId: req.user?.id,
      body: req.body,
    });

    return res.status(201).json({
      success: true,
      data: product,
    });
  } catch (err) {
    next(err);
  }
};

// 🔹 Get All Products
exports.getAllProducts = async (req, res, next) => {
  try {
    const result = await productService.getAllProductsService(req.query);

    return res.status(200).json({
      success: true,
      data: result.products,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
};

// 🔹 Get Single Product
exports.getSingleProduct = async (req, res, next) => {
  try {
    const product = await productService.getSingleProductService(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (err) {
    next(err);
  }
};

// 🔹 Update Product
exports.editProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProductService({
      userId: req.user?.id,
      id: req.params.id,
      body: req.body,
    });

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (err) {
    next(err);
  }
};

// 🔹 Delete Product
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await productService.deleteProductService({
      userId: req.user?.id,
      id: req.params.id,
    });

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (err) {
    next(err);
  }
};