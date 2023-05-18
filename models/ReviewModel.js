const mongoose = require("mongoose");

const reviewSchema = mongoose.Schema({
    comment:{
        type:String,
        require: true
    },
    rating:{
        type: Number,
        require: true
    },
    user:{
        //Id is a special type of object in mongoDb database so for defining ID we write "mongoose.Schema.Types.ObjectId"
        _id : {
            type: mongoose.Schema.Types.ObjectId
        } ,
        name:{
            type: Number,
        require: true
        }
    }
})