const express = require('express')
const app = express();
const fileUpload = require("express-fileupload");
const port = 8000;

// Connect To Database
const connectDb = require('./config/db');
// connectDb();

app.use(express.json());   // use to get the json data in postman
app.use(fileUpload);        // use to upload file in postman

const apiRoutes = require("./routes/apiRoutes")

app.get('/', (req, res) => {
    res.json({message: "API running..."})
})

app.use('/api', apiRoutes)


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
