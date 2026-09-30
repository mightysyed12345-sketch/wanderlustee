const User=require("../models/user.js");

module.exports.renderlogin=(req,res)=>{
    res.render("users/login.ejs")
};

module.exports.signup=async(req,res,next)=>{
    try  {
        const{username,email,password}=req.body;
        const newUser=new User({email,username});
        const registeredUser=await User.register(newUser,password);
        console.log(registeredUser);
        req.login(registeredUser,(err)=>{
            if(err)  {
                return next(err);
            }
            req.flash("success","Welcome to Wanderlust");
            res.redirect("/listings");
        });
    }catch(e)  {
        req.flash("error",e.message);
        res.redirect("/signup");
    }
};
module.exports.login=async(req,res)=>{
    const redirectUrl=res.locals.redirectUrl || "/listings";
    delete req.session.redirectUrl;
    req.flash("success","Welcome to WanderLust you are loggged in");
    res.redirect(redirectUrl);
};
module.exports.logout=(req,res,next)=>{
    req.logout((err)=>{
        if(err)  {
            return next(err);
        }
        req.flash("success","you are logged out!");
        res.redirect("/listings");
    })
};
module.exports.rendersignup=(req,res)=>{
    res.render("users/signup.ejs");
};