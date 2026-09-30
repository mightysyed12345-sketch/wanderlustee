const express=require("express");
const router=express.Router();
const User=require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport=require("passport");
const {saveredirectUrl:saveRedirectUrl}=require("../middleware.js");
const userController=require("../controllers/users.js");

router
.route("/signup")
.get(userController.rendersignup)
.post(wrapAsync(userController.signup));
router
.route("/login")
.get(userController.renderlogin)
.post(saveRedirectUrl,passport.authenticate("local",{
    failureRedirect:"/login",
    failureFlash:true,
    }),
    userController.login
);

router.route("/logout")
.get(userController.logout);

module.exports=router;
