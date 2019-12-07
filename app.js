const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const localStrategy = require("passport-local");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const User = require("./models/user");
const Project = require("./models/project");

mongoose.Promise = global.Promise;

const app = express();

function seedDB(){
   //Remove all users
   User.remove({}, function(err){
        if(err){
            console.log(err);
        }
        console.log("removed Users!");
    });
    Project.remove({}, function(err){
        if(err){
            console.log(err);
        }
        console.log("removed Projects!");
    });
}

// mongoose.connect("mongodb://localhost/CommonForm", {useNewUrlParser: true}); 
mongoose.connect("mongodb+srv://RaviTeja6820:tanishka6113@commonform-gkkv1.mongodb.net/test?retryWrites=true&w=majority", {useNewUrlParser: true});

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(flash());

app.use(require("express-session")({
    secret: "This is the best website ever",
    resave: false,
    saveUninitialized: false
}));

const isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()){
        return next();
    } 
    req.flash("error", "You need to be logged in to do that");
    res.redirect("/");
};



app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});



// seedDB();

app.get("/", (req, res) => {
    res.render("home");
});



app.get("/main", isLoggedIn, async (req, res) => {
        let allUsers = null, projects = null;
        try {
            await User.find({}, async (err, foundUsers) => {
                if(err) { 
                    console.log(err);
                } else {
                    allUsers = foundUsers;
                    try {
                        await Project.find({users: { $all: [`${req.user.username}`] } }, async (err, foundProjects) => {
                            if(err) { 
                                console.log(err);
                            } else {
                                res.render("main", {users: allUsers, projects: foundProjects});
                            }
                        }).exec();
                    } catch (error) {
                        console.log(error);
                    }
                }
            }).sort('username').exec();
        } catch (error) {
            console.log(error);
        }
    
});

app.post("/main", isLoggedIn,(req, res) => {
    var title = req.body.projectTitle;
    var creator = {
        id: req.user._id,
        username: req.user.username
    };
    var summary =  req.body.summary;
    var users =  req.body.users; 
    var tabCount = 1;
    var text = [""];

    var newProject = {
        title: title,
        creator: creator,
        summary: summary,
        users: users,
        tabCount: tabCount,
        text: text
    };

    Project.create(newProject, (err, newlyCreated) => {
        if(err){
            res.send(err.message);
        } else {
            req.flash("success", `Project ${title} succesfully created`);
            res.redirect("/main");
        }
    });
});

app.post("/main/tab", isLoggedIn, async (req, res) => {
    await Project.findOne({ _id: `${req.body.action}` }, (err, doc) => {
        doc.tabCount += 1;
        doc.text.push(" ");
        doc.save();
      });
    res.redirect("/main");
});

app.post("/main/update", isLoggedIn, async (req, res) => {
    await Project.findOne({ _id: `${req.body.action}` }, (err, doc) => {
        doc.text.set(req.body.index, req.body.text);
        doc.save();
      });
      res.redirect("/main");
});

app.post("/login",passport.authenticate("local",
    {successRedirect: "/main",
    failureRedirect: "/",
    failureFlash: true
    }), (req, res) => { 
});

app.post("/signup", (req, res) => {
    if (req.body.password !== req.body.rePassword) {
        req.flash("error", "New password and ReEntered passwords do not match");
        res.redirect("/");
    } else {
    const newUser = new User({username: req.body.username, numProjects: 0});
    User.register(newUser, req.body.password, (err, user) => {
        if(err){
            req.flash("error", err.message);
            res.redirect("/");
        } 
        passport.authenticate("local")(req, res, () => {
            req.flash("success", "Welcome to CommonForm " + "<strong class='green p-1 px-3 rounded-pill'>" + user.username + "</strong>" );
            res.redirect("/main");
        });
    }); 
    }
});

app.get("/logout", (req, res) => {
    req.logOut();
    req.flash("success", "Succesfully Logged you out");
    res.redirect("/");
});

app.get("/createProject", (req, res) => {
    res.render("createProject");
});

app.listen(process.env.PORT || 2000, process.env.IP, () => {
    console.log("Server Started Succesfully");
});
