import React from 'react';

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

        this.state = {
            dropped_files: [],
            is_form_showing: false,
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
            var percentComplete = Math.round(e.loaded * 100 / e.total);
            this.setState({precent_complete: percentComplete})
        }
    }

    uploadFailed = (msg) => {
        console.log("failed")
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
        if (this.props.onUpload) {
            this.props.onUpload(resp);
        }
        this.formClose();
    }

    uploadFile = ()  => {
        this.setState({ is_submitting: true })
        var fd = new FormData();
        let dropped_files = this.state.dropped_files
        fd.append("file", dropped_files[0])
        fd.append("file_name", dropped_files[0].name);
        var xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", this.uploadProgress, false);
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
            this.setState({dropped_files: []})
            this.checkReadyToUpload();
        }, false);
        xhr.addEventListener("error", this.uploadFailed, false);
        xhr.addEventListener("abort", this.uploadCanceled, false);
        xhr.open("POST", this.props.action);
        xhr.send(fd);
    }

    checkReadyToUpload = () => {
        if (this.state.dropped_files.length) {
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
        this.arrestEvent(e)
        if (e.dataTransfer.items.length) {
            this.setState({dropped_files: toArray(e.dataTransfer.files)})
        } else {
            this.setState({dropped_files: []})
        }
        this.checkReadyToUpload();
    }

    handleFileChange = (e) => {
        this.setState({dropped_files: toArray(e.target.files) || []});
        this.checkReadyToUpload();
    }

    getPastedImages = (e) => {
        var cd = e.clipboardData
        if(cd) {
            let items = toArray(cd.items)
            return items.filter(x => x.type.indexOf("image")!==-1).
                map(x => x.getAsFile())
        }
        return []
    }

    handlePaste = (e) => {
        e.preventDefault()
        this.setState({dropped_files: this.getPastedImages(e)})
        this.checkReadyToUpload()
    }

    handleFormShow = (e) => {
        this.setState({is_form_showing: true});
        if(this.formRef) {
            $(this.formRef).modal("show");
            $(this.formRef).on("hide.bs.modal", this.handleFormHide)
        }
        this.attachDocumentEvents()
    }   

    handleFormHide = (e) => {
        this.setState({is_form_showing: false});
        if(this.formRef) {
            $(this.formRef).off("hide.bs.modal", this.handleFormHide)
        }
        this.unattachDocumentEvents()
    }

    formClose = () => {
        if(this.formRef) {
            $(this.formRef).modal("hide");
        }
    }

    attachDocumentEvents = () => {
        document.addEventListener("paste", this.handlePaste)
    }
    unattachDocumentEvents = () => {
        document.removeEventListener("paste", this.handlePaste)
    }
    componentDidMount = () => { }
    componentWillUnmount = () => { }

    renderModalForm = () => {
        var events = {}
        eventRepeat(events, "onDrag onDragStart", this.arrestEvent)
        eventRepeat(events, "onDragOver onDragEnter", this.handleDragOver)
        eventRepeat(events, "onDragLeave onDragEnd onDrop", this.handleDragLeave) 
        eventRepeat(events, "onDrop", this.handleDrop) 
        let images = this.state.dropped_files.map((file,i) => {
            var URLObj = window.URL || window.webkitURL;
            var source = URLObj.createObjectURL(file);
            return <img src={source} key={i}/>
        })
        return <div className="modal fade" 
            data-backdrop="static" role="dialog"
            ref={(form) => {this.formRef = form}}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <button type="button" className="close" data-dismiss="modal">&times;</button>
                        <h4 className="modal-title">Image Selection</h4>
                    </div>
                    <div className="modal-body">
                        <div className="form-group" {...events}>
                            <div id="preview">{images}</div>
                            <label className="col-sm-2 control-label" htmlFor="job_name">Name</label>
                            <div className="col-sm-10"><input type="text" className="form-control" id="job_name"/></div>
                            <input type="file" onChange={this.handleFileChange} />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-default" data-dismiss="modal">Cancel</button>
                        <button type="button" className="btn btn-success" onClick={this.uploadFile}>Save</button>
                    </div>
                </div>
            </div>
        </div>
    }

    render() {
        let form = this.renderModalForm();
        return <div className="ubox">
            <button className=".ubox-button" onClick={this.handleFormShow}>Choose</button>
            {form}
        </div>
    }
}
