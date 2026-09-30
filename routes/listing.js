const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const {isloggedIn,isOwner,validateListing}=require("../middleware.js");
const listingController=require("../controllers/listing.js");
const multer  = require('multer');
const {storage}=require("../views/cloudConfig.js");
const upload = multer({ storage });



router
.route("/")
.get(wrapAsync(listingController.index))
.post(
    isloggedIn,
    upload.single('listing[image][url]'),
    validateListing,
    wrapAsync(listingController.createlisting)
);
//new route 
router.get("/new",isloggedIn,listingController.renderNewForm);
//creating the listing 
router
.route("/:id")
.get(wrapAsync(listingController.showListing))
.put(isloggedIn,
    isOwner,
    upload.single('listing[image][url]'),
    validateListing,
    wrapAsync(listingController.updatelisting)
)
.delete(isloggedIn,isOwner,wrapAsync(listingController.deletelisting));
//edit route 
router.get(
    "/:id/edit",
    isloggedIn,
    wrapAsync(listingController.renderEditForm)
);
module.exports=router;