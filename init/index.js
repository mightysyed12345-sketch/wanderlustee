require("dotenv").config();
const mongoose=require("mongoose");
const initdata=require("./data.js");
const Listing=require("../models/listing.js");
const localDbUrl = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.NODE_ENV === "production"
    ? process.env.ATLASDB_URL
    : process.env.LOCAL_DB_URL || localDbUrl;

async function initDB() {
    if (!dbUrl) {
        throw new Error("Set ATLASDB_URL before seeding the production database.");
    }

    await mongoose.connect(dbUrl);

    const listings = initdata.data.map((obj) => ({
        ...obj,
        owner: "6aa42a67bde060d7cf7dfbaf",
        geometry: {
            type: "Point",
            coordinates: [0, 0],
        },
    }));

    const result = await Listing.bulkWrite(
        listings.map((listing) => ({
            updateOne: {
                filter: {
                    title: listing.title,
                    location: listing.location,
                    country: listing.country,
                },
                update: { $setOnInsert: listing },
                upsert: true,
            },
        }))
    );
    console.log(`Seed complete: added ${result.upsertedCount} listings; existing listings were preserved.`);
}

initDB()
    .catch((err) => {
        console.error("Listing seed failed:", err);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });