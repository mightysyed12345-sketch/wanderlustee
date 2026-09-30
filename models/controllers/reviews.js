const Listing=require("../models/listing");
const Review=require("../models/review");
module.exports.createReview=async(req,res)=>{
    console.log(req.params.id);
    let listing=await Listing.findById(req.params.id);
    let newReview =new Review(req.body.review);
    newReview.author = req.user?._id;
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success","New Review Created!");
    res.redirect(`/listings/${listing._id}`);
};
module.exports.deleteroute=async(req,res)=>{
    let {id,reviewId}=req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});//review array sai review id ko remove karne ke liye $pull use karrray
    //pull operator removes the existing array all the instances of the value that match the specified condition.
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","Review Deleted!");
    res.redirect(`/listings/${id}`);
};