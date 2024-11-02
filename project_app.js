//const http = require('http');
//const fs = require('fs');
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 8080;

/*I've got some filler mongoDB stuff here because I'll probably use it again, unless I need to do something that I can only figure out how to do with sql.
  There's a lot of stuff that's being left on the cutting room floor for now because it will depend on how I want to implement the backend later, but I
  figured it'd be better to have placeholder backend interactions because it will make my job easier later.*/
mongoose.connect("mongodb://127.0.0.1/library_database").catch((err) => handleError(err));
const patronSchema = new mongoose.Schema({
    name: {type:String, required:true},
    email: {type:String},
    card_number: {type:Number, required:true},
    pin: {type:Number, required:true},
});
const patronData = mongoose.model("patronData", patronSchema);

app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");


app.get("/", async(req, res) => {
    const patron = await patronData.find({})
    res.render("index", {data:patron});
});
app.get("/about", async(req, res) => {
    const patron = await patronData.find({})
    res.render("about", {data:patron});
});
app.get("/calendar", async(req, res) => {
    const patron = await patronData.find({})
    res.render("calendar", {data:patron});
});
app.get("/library_cards", async(req, res) => {
    const patron = await patronData.find({})
    res.render("sign_up", {data:patron});
});
app.get("/login", async(req, res) => {
    const patron = await patronData.find({})
    res.render("login", {data:patron});
});


app.listen(port, function(){});