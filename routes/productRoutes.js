const express = require('express')
const router = express.Router()
const {getProducts,getProductById,getBestSeller,adminGetProduct,adminDeleteProduct,adminDeleteProductImage,adminUpdateProduct,adminUpload,adminCreateProduct} = require("../controllers/productController")

router.get("/category/:categoryName/search/:searchQuery", getProducts)
router.get("/category/:categoryName", getProducts)
router.get("/search/:searchQuery", getProducts)
router.get("/", getProducts);

router.get("/get-one/:id", getProductById);
router.get("/bestseller", getBestSeller);

// Admin route
router.get("/admin", adminGetProduct);
router.delete("/admin/:id", adminDeleteProduct);
router.delete("/admin/image/:imagePath/:productId", adminDeleteProductImage);
router.put("/admin/:id", adminUpdateProduct);
router.post("/admin/upload", adminUpload);
router.post("/admin", adminCreateProduct);

module.exports = router
