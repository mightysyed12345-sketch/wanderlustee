// we are doing this because of the mvc framework model views controller framework
const Listing=require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken=process.env.MAP_TOKEN;
const geocodingClient = mapToken ? mbxGeocoding({ accessToken: mapToken }) : null;

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

module.exports.index=async(req,res)=>{
    const searchTerm = req.query.search?.trim();
    let allListings;
    if (searchTerm) {
        const countryAliases = {
            usa: "United States",
            us: "United States",
            "u.s.": "United States",
            uk: "United Kingdom",
            uae: "United Arab Emirates",
        };
        const normalizedSearchTerm = countryAliases[searchTerm.toLowerCase()] || searchTerm;
        const searchRegex = new RegExp(escapeRegex(normalizedSearchTerm), "i");
        allListings = await Listing.find({
            $or: [
                { title: searchRegex },
                { country: searchRegex },
                { location: searchRegex }
            ]
        });
    } else {
        allListings = await Listing.find({});
    }
    res.render("listings/index.ejs", { allListings, search: searchTerm });
};
module.exports.renderNewForm=(req,res)=>{
    res.render("listings/new.ejs");
}
module.exports.showListing=async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id).
    populate({
        path:"reviews",
        populate:{
            path:"author",
        },
    })
    .populate("owner");
    if(!listing)  {
        req.flash("error","Listing you are requested for does not exist!");
        return res.redirect("/listings");
    }
    const coordinates = listing.geometry?.coordinates;
    const hasPlaceholderCoordinates = Array.isArray(coordinates)
        && coordinates.length === 2
        && coordinates.every((coordinate) => coordinate === 0);

    if (geocodingClient && (!Array.isArray(coordinates) || coordinates.length !== 2 || hasPlaceholderCoordinates)) {
        const response = await geocodingClient.forwardGeocode({
            query: `${listing.location}, ${listing.country}`,
            limit: 1,
        }).send();
        const feature = response.body.features[0];
        if (feature) {
            listing.geometry = feature.geometry;
            await listing.save();
        }
    }
    if (!listing.geometry) {
        listing.geometry = { type: 'Point', coordinates: [0, 0] };
    }
    res.render("listings/show.ejs",{listing});
};
module.exports.createlisting=async(req,res,next)=>{
    if (geocodingClient) {
        let response=await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
        })
        .send();
        req.body.listing.geometry = response.body.features[0].geometry;
    } else {
        req.body.listing.geometry = { type: 'Point', coordinates: [0, 0] };
    }
    if (req.file) {
        req.body.listing.image = {
            filename: req.file.filename,
            url: req.file.path
        };
    }
    const newListing=new Listing(req.body.listing);
    newListing.owner=req.user._id;
    let savedlisting=await newListing.save();
    req.flash("success","New Listing Created!");
    res.redirect("/listings");
};
module.exports.renderEditForm=async(req,res)=>{
    let {id}=req.params;
    let listing=await Listing.findById(id);
    if(!listing)  {
        req.flash("error","Listing you are Requested for does not exist!");
        res.redirect("/listings");
    }
    res.render("listings/edit.ejs",{listing});
};
module.exports.updatelisting=async(req,res)=>{
    let {id}=req.params;
    let listing=await Listing.findById(id);
    const listingData={...(req.body?.listing || {})};
    if (req.file) {
        listingData.image = {
            filename: req.file.filename,
            url: req.file.path
        };
    }
    await Listing.findByIdAndUpdate(id,listingData);
    req.flash("success","Listing Updated!");
    res.redirect(`/listings/${id}`);
};
module.exports.deletelisting=async(req,res)=>{
    let {id}=req.params;
    let listing=await Listing.findById(id);
    let deletedListing=await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","Listing Deleted!");
    res.redirect("/listings");
};
