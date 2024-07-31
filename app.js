const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");



const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));

const bcryptSalt = bcrypt.genSaltSync(10);

const postSchema = {
  title: String,
  content: String
};

const userSchema ={
  email:String,
  password:String
};

const Post = mongoose.model("Post", postSchema);

const User=mongoose.model("User",userSchema);

app.get("/", async(req, res) =>{
  await mongoose.connect("mongodb://0.0.0.0:27017/newDB", {useNewUrlParser: true});
  Post.find().then((post) => {
    res.render("main", {
          posts: post
          });

});
});

app.get("/login", async(req, res) =>{
  res.render("login");
});

app.post("/login",async(req,res)=> {
    try {
      await mongoose.connect("mongodb://0.0.0.0:27017/newDB", { useNewUrlParser: true });
      const email = req.body.email;
      const password = req.body.password;

      // const query = { email: email }; // Use the correct field name for email
      const user = await User.findOne({email});

      if (!user) {
        return res.send("User not found");
      }
      const passOk = bcrypt.compareSync(password, user.password);

      if (passOk) {
        return res.redirect("/complete");
      } else {
        return res.send("Invalid password");
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred while logging in.");
    }
  });


app.get("/register", async(req, res) =>{
  res.render("register");
});

app.post("/register", async(req, res) =>{

    try {
      await mongoose.connect("mongodb://0.0.0.0:27017/newDB", { useNewUrlParser: true });

      if(req.body.email=="" || req.body.email.indexOf('@')==-1) {
        return res.status(500).send("An error occurred while registering.");
        // alert("error occur while registering");

      }

      const e2=req.body.email;

      const user1 = await User.findOne({e2});

      if (user1) {
        return res.status(500).send("User already exists");
      }

      const hash = bcrypt.hashSync(req.body.password, bcryptSalt);

      const user = new User({
        email: req.body.email,
        password: hash
      });

      await user.save();

      res.redirect("/complete");
    } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred while registering.");
    }


});

app.get("/complete", async(req, res) =>{

  await mongoose.connect("mongodb://0.0.0.0:27017/newDB", {useNewUrlParser: true});

  Post.find().then((post) => {
    res.render("complete", {
          posts: post
          });

});
});

app.post("/complete" ,async(req,res) => {
  await mongoose.connect("mongodb://0.0.0.0:27017/newDB", {useNewUrlParser: true});
  const post = new Post({
    title: req.body.title,
    content: req.body.content
  });
  await post.save();
  res.redirect("/complete");
});

app.listen(3000, function() {
    console.log("Server started on port 3000");
  });
