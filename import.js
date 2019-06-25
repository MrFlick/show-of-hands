// Script to import snippets

// Snippets should start with a line that begins with "##" and
// the srting after that will be used as the name. The rows until
// the next "##" line are used as the code. Leading/trailing blank
// lines are stripped out

const config = require('./config')
const fs = require('fs')
const data = require("./data-layer").getDataStore(config.db_path)

if ( process.argv.length !==3 ) {
    console.error('Expected filename to import!')
    process.exit(1)
}

const filename = process.argv[2]

async function addItem(title, body) {
    return data.addSnippet({title: title, code: body})
}

function importFile(filename) {
    fs.readFile(filename, 'utf8', function(err, contents) {
    const lines = contents.split(/\r?\n/)
    let body = [];
    let title = ""
    async function flush(title, body) {
        while (body.length && body[0]=="") {
            body.shift();
        }
        while (body.length && body[body.length-1]=="") {
            body.pop();
        }
        if (body.length) {
            await addItem(title, body.join("\n"));
        } else {
            await null;
        }
    }
    (async () => {
    for(var i=0; i<lines.length; i++) {
        let line = lines[i]
        if (line.startsWith("##")) {
            await flush(title, body);
            body = [];
            title = "";
            title = line.substring(2).trim()
        } else {
            body.push(line)
        }
    }
    await flush(title, body);
    })();
    })
}
importFile(filename);
