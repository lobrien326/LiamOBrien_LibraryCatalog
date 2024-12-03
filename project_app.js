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
    card_number: {type:String, required:true},
    pin: {type:String, required:true},
});
const patronData = mongoose.model("patronData", patronSchema);
const bookSchema = new mongoose.Schema({
    title: {type:String, required:true},
    author: {type:String, required:true},
    isbn: {type:String, required:true},
    sort_location: {type:String},
    publisher: {type:String},
    publication_year: {type:String},
    checked_out: {type:Boolean},
    checked_out_by: {type:String}
});
const bookData = mongoose.model("bookData", bookSchema);

app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");

app.get("/", async(req, res) => {

    let book;
    res.render("index",{bookData:book});
    
});
app.post("/search", async(req, res) => {
    let search = req.body.search_query;
    let searchTerm = "(?i)"+search+"(?-i)";
    const books = await bookData.find({$or:[{title:{$regex:searchTerm}},{author:{$regex:searchTerm}},{isbn:{$regex:searchTerm}}]});
    res.render("index",{bookData:books});
});
app.get('/book', async(req,res) => {
    const book = await bookData.findOne({isbn:req.query.isbn});
    res.render("book_details",{bookData:book});
})
app.post('/checkout', async(req,res) => {
    let cN = req.body.card_number;
    let pin = req.body.pin;

    const patron = await patronData.findOne({$and:[{card_number:cN},{pin:pin}]})

    if (patron != null) {
        const update = await bookData.updateOne({isbn:req.body.isbn},{$set:{checked_out:true,checked_out_by:cN}})
        console.log(update.modifiedCount)
        const books = await bookData.find({checked_out_by:cN})
        res.render("checkouts",{data:patron, bookData:books})
    } else {
        console.log("elsed")
        const book = await bookData.findOne({isbn:req.body.isbn});
        res.render("book_details",{bookData:book});
    }
})
// app.post("/search", async(req, res) => {
//     let searchTerm = req.body.search_query;
//     searchTerm = "(?i)"+searchTerm+"(?-i)";
//     const blocks = await bookData.find({title:{$regex:searchTerm}});
//     res.render("index",{data:blocks});
// });
// app.post("/update_name", async(req, res) => {
//     let prev_name = req.body.prev_name;
//     console.log(prev_name)
//     let new_name = req.body.new_name;
//     console.log(new_name)
//     const update = await Statblock.updateOne({monster_name:prev_name},{$set:{monster_name:new_name}});
//     console.log(update.modifiedCount)
//     const blocks = await Statblock.find({});
//     res.render("statblock_list",{data:blocks});
// })
app.get("/about", async(req, res) => {
    res.render("about");
});
app.get("/calendar", async(req, res) => {
    res.render("calendar");
});
app.get("/library_cards", async(req, res) => {
    let patron;
    res.render("sign_up", {data:patron});
});
app.post("/sign_up", async(req,res) => {
    let verified_unique = false;
    let cN;
    while (!verified_unique) {
        let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        cN = chars.charAt(Math.floor(Math.random() * chars.length))
        while (cN.length < 10) {
            cN += Math.floor(Math.random() * 10)
        }
        const verify = await patronData.findOne({card_number:cN})
        console.log("verifying")
        if (verify == null) {verified_unique = true;}
    }
    // const insert = await patronData.insertOne({name:req.body.name,email:req.body.email,card_number:cN,pin:req.body.pin})
    // const patron = await patronData.findOne({name:req.body.name},{email:req.body.email},{card_number:cN},{pin:req.body.pin})
    const patron = new patronData ({
        name:req.body.name,
        email:req.body.email,
        card_number:cN,
        pin:req.body.pin
    })
    try {
    const result = await patron.save();
    console.log(result);
    res.render("sign_up", {data:patron});
    } catch (err) {console.log(err)}
})
// app.get("/login", async(req, res) => {
//     const patron = await patronData.find({})
//     res.render("login", {data:patron});
// });
app.get("/checkouts", async(req, res) => {
    let book;
    res.render("checkouts", {bookData:book});
});
app.post("/checkouts", async(req, res) => {
    let cN = req.body.card_number;
    let pin = req.body.pin;
    const patron = await patronData.findOne({$and:[{card_number:cN},{pin:pin}]})
    const books = await bookData.find({checked_out_by:cN})
    res.render("checkouts",{data:patron, bookData:books})
})
app.post("/return", async(req,res) => {
    let cN = req.body.card_number;
    let pin = req.body.pin;
    const update = await bookData.updateOne({isbn:req.body.isbn},{$set:{checked_out:false,checked_out_by:null}})
    console.log(update.modifiedCount)
    const patron = await patronData.findOne({$and:[{card_number:cN},{pin:pin}]})
    const books = await bookData.find({checked_out_by:cN})
    res.render("checkouts",{data:patron, bookData:books})
})


app.listen(port, function(){});