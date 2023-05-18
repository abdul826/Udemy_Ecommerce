const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
    name:{
        type: String,
        require:true,
        unique: true
    },
    description:{
        type: String,
        require:true,
    },
    category:{
        type: String,
        require:true,
    },
    count:{
        type: Number,
        require:true,
    },
    price:{
        type: String,
        require:true,
    },
    rating:{
        type: Number,
        require:true,
    },
    reviewsNumber:{
        type: Number,
        require:true,
    },
    sales:{
        type: Number,
        default:0,
    },
    attrs:[
        {
            key : {type: String}, value : {type: String}
        }
    ],
    images:[],
    reviews : []
},{
    timestamp: true
});

productSchema.index();       //It will give the index to ptoductSchema

const Product = mongoose.model('Products', productSchema);

module.exports = Product;