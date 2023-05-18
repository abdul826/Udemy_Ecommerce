require("dotenv").config();

const mongoose = require('mongoose');

const connectDb = async()=>{
    try {
        mongoose.connect(process.env.MongoDB_URL,{
            useNewParse: true,
            useUndefinedTopology:true
        })
        console.log("Connect TO DataBase");
    } catch (error) {
        console.error("Connection Fail");
        process.exit(1);
    }
}

module.exports = connectDb;