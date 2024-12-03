//const http = require('http');
//const fs = require('fs');
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 8080;

/*This project relies on two schemas/collections. One for patron accounts, and one for the book data. I ended up using
Strings for just about everything because numbers had issues every time I tried to use them. Giving up and using strings
was just much easier.*/
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

/*Standard initializing junk*/
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");

/*The get for the homepage, as well as a few others, needs to have a random empty variable fed into it to prevent
some of the ejs from breaking.*/
app.get("/", async(req, res) => {
    let book;
    res.render("index",{bookData:book});
});
/*This search function uses the or statement to use the same search term to search for books by title, author, or isbn.
Oh, and a regular expression too. It's not a perfect search engine, but it's better than having to be exact. */
app.post("/search", async(req, res) => {
    let search = req.body.search_query;
    let searchTerm = "(?i)"+search+"(?-i)";
    const books = await bookData.find({$or:[{title:{$regex:searchTerm}},{author:{$regex:searchTerm}},{isbn:{$regex:searchTerm}}]});
    res.render("index",{bookData:books});
});
/*The book details page very intentionally uses the isbn in the url query so that each individual page could be bookmarked
or navigated to by just entering the isbn in the right spot. These are supposed to be very accessible pages.*/
app.get('/book', async(req,res) => {
    const book = await bookData.findOne({isbn:req.query.isbn});
    res.render("book_details",{bookData:book});
})
/*The checkout function first verifies that the user info entered matches a patron on file, and if it doesn't, redirects to
the same book page for them to try again. If it does match, it will update the book's checkout info to show that it's checked
out, and attaches the user's unique card_number to the book so it can be retrieved by the checkouts page. */
app.post('/checkout', async(req,res) => {
    let cN = req.body.card_number;
    let pin = req.body.pin;

    //checks if user details match a user on file
    const patron = await patronData.findOne({$and:[{card_number:cN},{pin:pin}]})

    //does what it should based on whether a user is found or not
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
//very basic page, very basic get
app.get("/about", async(req, res) => {
    res.render("about");
});
//same
app.get("/calendar", async(req, res) => {
    res.render("calendar");
});
//just going to the library card signup page is simple, but requires dummy information like the index
app.get("/library_cards", async(req, res) => {
    let patron;
    res.render("sign_up", {data:patron});
});
/*Using the library card signup, on the other hand, is a bit more complicated. First there is some code that generates a
standard card_number, and ensures it is unique. (if not, which is low odds, it will just try again) */
app.post("/sign_up", async(req,res) => {
    let verified_unique = false;
    let cN;
    //this is the generation loop
    while (!verified_unique) {
        //it picks a random character
        let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        cN = chars.charAt(Math.floor(Math.random() * chars.length))
        //then adds 9 random digits
        while (cN.length < 10) {
            cN += Math.floor(Math.random() * 10)
        }
        //then checks that the 10-digit combo doesn't exist already
        const verify = await patronData.findOne({card_number:cN})
        console.log("verifying")
        //if it doesn't exist, we leave the loop. If not, we try again.
        if (verify == null) {verified_unique = true;}
    }

    //This is just the basic schema needed to add a new patron to the collection nothing special.
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
//Once again, a basic page that needs dummy information when normally loaded.
app.get("/checkouts", async(req, res) => {
    let book;
    res.render("checkouts", {bookData:book});
});
/*If user data is entered, it redirects to the same page but with an added list of the books they've checked out.*/
app.post("/checkouts", async(req, res) => {
    let cN = req.body.card_number;
    let pin = req.body.pin;
    const patron = await patronData.findOne({$and:[{card_number:cN},{pin:pin}]})
    const books = await bookData.find({checked_out_by:cN})
    res.render("checkouts",{data:patron, bookData:books})
})
/*If the return button is pressed on a book that's been checked out, this resets its checked out attributes to the default,
then redirects to the checkouts page of the same user again. The returned book is now gone! */
app.post("/return", async(req,res) => {
    let cN = req.body.card_number;
    let pin = req.body.pin;
    const update = await bookData.updateOne({isbn:req.body.isbn},{$set:{checked_out:false,checked_out_by:null}})
    console.log(update.modifiedCount)
    const patron = await patronData.findOne({$and:[{card_number:cN},{pin:pin}]})
    const books = await bookData.find({checked_out_by:cN})
    res.render("checkouts",{data:patron, bookData:books})
})

//Does this need to be explained? It's the standard thing.
app.listen(port, function(){});