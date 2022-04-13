# show-of-hands

A web app to get feedback and share snippets during a presentation

## Setting up

After you clone the library you will need to

 1. Copy the config.default.js file to config.js
 2. Make sure path to DB exists. Run `sqlite3 db/data.sqlite3 ".read db-schema.sql"` to initialize DB schema

 This application should run on the Google Compute Engine. To setup the
 machine with all the necessary dependencies, use the commands in

    scripts/setup.sh

 ## Running

  1. Use `npm run build` to compile the client side code
  2. Use `npm run start` to launch express server

## Importing Snippets

You can use the admin interface to create new snippets, but
there is also a helper script to load the information from a file. The 
helper script looks for lines that start with "#". You can set the
Title, Tag and Type (code or link) for each snippet using a different
indicator

Template:
```<language>
#! {title}}
## {tag -- no spaces allowed}
#@ {type, "code" or "link"}

{multiple lines of code would then go here}
```

Here's an example of importing one of these files

```<language>
node import-snippets sample-import-files/dplyr-snippets.R
```

Note that the file itself can be any text fie and the extension doesn't matter.
Here I've used R because I also can run this file in R directory to make
sure all the code snippets work. Existing snippets are not cleared before
importing so if you want to remove any current snippets, you'll need to do 
that first.