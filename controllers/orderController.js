const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const { validationResult } = require("express-validator");

async function newOrder(req, res) {
  // quantity of items will be managed from frontend like i will pass product as prop when user will click on buy now and whenever he/she will increase the quantity first it will  compare to the quantity to stock of products....
  // whenever user qwill place the order stock should be decreased by quantity in product stock
  try {
    const {
      shippingInfo,
      orderItems,
      paymentInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // const product = req.body.product
    // product.stock = product.stock-quantity
    const order = await Order.create({
      shippingInfo,
      orderItems,
      paymentInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      paidAt: Date.now(),
      user: req.user._id,
    });

    res.status(201).json({
      success: true,
      order,
      //product,
    });
  } catch (error) {
    // Handle the error here
    console.error("Error creating order:", error);
    res.status(500).json({
      success: false,
      message: "Error creating order",
    });
  }
}

// get Single Order
async function getSingleOrder(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "userName userEmail"
    );

    if (!order) {
      return res.status(404).jdon({ message: "Order not found with this Id" });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
}

// get logged in user  Orders
async function myOrders(req, res) {
  try {
    const orders = await Order.find({ user: req.user._id });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
}

// get all Orders -- Admin
async function getAllOrders(req, res) {
  try {
    const orders = await Order.find();

    let totalAmount = 0;

    orders.forEach((order) => {
      totalAmount += order.totalPrice;
    });

    res.status(200).json({
      success: true,
      totalAmount,
      orders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
}

// update Order Status -- Admin
async function updateOrder(req, res) {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found with this Id" });
    }

    if (order.orderStatus === "Delivered") {
      return res
        .status(404)
        .json({ message: "You have already delivered this order" });
    }

    if (req.body.status === "Shipped") {
      // Asynchronous operations inside forEach can't be awaited directly, consider using for...of loop instead.
      for (const o of order.orderItems) {
        await updateStock(o.product, o.quantity);
      }
    }
    order.orderStatus = req.body.status;

    if (req.body.status === "Delivered") {
      order.deliveredAt = Date.now();
    }

    await order.save({ validateBeforeSave: false });
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
}

async function updateStock(id, quantity) {
  try {
    const product = await Product.findById(id);

    if (!product) {
      throw new Error("Product not found");
    }

    product.Stock -= quantity;

    await product.save({ validateBeforeSave: false });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
}

// delete Order -- Admin
async function deleteOrder(req, res) {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found with this Id" });
    }

    await order.remove();

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
}

module.exports = {
  newOrder,
  getSingleOrder,
  myOrders,
  getAllOrders,
  updateOrder,
  deleteOrder,
};
