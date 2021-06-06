import React from 'react';
import { Link } from 'react-router-dom'; 
import { AdminSnippetSocketData, AdminPollSocketData } from "./data_socket_wrapper"

var classNames = require('classnames');

export default class Presenter extends React.Component {
    constructor(props) {
        super(props)
        this.socket = props.socket
        this.state = {snippets: [], polls: []};
        this.poll_wrapper = new AdminPollSocketData(this.socket, (x) => this.setPolls(x))
        this.snip_wrapper = new AdminSnippetSocketData(this.socket, (x) => this.setSnippets(x))
    }
    setPolls(polls) {
        this.setState({polls: polls})
    }
    setSnippets(snips) {
        this.setState({snippets: snips})
    }
    componentDidMount() {
        this.poll_wrapper.listenStart()
        this.snip_wrapper.listenStart()
        this.socket.emit("request poll list all")
        this.socket.emit("request snippet list all")
    }
    componentWillUnmount() {
        this.poll_wrapper.listenStop()
        this.snip_wrapper.listenStop()
    }
    render() {
        return <div>
            <div className="row">
                <div className="col-2 my-auto"><h2>Slides</h2></div>
                <div className="col-10 my-auto"><SlideControl socket={this.socket}/></div>
            </div>
            <div className="row">
                <div className="col-6">
                    <h2>Polls</h2>
                    <PollList polls={this.state.polls} connector={this.poll_wrapper}/>
                </div><div className="col-6">
                    <h2>Snippets</h2>
                    <SnippetList snippets={this.state.snippets} connector={this.snip_wrapper}/>
                </div>
        </div>
        </div>
    }
}

class SnippetList extends React.Component {
    constructor(props) {
        super(props)
        this.state = {edit_id: null}
        this.renderViewOrForm = this.renderViewOrForm.bind(this)
        this.handleEdit = this.handleEdit.bind(this)
        this.handleStatusChange = this.handleStatusChange.bind(this)
    }
    handleEdit(snip) {
        this.setState({edit_id: snip.snippet_id}) 
    }

    handleStatusChange() {
        this.setState({edit_id: null}) 
    }

    renderViewOrForm(item, connector) {
        if (item.snippet_id == this.state.edit_id) {
          return <SnippetForm key={item.snippet_id} snippet={item} onStatusChange={this.handleStatusChange} 
            connector={connector} action="edit"/>
        } else {
          return <Snippet key={item.snippet_id} snippet={item} onEdit={this.handleEdit} connector={connector}/>
        }
    }

    render() {
        let connector = this.props.connector
        let snips = this.props.snippets
        return <div><SnippetForm action="new" connector={connector}/>{snips.map((row) =>  {
            return this.renderViewOrForm(row, connector)
        })}</div>
    }
}

const objectMap = (obj, fn) =>
  Object.fromEntries(
    Object.entries(obj).map(
      ([k, v], i) => [k, fn(v, k, i)]
    )
  )

function nullToUndef(obj) {
    return objectMap(obj, x => x === null ? undefined : x)
}

class SnippetForm extends React.Component {
    constructor(props) {
        super(props);
        this.connector = props.connector;
        this.orig_state = nullToUndef(props.snippet || {title: "", code: "", tag: ""})
        this.state = Object.assign(this.orig_state, {action: props.action || "new"})
        this.handleInputChange = this.handleInputChange.bind(this)
        this.handleStatusChange = this.handleStatusChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleCancel = this.handleCancel.bind(this)
        this.handleUpdate = this.handleUpdate.bind(this)
        this.handleAdd = this.handleAdd.bind(this)
    }
    handleStatusChange() {
        if (this.props.onStatusChange) {
            this.props.onStatusChange("done")
        }
    }

    handleInputChange(e) {
        const target = e.target;
        const value = target.value;
        const name = target.name;

        this.setState({[name]: value});
    }

    handleCancel() {
        this.handleStatusChange()
    }
    handleUpdate() {
        this.connector.requestUpdate(this.state)
        this.handleStatusChange()
    }
    handleAdd() {
        this.connector.requestAdd(this.state)
        this.setState({title: "", code: "", tag: ""})
        this.handleStatusChange()
    }

    handleSubmit(e) {
        e.preventDefault()
    }

    render() {
        let actions = null
        if (this.state.action=="new") {
            actions = <button type="button" style={{width: "100%"}} 
                className="btn btn-primary" onClick={this.handleAdd}>Save</button>
        } else if (this.state.action=="edit") {
            actions = [<button type="button" style={{width: "50%"}} className="btn btn-primary" 
                key="save" onClick={this.handleUpdate}>Save</button>, 
                <button type="button" style={{width: "50%"}} className="btn" 
                onClick={this.handleCancel} key="cancel">Cancel</button>]
        }
        return <div className="card"><form onSubmit={this.handleSubmit}>
            <div className="card-header">
                <input name="title" value={this.state.title} 
                    onChange={this.handleInputChange}
                    style={{width: "100%"}} placeholder="(title)"/>
                <input name="tag" value={this.state.tag} 
                    onChange={this.handleInputChange}
                    style={{width: "100%"}} placeholder="(tag)" />
            </div>
            <div className="card-body">
                <div className="card-text">
                    <textarea name="code" value={this.state.code} 
                    onChange={this.handleInputChange}
                    style={{width: "100%", height: "200px"}} /></div>
                <div className="card-text">{actions}</div> 
            </div>
            
        </form></div>
    }
}

class Snippet extends React.Component {
    constructor(props) {
        super(props);
        this.connector = props.connector;
        this.openSnippet = this.openSnippet.bind(this);
        this.closeSnippet = this.closeSnippet.bind(this);
        this.editSnippet = this.editSnippet.bind(this);
        this.removeSnippet = this.removeSnippet.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    openSnippet(e) {
        e.preventDefault()
        this.connector.requestOpenSnippet(this.props.snippet);
    }
    closeSnippet(e) {
        e.preventDefault()
        this.connector.requestCloseSnippet(this.props.snippet);
    }
    removeSnippet(e) {
        e.preventDefault()
        this.connector.requestDelete(this.props.snippet);
    }
    editSnippet(e) {
        e.preventDefault()
        this.props.onEdit(this.props.snippet)
    }
    handleSubmit(e) {
        e.preventDefault();
    }
    render() {
        let button = null;
        let snip = this.props.snippet
        if (snip.status == 0) {
            button = <button onClick={this.openSnippet}  className="btn">Open</button>
        } else if(snip.status ==1) {
            button = <button onClick={this.closeSnippet}  className="btn">Close</button>
        } else if (snip.status == 2) {
            button = <button onClick={this.openSnippet}  className="btn">Re-open</button>
        }
        return <div className="card"><form onSubmit={this.handleSubmit}>
            <div className={classNames("card-header", {"open-poll": snip.status==1})}>
                <div>{snip.title}</div>
                {snip.tag && <div>(#{snip.tag})</div>}
            </div>
            <div className="card-body">
                <div className="card-text"><pre>{snip.code}</pre></div>
                <div className="card-text">{button}&nbsp; 
                    <button onClick={this.editSnippet} className="btn">Edit</button>&nbsp;
                    <button onClick={this.removeSnippet} className="btn">Delete</button>&nbsp;
                </div>
            </div>
            </form></div>; 
    }    
    
}

class PollList extends React.Component {
    constructor(props) {
        super(props)
        this.state = {edit_id: null}
        this.renderViewOrForm = this.renderViewOrForm.bind(this)
        this.handleEdit = this.handleEdit.bind(this)
        this.handleStatusChange = this.handleStatusChange.bind(this)
    }
    
    handleEdit(poll) {
        this.setState({edit_id: poll.poll_id}) 
    }

    handleStatusChange() {
        this.setState({edit_id: null}) 
    }

    renderViewOrForm(item, connector) {
        if (item.poll_id == this.state.edit_id) {
          return <PollForm key={item.poll_id} poll={item} onStatusChange={this.handleStatusChange} 
            connector={connector} action="edit"/>
        } else {
          return <Poll key={item.poll_id} poll={item} onEdit={this.handleEdit} connector={connector}/>
        }
    }

    render() {
        let connector = this.props.connector
        let polls = this.props.polls
        return <div><PollForm action="new" connector={connector}/>{polls.map((row) =>  {
            return this.renderViewOrForm(row, connector)
        })}</div>
    }
}

class PollForm extends React.Component {
    constructor(props) {
        super(props);
        this.connector = props.connector;
        this.orig_state = props.poll || {title: "untitled", 
            type: "text", 
            options: ""
        }
        if (typeof this.orig_state.options === "object") {
            this.orig_state.options = JSON.stringify(this.orig_state.options)
        }
        this.state = Object.assign(this.orig_state, {action: props.action || "new"})
        this.handleInputChange = this.handleInputChange.bind(this)
        this.handleStatusChange = this.handleStatusChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleCancel = this.handleCancel.bind(this)
        this.handleUpdate = this.handleUpdate.bind(this)
        this.handleAdd = this.handleAdd.bind(this)
    }
    handleStatusChange() {
        if (this.props.onStatusChange) {
            this.props.onStatusChange("done")
        }
    }

    handleInputChange(e) {
        const target = e.target;
        const value = target.value;
        const name = target.name;

        this.setState({[name]: value});
    }
    handleCancel() {
        this.handleStatusChange()
    }
    handleUpdate() {
        this.connector.requestUpdate(this.state)
        this.handleStatusChange()
    }
    handleAdd() {
        this.connector.requestAdd(this.state)
        this.setState({title: "untitled", type: "text", options:""});
        this.handleStatusChange()
    }
    handleSubmit(e) {
        e.preventDefault();
    }

    render() {
        let actions = null
        if (this.state.action=="new") {
            actions = <button type="button" style={{width: "100%"}} 
                className="btn btn-primary" onClick={this.handleAdd}>Save</button>
        } else if (this.state.action=="edit") {
            actions = [<button type="button" style={{width: "50%"}} className="btn btn-primary" 
                key="save" onClick={this.handleUpdate}>Save</button>, 
                <button type="button" style={{width: "50%"}} className="btn" 
                onClick={this.handleCancel} key="cancel">Cancel</button>]
        }
        return <div className="card poll-form"><form onSubmit={this.handleSubmit}>
            <div className="card-header">
                <input name="title" value={this.state.title} 
                    onChange={this.handleInputChange}
                    style={{width: "100%"}} />
            </div>
            <div className="card-body">
                <div className="card-text">
                <label><input type="radio" name="type" value="text" onChange={this.handleInputChange} 
                    checked={this.state.type=="text"}/> text </label> 
                <label><input type="radio" name="type" value="number" onChange={this.handleInputChange} 
                    checked={this.state.type=="number"}/> number </label> 
                <label><input type="radio" name="type" value="multiple_choice" onChange={this.handleInputChange} 
                    checked={this.state.type=="multiple_choice"}/> choice</label>
                <label><input type="radio" name="type" value="image" onChange={this.handleInputChange} 
                    checked={this.state.type=="image"}/> image</label>
                <textarea name="options" value={this.state.options} 
                    onChange={this.handleInputChange}
                    style={{width: "100%", height: "100px"}}/>
                </div>
                <div className="card-text">{actions}</div> 
            </div>
        </form></div>
    }
}

class Poll extends React.Component {
    constructor(props) {
        super(props);
        this.connector = props.connector;
        this.openPoll = this.openPoll.bind(this);
        this.closePoll = this.closePoll.bind(this);
        this.editPoll = this.editPoll.bind(this);
        this.removePoll = this.removePoll.bind(this);
        this.sharePoll = this.sharePoll.bind(this);
        this.unsharePoll = this.unsharePoll.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    openPoll(e) {
        e.preventDefault()
        this.connector.requestOpenPoll(this.props.poll);
    }
    closePoll(e) {
        e.preventDefault()
        this.connector.requestClosePoll(this.props.poll);
    }
    sharePoll(e) {
        e.preventDefault()
        this.connector.requestSharePoll(this.props.poll);
    }
    unsharePoll(e) {
        e.preventDefault()
        this.connector.requestUnsharePoll(this.props.poll);
    }
    removePoll(e) {
        e.preventDefault()
        this.connector.requestDelete(this.props.poll);
    }
    editPoll(e) {
        e.preventDefault()
        this.props.onEdit(this.props.poll)
    }
    handleSubmit(e) {
        e.preventDefault();
    }
    render() {
        let poll = this.props.poll;
        let openButton = null;
        if (poll.status == 0) {
            openButton = <button onClick={this.openPoll} className="btn">Open</button>
        } else if(poll.status ==1) {
            openButton = <button onClick={this.closePoll} className="btn">Close</button>
        } else if (poll.status == 2) {
            openButton = <button onClick={this.openPoll} className="btn">Re-open</button>
        }
        let shareButton = null;
        if (poll.shared == 0) {
            shareButton = <button onClick={this.sharePoll} className="btn">Share</button>
        } else {
            shareButton = <button onClick={this.unsharePoll} className="btn">Unshare</button>
        }
        return <div className="card"><form onSubmit={this.handleSubmit}>
            <div className={classNames("card-header", {"open-poll": poll.status==1})}>{poll.title} ({poll.response_count})</div>
            <div className="card-body"><p>{openButton}&nbsp; 
                {shareButton}&nbsp;
                <button onClick={this.editPoll} className="btn">Edit</button>&nbsp;
                <button onClick={this.removePoll} className="btn">Delete</button>&nbsp;
                <Link to={`/results/${poll.poll_id}`}>results</Link></p></div>
            </form></div>; 
    }       
}

class SlideControl extends React.Component {
    constructor(props) {
        super(props)
        this.state = {slides:[], presenterSlideId:0};
        this.socket = props.socket;
        this.socket_events = {    
            "presenter slide": (slide) => this.setPresenterSlide(slide),
            "slides": (slides) => this.setSlides(slides),
        }
        this.handleNextSlideClick = this.handleNextSlideClick.bind(this)
        this.handlePrevSlideClick = this.handlePrevSlideClick.bind(this)
    }
    setSlides(slides) {
        this.setState({slides: slides})
    }
    setPresenterSlide(slide) {
        this.setState({presenterSlideId: slide.slide_id})
    }
    handleNextSlideClick() {
        let newId = this.state.presenterSlideId + 1
        if (newId < this.state.slides.length) {
            this.socket.emit("set presenter slide", {slide_id: newId})
        }
    }
    handlePrevSlideClick() {
        let newId = this.state.presenterSlideId-1
        if (newId >= 0) {
            this.socket.emit("set presenter slide", {slide_id: newId})
        }
    }
    componentDidMount() {
        Object.keys(this.socket_events).map((k)=> {
            this.socket.on(k, this.socket_events[k])
        })
        this.socket.emit("request slides", {});
        this.socket.emit("request presenter slide", {});
    }
    componentWillUnmount() {
        Object.keys(this.socket_events).map((k)=> {
            this.socket.off(k, this.socket_events[k])
        })
    }
    render() {
        return <div className="container-sm"><div style={{display: "flex", alignItems: "center"}}>
            <div><button onClick={this.handlePrevSlideClick} className="btn m-1">Prev</button></div>
            <div>Current Slide: {this.state.presenterSlideId}</div>
            <div><button onClick={this.handleNextSlideClick} className="btn m-1">Next</button></div>
        </div></div>
    }
}
