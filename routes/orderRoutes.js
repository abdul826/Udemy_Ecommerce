const express = require('express')
const router = express.Router();
const {verifyIsLoggedIn,verifyIsAdmin} = require("../middleware/verifyAuthToken");
const {getUserOrders,getOrder,createOrder,updateOrderToPaid,updateOrderToDelivered,getOrders,getOrderForAnalysis} = require("../controllers/OrderController")

// Route for users
router.use(verifyIsLoggedIn);
router.get("/", getUserOrders);
router.get("/user/:id", getOrder);  // order details for perticular user
router.post("/", createOrder);
router.put("/paid/:id", updateOrderToPaid);

// Route for Admin
router.use(verifyIsAdmin);
router.put("/delivered/:id", updateOrderToDelivered);
router.get("/admin", getOrders);
router.put("/analysis/:date", getOrderForAnalysis);

module.exports = router
