Jumping straight in to the brass tacks: to run this project you will need to use MongoDB. There are two collections, in the form of .json files, included in the root directory of the repo (patronData.json and bookData.json). Only the book data is really necessary as there is no function to add books, but patrons can be added freely. With those collections loaded into mongodb, you should just be able to node or nodemon on project_app.js and then view the webpage at localhost:8080, standard procedure. A few other minor setup notes: there are a few places where the pages reference to an external image source, which I found to be spotty. I added a few pictures to the public folder to cover some of these gaps, but they aren't fundamentally important.

I've run a bit low on time and energy, so comments are sparse right now. Ideally I change that today and can remove this.

To the best of my knowledge, this project showcases a lot of the expected features. Adding, updating, searching, viewing, all present. Removal operations did wind up on the cutting room floor, unfortunately. So did my more advanced ambitions when it came to signing in. I swear I could have saved so much wasted time and effort if I just knew how to use cookies. Javascript functions are light as well, which I know isn't ideal, but I didn't wind up needing them for the core functionality and didn't get to much more than core functionality. Compared to my project in CIS 393, I feel there were some significant improvements but also some serious tradeoffs in this one. The code is overall much cleaner, and in a better state, than my last project. Making updates or changes to this would be much easier. However, of course, I did skimp in a few areas that were represented in my previous project. Personally, I'm fine with that, as I accomplished my personal goals with this project. Those goals just didn't line up exactly with what you wanted from us.