const express = require("express");
const app = express()
const path = require("path")
const cors = require("cors")
const errorHandler = require("./middleware/errorHandler")
const config = require('../RoleBasedMern/env/key')

const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")

// "mongodb://localhost:27017/mern"

const mongoose = require("mongoose");
const connect = mongoose.connect("mongodb://localhost:27017/mern",
  {
    useNewUrlParser: true,
    useCreateIndex: true, useFindAndModify: false
  })
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

  app.use(cors())

//to not get any deprecation warning or error
//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true }));
//to get json data
// support parsing of application/json type post data
app.use(bodyParser.json());
app.use(cookieParser());


app.use('/accounts', require('./routes/accountController'))
app.use('/youtube', require('./routes/youtubeController'))
app.use('/subscribe', require('./routes/subscribeController'))
app.use('/comment', require('./routes/commentController'))
 app.use('/like', require('./routes/likeController'))
app.use(errorHandler)

app.use('/uploads', express.static('uploads'));

// Serve static assets if in production
if (process.env.NODE_ENV === "production") {

  // Set static folder   
  // All the javascript and css files will be read and served from this folder
  app.use(express.static("client/build"));

  // index.html for all page routes    html or routing and naviagtion
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client", "build", "index.html"));
  });
}

// server port
const port = process.env.PORT || 5000
app.listen(port, () => {
  console.log(`Server running at ${port}`)
});



