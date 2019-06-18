# show-of-hands

A web app to get feedback and share snippets during a presentation

## Setting up

After you clone the library you will need to

 1. Copy the config.default.js file to config.js
 2. Make sure path to DB exists. Run `sqlite3 db/data.sqlite3 ".readdb-schema.sql"` to initialize DB schema

 ## Running

  1. Use `npm run build` to compile the client side code
  2. Use `npm run start` to launch express server