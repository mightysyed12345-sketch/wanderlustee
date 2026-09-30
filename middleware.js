const Listing=require("./models/listing");
const Review=require("./models/review.js");
const {listingSchema,reviewSchema}=require("./schema.js");
const Expresserror=require("./utils/Expresserror.js");

module.exports.isloggedIn=(req,res,next)=>{
    console.log(req.path,"..",req.originalUrl);
    if(!req.isAuthenticated())  {
        //redirect url save it 
        req.session.redirectUrl=req.originalUrl;
        req.flash("error","you must be loggged in to create listing");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveredirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl)  {
        res.locals.redirectUrl=req.session.redirectUrl || "listings";
    }
    next();
};
module.exports.isOwner=async (req,res,next) =>{
    let {id}=req.params;
    let listing=await Listing.findById(id);
    if (!listing.owner.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the owner of this listing");
        return res.redirect(`/listings/${id}`);
    }
    next();
}
module.exports.validateListing=(req,res,next)=>{
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(", ");
        next(new Expresserror(400, errMsg));
        return;
    }
    next();
};
module.exports.validateReview=(req,res,next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(", ");
        next(new Expresserror(400, errMsg));
        return;
    }
    next();
};
module.exports.isReviewAuthor=async (req,res,next) =>{
    let { id,reviewId}=req.params;
    let review=await Review.findById(reviewId);
    if (!review || !review.author || !review.author.equals(req.user._id)) {
        req.flash("error", "You are not the author of this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
}