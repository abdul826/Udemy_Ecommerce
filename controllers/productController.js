const Product = require("../models/ProductModel");
const recordsPerPage = require("../config/pagination");

const getProducts = async (req, res, next) => {
  try {
    let query = {};
    let queryCondition = false;

    let priceQueryCondition = {};
    if (req.query.price) {
      queryCondition = true;
      priceQueryCondition = { price: { $lte: Number(req.query.price) } };
    }
    let ratingQueryCondition = {};
    if (req.query.rating) {
      queryCondition = true;
      ratingQueryCondition = { rating: { $in: req.query.rating.split(",") } };
    }
    let categoryQueryCondition = {};
    const categoryName = req.params.categoryName || "";
    if (categoryName) {
      queryCondition = true;
      let a = categoryName.replaceAll(",", "/");
      var regEx = new RegExp("^" + a);
      categoryQueryCondition = { category: regEx };
    }
    if (req.query.category) {
      queryCondition = true;
      let a = req.query.category.split(",").map((item) => {
        if (item) return new RegExp("^" + item);
      });
      categoryQueryCondition = {
        category: { $in: a },
      };
    }
    let attrsQueryCondition = [];
    if (req.query.attrs) {
      // attrs=RAM-1TB-2TB-4TB,color-blue-red
      // [ 'RAM-1TB-4TB', 'color-blue', '' ]
      attrsQueryCondition = req.query.attrs.split(",").reduce((acc, item) => {
        if (item) {
          let a = item.split("-");
          let values = [...a];
          values.shift(); // removes first item
          let a1 = {
            attrs: { $elemMatch: { key: a[0], value: { $in: values } } },
          };
          acc.push(a1);
          // console.dir(acc, { depth: null })
          return acc;
        } else return acc;
      }, []);
    //   console.dir(attrsQueryCondition, { depth: null });
    queryCondition = true;
    }

    //pagination
    const pageNum = Number(req.query.pageNum) || 1;

    // sort by name, price etc.
    let sort = {};
    const sortOption = req.query.sort || "";
    if (sortOption) {
      let sortOpt = sortOption.split("_");
      sort = { [sortOpt[0]]: Number(sortOpt[1]) };
    }

    // Search Query
    const searchQuery = req.params.searchQuery || ""
    let searchQueryCondition = {}
    let select = {}
    if(searchQuery) {
        queryCondition = true
        searchQueryCondition = { $text: { $search: searchQuery } }
        select = {
            score: { $meta: "textScore" }
        }
        sort = { score: { $meta: "textScore" } }
    }

    if (queryCondition) {
      query = {
        $and: [
          priceQueryCondition,
          ratingQueryCondition,
          categoryQueryCondition,
          searchQueryCondition,
          ...attrsQueryCondition
        ],
      };
    }

    const totalProducts = await Product.countDocuments(query);
    const products = await Product.find(query)
        .select(select)
      .skip(recordsPerPage * (pageNum - 1))
      .sort(sort)
      .limit(recordsPerPage);

    res.json({
      products,
      pageNum,
      paginationLinksNumber: Math.ceil(totalProducts / recordsPerPage),
    });
  } catch (error) {
    next(error);
  }
};
// Get Product By ID

const getProductById = async(req,res,next)=>{
  try {
    const product = await Product.findById(req.params.id).populate("reviews").orFail(); // We use populate to show the reviews otherwise it will show ID of reviews only.
    res.json(product);
  } catch (error) {
    next(error);
  }
}

// Database Query For BestSeller
const getBestSeller = async(req,res,next)=>{
  try {
    const products = await Product.aggregate([
      {$sort : {category : 1, sales: -1}}, //sort the product category as accending and sales as a decending order
      {$group : {_id: "$category", doc_with_max_sales: {$first: "$$ROOT"}}},  //  group the matching documents by the category field, and show with first max value
      {$replaceWith: "doc_with_max_sales"},  // replace with doc_with_max_sales
      {$match: {sales: {$gt: 0 }}}, // match the sales value 
      {$project: {_id: 1, name: 1, images: 1, category: 1, description: 1}},
      {$limit: 3} // limit the value 
    ]);
    res.json(products);
  } catch (error) {
    next(error);
  }
}

// Admin GEt Product
const adminGetProducts = async(req,res,next)=>{
  try {
    const products = await Product.find({})
    .sort({category : 1})
    .select({name,price,category});
    return res.json(products);
  } catch (error) {
    next(error);
  }
}

// Admin Update Product - 26-05-23
const adminUpdateProducts = async(req,res,next)=>{
  try {
    const product = await Product.findById(req.params.id).orFail();
    const {name,description,count,price,category,attributesTable} = req.body;

    product.name = name || product.name;
    product.description = description || product.description;
    product.count = count || product.count;
    product.price = price || product.price;
    product.category = category || product.category;

    if(attributesTable.lenght > 0){
      product.attr = [];

      attributesTable.map((item)=>{
        product.attr.push(item);
      })
    }else{
      product.attr = [];
    }
    await product.save();
    res.json({
      message: "Product Updated Successfully"
    });

  } catch (error) {
    next(error);
  }
}

// File Upload (Install package npm i express-fileupload^1.3.1 & npm i uuid@^8.3.2)
const adminUpload = async(req,res,next)=>{
  try {
    if(!req.files|| !req.files.images === false){
      return res.status(400).send("No File Uploaded");
    }

    const validateResult = imageValidate(req.files.images);
    if(validateResult.error){
      return res.status(400).send(validateResult.error);
    }

    const path = require("path");

    // Generate Randome name (uuid)
    const { v4: uuidv4 } = require('uuid');
    const uploadDirectory = path.resolve(__dirname, "../../frontend", "public", "images" ,"products");  // give the path where we have to save the image

    let product = await Product.findById(req.params.productId).orFail();  // get the productId

    let imageTable = [];

    // If image is more than 1 then "if work" otherwise else work for single image
    if(Array.isArray(req.files.images)){
      imageTable = req.files.images;
    }else{
      imageTable.push(req.files.images);
    }

    for(let image of imageTable){
      const fileName = uuidv4() + path.extname(image.name);
      const uploadPath = uploadDirectory + "/" + fileName;  // upload path has exect location where image is uploaded

      product.images.push({path : "/images/products/" + fileName}); // push to dataBase

      // check image is uploaded or not
      image.mv(uploadPath, function(error){
        if(error){
          return res.status(500).send(error)
        }
      })
    }

    product.save();       //save to database
    res.send("File Uploaded Succesfully");
  } catch (error) {
    next(error);
  }
}

const adminDeleteProductImage = async(req,res,next)=>{
  try {
    const imagePath = decodeURIComponent(req.params.imagePath);

    const path = require("path");
    const finalPath = path.resolve("../frontend/public") + imagePath;

    const fs = require("fs");
    fs.unlink(finalPath, ()=>{
      if(err){
        res.status(500).send(err);
      }
    })

    await Product.findOneAndUpdate(
      {_id: req.params.productId},  // find the productId
      {$pull:{images: {path: imagePath}}} // pull the that ID from product collection and update database
      ).orFail()

    return res.end();         // when we don't send any thing the use res.end()

  } catch (error) {
    next(error);
  }
}

module.exports = {getProducts,getProductById,getBestSeller,adminGetProducts,adminUpdateProducts,adminUpload,adminDeleteProductImage};



// Important Points

// Aggregation vs. Query Operations
// Using query operations, such as the find() method, you can perform the following actions:

// Select which documents to return.

// Select which fields to return.

// Sort the results.

// Using aggregation operations, you can perform the following actions:

// Perform all query operations.

// Rename fields.

// Calculate fields.

// Summarize data.

// Group values.

