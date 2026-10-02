# Wanderlust

An Express, EJS and MongoDB stay discovery app. The refreshed Explore page includes responsive listing cards, category filters, a tax display switch, save buttons, destination search, and a browser-side AI-style trip planner that recommends from the currently available stays.

## Run locally

1. Install Node.js 24 and MongoDB, then run `npm install`.
2. Copy `.env.example` to `.env` and set `SECRET`, `MAP_TOKEN`, and your Cloudinary credentials. Development uses local MongoDB at `mongodb://127.0.0.1:27017/wanderlust` by default; set `LOCAL_DB_URL` only if you want a different local database URL. In production, set `ATLASDB_URL` in the hosting provider's environment settings. It must be the complete MongoDB Atlas URI, including the `mongodb+srv://` scheme, database user, password, and cluster hostname. URL-encode special characters in the password, allow the host's outbound IP in Atlas Network Access, and make sure the Atlas cluster is running.
3. Run `npm start` and visit `http://localhost:8080`.

The trip planner does not call a hosted model or require an API key. It ranks the loaded listing titles, descriptions, destinations and prices in the browser. The seed data initializer in `init/index.js` clears existing listings, so only run it when you intend to reseed that database.
