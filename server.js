const express = require('express')
const app = express()
const port = 8000;

// Connect To Database
const connectDb = require('./config/db');
// connectDb();

const apiRoutes = require("./routes/apiRoutes")

app.get('/', (req, res) => {
    res.json({message: "API running..."})
})

app.use('/api', apiRoutes)


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
