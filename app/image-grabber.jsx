function has_modern_upload() {
    var div = document.createElement("div");
    return (("draggable" in div) || ("ondragstart" in div && "ondrop" in div)) && "FormData" in window && "FileReader" in window;
};

function eventRepeat(obj, events, handler) {
    events.split(" ").map(x => obj[x] = handler)
}

function toArray(x) {
    return Array.prototype.slice.call(x)
}

export class ImageGrabber extends React.Component {
    constructor(props) {
        super(props)

        this.dropped_files = []
        this.state = {
            is_submitting: false,
            can_drop: false,
            percent_complete: 0,

        }
        if (!has_modern_upload()) {
            alert("Browser not supported");
        }
    }

    uploadProgress = (e) => {
        if (e.lengthComputable) {
            var percentComplete = Math.round(evt.loaded * 100 / evt.total);
            this.setState({precent_complete: percentComplete})
        }
    }

    uploadFailed = (msg) => {
        this.setState({
            precent_complete: 0,
            is_submitting: false})
        alert("There was an error attempting to upload the file" + ((msg)?": "+msg:""));
    }

    uploadCanceled = () => {
        this.setState({
            precent_complete: 0,
            is_submitting: false})
        alert("The upload has been canceled by the user or the browser dropped the connection.");
    }

    uploadComplete = (resp) => {
        this.setState({
            precent_complete: 0,
            is_submitting: false})
        if (this.onupload) {
            this.onupload(resp);
        }
    }

    uploadFile = ()  => {
        this.setState({ is_submitting: true })
        var fd = new FormData();
        fd.append("file", this.dropped_files[0]);
        fd.append("file_name", this.dropped_files[0].name);
        var xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", uploadProgress, false);
        xhr.addEventListener("load", () => {
            /* This event is raised when the server send back a response */
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    var resp = JSON.parse(xhr.responseText);
                    this.uploadComplete(resp);
                } catch (ex) {
                    this.uploadComplete(xhr.responseText);
                }
            } else {
                try {
                    var resp = JSON.parse(xhr.responseText);
                    this.uploadFailed(resp.error);
                } catch (ex) {
                    this.uploadFailed(xhr.responseText);
                }
            }
            this.dropped_files = [];
            this.checkReadyToUpload();
        }, false);
        xhr.addEventListener("error", this.uploadFailed, false);
        xhr.addEventListener("abort", this.uploadCanceled, false);
        xhr.open("POST", this.props.action);
        xhr.send(fd);
    }

    checkReadyToUpload = () => {
        if (this.dropped_files.length) {
            //submitButton.show().text("Upload File (" + dropped_files[0].name + ")");
        } else {
            //submitButton.hide();
        }
    };


    handleImageSend = (e) => {
        this.uploadFile();
    }

    arrestEvent = (e) => {
        e.preventDefault();
        e.stopPropagation();
    }
    handleDragOver = (e) => {
        this.arrestEvent(e)
        this.setState({can_drop: true})

    }
    handleDragLeave = (e) => {
        this.arrestEvent(e)
        this.setState({can_drop: false})
    }

    handleDrop = (e) => {
        if (e.originalEvent.dataTransfer.items.length) {
            this.dropped_files = toArray(e.originalEvent.dataTransfer.files);
        } else {
            this.dropped_files = [];
        }
        this.checkReadyToUpload();
    }

    handleFileChange = (e) => {
        this.dropped_files = toArray(e.originalEvent.target.files) || [];
        this.checkReadyToUpload();
    }

    getPastedImages = (e) => {
        var cd = e.originalEvent.clipboardData
        if(cd) {
            let items = toArray(cd.items)
            return items.filter(x => x.type.indexOf("image")!==-1).
                map(x => x.getAsFile())
        }
        return []
    }

    handlePaste = (e) => {
        e.preventDefault();
        this.dropped_files = getPastedImages(e);
        this.checkReadyToUpload();
    }

    attachDocumentEvents = () => {
        document.addEventListener("paste",  this.handlePaste)
    }
    unattachDocumentEvents = () => {
        document.removeEventListener("paste",  this.handlePaste)
    }
    componentDidMount = () => {
        attachDocumentEvents()
    }
    componentWillUnmount = () => {
        unattachDocumentEvents()
    }

    render() {
        var events = {}
        repeatEvents(events, "onDrag onDragStart", this.arrestEvent)
        repeatEvents(events, "onDragOver onDragEnter", this.handleDragOver)
        repeatEvents(events, "onDragLeave onDragEnd onDrop", this.handleDragLeave) 
        images = this.dropped_files.map(file => {
            var URLObj = window.URL || window.webkitURL;
            var source = URLObj.createObjectURL(file);
            return <img src={source}/>
        })
        return <div style="border: 1px solid red" class="ubox" {...events}>
            <div id="preview">{images}</div>
            <input type="file" onChange={this.handleFileChange} />
            <button class=".ubox-button" onClick={this.handleImageSend}>Send</button>
        </div>
    }
}
