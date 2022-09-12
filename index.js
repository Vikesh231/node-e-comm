const express = require("express");
const mongoose = require("mongoose");
const app = express();
const connect = require("./db/config");
const products = require("./db/products");
const Use = require("./db/users");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const jwtkey = "e-com";
const port = process.env.PORT || 8003;

const bcrypt = require("bcryptjs");
let cookieParser = require("cookie-parser");
// const { db } = require('./db/model');
app.use(cookieParser());

app.use(cors());
app.use(bodyParser.json());

let cook = {
  name: "Ritik",
  email: "ritik@gmail.com",
};

// app.use(express.json())
app.get("/", (req, res) => {
  console.log("app is working....");
  //   res.cookie("userData", cook)
  //   console.log(jwt.sign());
  res.send("working....");
});
{
  // app.get('/cooies', (req,res)=>{
  //     res.send(req.cookies)
  // })
}
app.post("/register", async (req, res) => {
  let data = new Use(req.body);
  //  console.log("data: ", data);
  if (data.name != "" && data.email != "" && data.password != "") {
    let result = await data.save();
    console.log("result: ", result);
    result = result.toObject();
    delete result.password;
    jwt.sign({ result }, jwtkey, { expiresIn: "12h" }, (error, token) => {
      if (error) {
        res.send({ message: "some error occured" });
      }
      console.log({ result, auth: token });
      res.send({ result, auth: token });
    });
  } else {
    console.log("enter field");
    // res.send( )
  }
  //  let haspass = await bcrypt.hash(req.body.password, 10)
  //  console.log(haspass);
  //  data.password = haspass

  //  res.send(result)
});

app.post("/login", async (req, res) => {
  //    console.log(req.body);/////.select('-password');
  console.log(req.body.email, req.body.password);
  if (req.body.email && req.body.password) {
    let result = await Use.findOne({ email: req.body.email });
    // console.log(re,"object")
    if (result) {
      if (result.password == req.body.password) {
        result = result.toObject();
        delete result.password;
        
        jwt.sign({ result }, jwtkey, { expiresIn: '1m' }, (error, token) => {
          if (error) {
            res.send({ message: "some error occured" });
          }
          console.log("jwtttttt");
          res.send({ result, auth: token });
        });
        /*
        jwt.verify(token, 'shhhhh', function(err, decoded) {
          if (err) {
            
              err = {
                name: 'TokenExpiredError',
                message: 'jwt expired',
                expiredAt: 1408621000
              }
              console.log("expireddddddddddd........");
              res.send({ err })
            
          }
        });
        */
      } else {
        console.log("incorrect detail");
        res.send({ message: "incorrect detail" });
        //
      }
    } else {
      console.log("user not found");
      res.send({ message: "user not found" });
    }
  } else {
    console.log("empty field");
    res.send("empty field ");
  }
});

app.post("/addproduct", verifyToken, async (req, res) => {
  // console.log("req: ", req); async(req,res)=>{
  // console.log(req.body);
  let result = new products(req.body);
  let data = await result.save();
  res.send(data);
});

app.get("/product", verifyToken, async (req, res) => {
  // console.log("req: ", req);async (req,res)=>{
  try {
    // let result = await products.find().limit(2).skip(3);
    let result = await products.find({}, { lap_storage: { $slice: [2, 2] } });
    // console.log("result: ", result);
    res.send(result);
    // return false
    // console.log("result: ", result);
  } catch (e) {
    console.log(e,'catch part');
  }
  });

app.delete("/product/:id", verifyToken, async (req, res) => {
  // console.log("req: ", req); async(req,res)=>{
  // console.log(req);

  let result = await products.deleteOne({ _id: req.params.id });
  res.send(result);
});

app.get("/product/:id", verifyToken, async (req, res) => {
  // console.log("req: ", req);async(req,res)=>{

  let result = await products.findOne({ _id: req.params.id });
  if (result) {
    res.send(result);
  } else {
    res.send("product not found");
  }
});

app.put("/update/:id", verifyToken, async (req, res) => {
  // console.log("req: ", req); async(req,res)=>{
  // console.log("req: ", req);

  let result = await products.updateOne(
    { _id: req.params.id },
    {
      $set: req.body,
    }
  );
  res.send(result);
});

app.get("/search/:key", verifyToken, async (req, res) => {
  // console.log("req: ", req);
  let result = await products.find({
    $or: [
      { name: { $regex: req.params.key } },
      { category: { $regex: req.params.key } },
      { company: { $regex: req.params.key } },
    ],
  });
  res.send(result);
});

function verifyToken(req, res, next) {
    console.log("varifing...");
  let token = req.headers["authorization"];
  // console.log("token: ", token);
  req.authenticated = false;
  if (token) {
    token = token.split(" ")[1];
    // console.log("midd    le called",token);
    jwt.verify(token, jwtkey, (err, decoded) => {
     if (err) {
        // console.log(err);
        console.log("token expired............");
        
        errr = {
          name: 'TokenExpiredError',
          message: 'jwt expired',
          expiredAt: 1408621000
        }
        
      //  StorageEvent.dispatch.logout()
      //  next()
        res.send({ result: errr});
        return false
      } else {
        console.log("token valid");
        next();
      }
      
    //   if (err){
    //     console.log(err,'dfghjk');
    //     req.authenticated = false;
    //     req.decoded = null;
    // } else {
    //     console.log("33333");
    //     req.decoded = decoded;
    //     req.authenticated = true;
    //     next();
    // }   
    });
  } 
  // next();
  else {
    res.send({ result: "please add token in header" });
  }
}

app.listen(port, () => {
  console.log("server run on http://localhost:" + port);
});
