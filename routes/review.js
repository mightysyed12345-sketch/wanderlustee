const express=require("express");
const router=express.Router({mergeParams:true});
const wrapAsync=require("../utils/wrapAsync.js");
const {isloggedIn,isReviewAuthor,validateReview}=require("../middleware.js");
const reviewController=require("../controllers/reviews.js");

router.post("/", validateReview, wrapAsync(reviewController.createReview));
//delete  review route we are making here
router.delete("/:reviewId",isloggedIn,isReviewAuthor,wrapAsync(reviewController.deleteroute));
module.exports=router;