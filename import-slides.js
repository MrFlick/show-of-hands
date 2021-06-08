// Script to import slides

const config = require('./config')
const fs = require('fs')
const data = require("./data-layer").getDataStore(config.db_path)

if ( process.argv.length !==3 ) {
    console.error('Expected filename to import!')
    process.exit(1)
}

async function addItem(image, thumb, seq, tag) {
    return data.addSlide({image_name: image, thumbnail_name: thumb, seq, tag})
}

// async function importSlidesViaCount(slideCount) {
//     for(var i=0; i<slideCount; i++) {
//        await addItem("Slide" + (i+1) + ".png", "Thumb" + (i+1) + ".png", i+1)
//     }
// }
//importSlidesViaCount(66);
const filename = process.argv[2]

function importSlidesViaFile(filename) {
    fs.readFile(filename, 'utf8', function(err, contents) {
    const lines = contents.split(/\r?\n/);
    (async () => {
        for(var i=0; i<lines.length; i++) {
            let fields = lines[i].split(",")
            let index = fields[0] || i+1;
            let tag = fields[1] || "";
            let image = fields[2] || `Slide${index}.PNG`
            let thumb = fields[3] || `Thumb${index}.PNG`
            await addItem(image, thumb, index, tag);
        }
    })();
    })
}


importSlidesViaFile(filename);



