// Script to import slides

const config = require('./config')
const fs = require('fs')
const data = require("./data-layer").getDataStore(config.db_path)

if ( process.argv.length !==2 ) {
    process.exit(1)
}

async function addItem(image, thumb, seq) {
    return data.addSlide({image_name: image, thumbnail_name: thumb, seq: seq})
}

async function importSlides(slideCount) {
    for(var i=0; i<slideCount; i++) {
       await addItem("Slide" + (i+1) + ".png", "Thumb" + (i+1) + ".png", i+1)
    }

}
importSlides(66);
