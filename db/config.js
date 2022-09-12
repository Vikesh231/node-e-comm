const mongoose = require('mongoose');
const dotenv = require('dotenv').config()
const DB = process.env.DATABASE

// mongoose.connect('mongodb://localhost:27017/E-comm').then(() =>{
// mongoose.connect(DB).then(() =>{
//     console.log("database connected...........")
// }).catch((err)=>{
//     console.log('error',err)
// })

//////////////////////




mongoose
  .connect(DB, {
    usenewurlparser: true,
    useunifiedtopology: true,
  })
  .then(() => {
    console.log("Successfully connected ");
  })
  .catch((error) => {
    console.log(`can not connect to database, ${error}`);
  });