# Wanderlust

An Express, EJS and MongoDB stay discovery app. The refreshed Explore page includes responsive listing cards, category filters, a tax display switch, save buttons, destination search, and a browser-side AI-style trip planner that recommends from the currently available stays.

## Run locally

1. Install Node.js 24 and MongoDB, then run `npm install`.
2. Copy `.env.example` to `.env` and set `SECRET`, `ATLASDB_URL`, `MAP_TOKEN`, and your Cloudinary credentials. The development app can use local MongoDB at `mongodb://127.0.0.1:27017/wanderlust`.
3. Run `npm start` and visit `http://localhost:8080`.

The trip planner does not call a hosted model or require an API key. It ranks the loaded listing titles, descriptions, destinations and prices in the browser. The seed data initializer in `init/index.js` clears existing listings, so only run it when you intend to reseed that database.
