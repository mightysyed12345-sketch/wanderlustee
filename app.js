require('dotenv').config();


const express=require("express");
const app=express();

const mongoose=require("mongoose");
const path=require('path');
const mongourl='mongodb://127.0.0.1:27017/wanderlust';
const ejsMate=require("ejs-mate");
const Listing=require("./models/listing.js");
const wrapAsync=require("./utils/wrapAsync.js");
const Expresserror=require("./utils/Expresserror.js");
const {listingSchema,reviewSchema}=require("./schema.js");
const Review=require("./models/review.js");
const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");
const dbUrl = process.env.ATLASDB_URL || mongourl;

const session=require("express-session");
const { MongoStore }=require("connect-mongo");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");
const methodOverride=require("method-override");

if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
}

app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const sessionOptions={
    secret: process.env.SECRET || "wanderlust_dev_secret",
    resave:false,
    saveUninitialized:false,
    store: MongoStore.create({
        mongoUrl: dbUrl,
        touchAfter: 24 * 3600,
    }),
    cookie:  {
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
        secure: process.env.NODE_ENV === "production"
    },
};

//session middleware
app.use(session(sessionOptions));
app.use(flash());//pahle flash ayega phir routes ayegai

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(express.static(path.join(__dirname,"public")))

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();
});

app.use((req,res,next)=>{
    if (req.path !== "/" && mongoose.connection.readyState !== 1) {
        return res.status(503).json({
            success: false,
            error: "DatabaseUnavailable",
            message: "MongoDB is not connected. Add this server IP to MongoDB Atlas Network Access and restart the app."
        });
    }
    next();
});

// app.get("/demouser", async(req,res)=>{
//     let fakeUser=new User({
//         email:"mightysyed12345@gmail.com",
//         username:"syedmohammed"
//     });
//     let registeredUser=await User.register(fakeUser,"helloworld");//static method in which register(username,password,callback is our choice);
//     res.send(registeredUser);
// })

app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);
// app.get("/",(req,res)=>{
//     res.send("hi iam root");
// });
async function main(connectionUrl)  {
    await mongoose.connect(connectionUrl, {
        serverSelectionTimeoutMS: 15000,
    });
}

//index route 

// app.get("/testListing", async(req,res)=>{
//     let sampleListing=new Listing({
//         title:"My New villa",
//         description:"By the beach",
//         price:1200,
//         location:"Calanguate GOA",
//         country:"India",
//     });
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing");
// });

// app.set("view engine","ejs");
// app.set("views",path.join(__dirname,"views"));
// app.engine('ejs', ejsMate);
// app.use(express.static(path.join(__dirname,"public")));

//new  route 
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
});
const validateListing=(req,res,next)=>{
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(", ");
        next(new Expresserror(400, errMsg));
        return;
    }
    next();
};
const validateReview=(req,res,next)=>{
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(", ");
        next(new Expresserror(400, errMsg));
        return;
    }
    next();
};

//show route 
app.get("/listings/:id",wrapAsync(async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id).populate("reviews");
    if(!listing)  {
        req.flash("error","Listing you requested for does not exist");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs",{listing});
}));

//create the route 
app.post("/listings",validateListing,
    wrapAsync(async(req,res,next)=>{
        let newListing=new Listing(req.body.listing);
        await newListing.save();
        res.redirect("/listings");
}));
//edit route 
app.get("/listings/:id/edit",wrapAsync(async(req,res)=>{
    let {id}=req.params;
    let listing=await Listing.findById(id);
    if(!listing)  {
        req.flash("error","Listing you requested for does not exist");
        return res.redirect("/listings");
    }
}));
//update route 
app.put("/listings/:id",validateListing,wrapAsync(async(req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect("/listings");
}));
//delete route 
app.delete("/listings/:id" ,(wrapAsync(async(req,res)=>{
    let {id}=req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
    req.flash("success","Listing Deleted!");
    res.redirect("/listings");
})));
app.post("/listings/:id/reviews", validateReview, wrapAsync(async(req,res)=>{
    let listing=await Listing.findById(req.params.id);
    let newReview =new Review(req.body.review);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    res.redirect(`/listings/${listing._id}`);
}));
//delete  review route we are making here
app.delete("/listings/:id/reviews/:reviewId",wrapAsync(async(req,res)=>{
    let {id,reviewId}=req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});//review array sai review id ko remove karne ke liye $pull use karrray
    //pull operator removes the existing array all the instances of the value that match the specified condition.
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
}));
app.get("/",(req,res)=>{
    res.redirect("/listings");
});
const handleValidationErr=(err)=>{
    console.log("this was a Validation error.please follow rules");
    console.log(err);
    return err;
};
app.use((err,req,res,next)  =>   {
    if(err.name === "ValidationError" || err instanceof Expresserror)  {
        err = handleValidationErr(err);
    }
    console.error(err);
    res.status(err.statusCode || err.http_code || 500).json({
        success: false,
        error: err.name || "ServerError",
        message: err.message || "Something went wrong!"
    });
});
async function startServer() {
    const port = process.env.PORT || 8080;

    try {
        await main(dbUrl);
        console.log("connected to DB");
    } catch (err) {
        console.error("Configured database connection failed:", err.message);
        if (process.env.NODE_ENV !== "production" && !process.env.ATLASDB_URL) {
            await mongoose.disconnect();
            try {
                await main(mongourl);
                console.log("connected to local MongoDB");
            } catch (localErr) {
                console.error("Local MongoDB connection failed:", localErr.message);
            }
        }
    }

    app.listen(port,()=>{
        console.log(`server is listening to port ${port}`);
    });
}

startServer();