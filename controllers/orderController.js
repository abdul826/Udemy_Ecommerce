const Order = require("../models/OrderModel");
const Product = require("../models/ProductModel");
const ObjectId = require("mongodb").ObjectId;

const getUserOrders = async(req,res,next)=>{
    try {
        const orders = await Order.find({user: ObjectId(req.user._id)}).orFail();  // get the user id form OrderModel
        res.send(orders);
    } catch (error) {
        next(error);
    }
}

//Get order details of a perticular User
const getOrder = async(req,res,next)=>{
    try {
        const order = await Order.findById(req.params.id).populate("user","-password -isAdmin -_id -__v -createdAt -updatedAt")
        .orFail();
        res.send(order);
    } catch (error) {
        NodeList(error);
    }
}

// Create the product
const createOrder = async (req, res, next) => {
    try {
        const { cartItems, orderTotal, paymentMethod } = req.body;
        if (!cartItems || !orderTotal || !paymentMethod) {
            return res.status(400).send("All inputs are required");
        }

        let ids = cartItems.map((item) => {
            return item.productID;       // item kon se product ka hai is liye hm productID le rahe 
        })
        let qty = cartItems.map((item) => {
            return Number(item.quantity);     // quentity b increase hogi to quantity le rahe 
        })

        // match the productId from ProductModel and add the qty value in scale
        await Product.find({ _id: { $in: ids } }).then((products) => {  // yaha pr jo productID mili hai us ko Product model k id se match kr rahe 
            products.forEach(function (product, idx) {                 // prduct id milne k baad fo each loop use kr k productModel me jo sales hai us me quentity ki value insert kr rahe 
                product.sales += qty[idx];
                product.save();        // yaha product save ho raha hai
            })
        })

        // Create the Order of perticular User
        const order = new Order({
            user: ObjectId(req.user._id),
            orderTotal: orderTotal,
            cartItems: cartItems,
            paymentMethod: paymentMethod,
        })
        const createdOrder = await order.save();
        res.status(201).send(createdOrder);

    } catch (err) {
        next(err)
    }
}

// Update the order after paid
const updateOrderToPaid = async(req,res,next)=>{
    try {
        const order = await Order.findById(req.params.id).orFail();
        order.isPaid = true;
        order.paidAt  = Date.now();

        const updateOrder = await order.save();

        res.send(updateOrder);

    } catch (error) {
        next(error);
    }
}

// Update the order after Delivered
const updateOrderToDelivered = async(req,res,next)=>{
    try {
        const order = await Order.findById(req.params.id).orFail();
        order.isDelivered = true;
        order.delivered  = Date.now();

        const updateOrder = await order.save();

        res.send(updateOrder);

    } catch (error) {
        next(error);
    }
}

// ADmin to get all order
const getOrders = async(req,res,next)=>{
    try {
        const orders = await Order.find({}).populate("user", "-password").sort({paymentMethod:"desc"});
        res.send(orders);
    } catch (error) {
        next(error);
    }
}
// Analysis the daily order
const getOrderForAnalysis = async(req,res,next)=>{
    try {
        const start = new Date(req.params.date);
        start.setHours(0,0,0,0);

        const end = new Date(req.params.date);
        end.setHours(23,59,59,999);

        const order = await Order.find({
            createdAt:{
                $gte : start,
                $lte: end
            }
        }).sort({createdAt: "asc"});
        
        res.send(order);

    } catch (error) {
        next(error);
    }
}
module.exports = {getUserOrders,getOrder,createOrder,updateOrderToPaid,
                    updateOrderToDelivered,getOrders,getOrderForAnalysis}

