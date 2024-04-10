const Product = require("../models/productModel");
const ApiFeatures = require("../utils/apifeatures");
const User = require("../models/userModel")
const { validationResult } = require("express-validator");

// Create Product -- Admin
async function createProduct(req, res) {
  
  const {name, description, price, category, Stock, location} = req.body;
  if(!name || !description || !price || !category || !Stock || !location){
      return res.status(400).json({message: "Please fill all the necessary details"});
  }
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
  try{
   req.body.user = req.user._id;
   let product = await Product.create(req.body);
  //  product = await product.populate("user");
  //  console.log(product);
  
    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Get All Product
async function getAllProducts(req, res) {
  console.log("in try block createProduct");
  try {
    console.log("in try block createProduct")
    const resultPerPage = 2;
    const productsCount = await Product.countDocuments();
    console.log(productsCount); 
  const apiFeature = new ApiFeatures(Product.find(), req.query)
    .search()
    .filter();


  apiFeature.pagination(resultPerPage);
  
  let products = await apiFeature.query;
   let filteredProductsCount = products.length;
  // return res.send("ok");
  res.status(200).json({
    success: true,
    products,
    productsCount,
    resultPerPage,
    filteredProductsCount,
  });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}


// Get All Product (Admin)
async function getAdminProducts(req, res) {
  try {
    const products = await Product.find();

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}


// Get Product Details
async function getProductDetails(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(400).json({ message: "Product not found" });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}


// Update Product -- Admin

async function updateProduct(req, res) {
              const errors = validationResult(req);
              if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
              }

  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(400).json({ message: "Product not found" });
    }

    // Image work

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}


// Delete Product

async function deleteProduct(req, res) {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(400).json({ message: "Product not found" });
    }

    await product.remove();

    res.status(200).json({
      success: true,
      message: "Product Delete Successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}


// Create New Review or Update the review
async function createProductReview(req, res) {
  const { rating, comment } = req.body;

  const review = {
    user: req.user._id,
    userName: req.user.userName,
    rating: Number(rating),
    comment,
  };
//  console.log(req.params); return res.send("ok");
  const product = await Product.findById(req.params.productId);

  const isReviewed = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (isReviewed) {
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString())
        (rev.rating = rating), (rev.comment = comment);
    });
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }

  let avg = 0;

  product.reviews.forEach((rev) => {
    avg += rev.rating;
  });

  product.ratings = avg / product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
}

// Get All Reviews of a product
async function getProductReviews(req, res) {
  const product = await Product.findById(req.query.id);

  if (!product) {
    return res.status(400).json({ message: "Product not found" });
  }

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
}

// Delete Review
async function deleteReview(req, res) {
  const product = await Product.findById(req.query.productId);

  if (!product) {
    return res.status(400).json({ message: "Product not found" });
  }

  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString()
  );

  let avg = 0;

  reviews.forEach((rev) => {
    avg += rev.rating;
  });

  let ratings = 0;

  if (reviews.length === 0) {
    ratings = 0;
  } else {
    ratings = avg / reviews.length;
  }

  const numOfReviews = reviews.length;

  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
  });
}

module.exports = {
  createProduct,
  getAllProducts,
  getProductDetails,
  getAdminProducts,
  updateProduct,
  deleteProduct,
  createProductReview,
  getProductReviews,
  deleteReview,
};
