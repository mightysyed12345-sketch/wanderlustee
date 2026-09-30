require("dotenv").config();
const mongoose=require("mongoose");
const initdata=require("./data.js");
const Listing=require("../models/listing.js");
const mbxGeocoding=require("@mapbox/mapbox-sdk/services/geocoding");
const localDbUrl = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.NODE_ENV === "production"
    ? process.env.ATLASDB_URL
    : localDbUrl;

async function initDB() {
    await mongoose.connect(dbUrl);
    await Listing.deleteMany({});

    const listings = initdata.data.map((obj) => ({
        ...obj,
        owner: "6aa42a67bde060d7cf7dfbaf",
        geometry: {
            type: "Point",
            coordinates: [0, 0],
        },
    }));

    await Listing.insertMany(listings);
    console.log("data was initialised");
    await mongoose.disconnect();
}

initDB().catch((err) => {
    console.error(err);
    process.exitCode = 1;
});