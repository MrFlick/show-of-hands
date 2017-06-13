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
        this.poll_wraper.listenStop()
        this.snip_wrapper.listenStop()
    }
    render() {
        return <div className="row">
            <div className="col-6">
                <h2>Polls</h2>
                <PollList polls={this.state.polls} connector={this.poll_wrapper}/>
            </div><div className="col-6">
                <h2>Snippets</h2>
                <SnippetList snippets={this.state.snippets} connector={this.snip_wrapper}/>
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

class SnippetForm extends React.Component {
    constructor(props) {
        super(props);
        this.connector = props.connector;
        this.orig_state = props.snippet || {title: "", code: ""}
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
        this.setState({title: "", code: ""})
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
                    style={{width: "100%"}} />
            </div>
            <div className="card-block">
                <textarea name="code" value={this.state.code} 
                    onChange={this.handleInputChange}
                    style={{width: "100%", height: "200px"}} />
            </div>
            <div className="card-block">{actions}</div> 
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
            button = <button onClick={this.openSnippet}>Open</button>
        } else if(snip.status ==1) {
            button = <button onClick={this.closeSnippet}>Close</button>
        } else if (snip.status == 2) {
            button = <button onClick={this.openSnippet}>Re-open</button>
        }
        return <div className="card"><form onSubmit={this.handleSubmit}>
            <div className={classNames("card-header", {"open-poll": snip.status==1})}>{snip.title}</div>
            <div className="card-block"><pre>{snip.code}</pre></div>
            <div className="card-block">{button}&nbsp; 
                <button onClick={this.editSnippet}>Edit</button>&nbsp;
                <button onClick={this.removeSnippet}>Delete</button>&nbsp;
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
            <div className="card-block">
                <label><input type="radio" name="type" value="text" onChange={this.handleInputChange} 
                    checked={this.state.type=="text"}/> text </label> 
                <label><input type="radio" name="type" value="number" onChange={this.handleInputChange} 
                    checked={this.state.type=="number"}/> number </label> 
                <label><input type="radio" name="type" value="multiple_choice" onChange={this.handleInputChange} 
                    checked={this.state.type=="multiple_choice"}/> choice</label>
                <textarea name="options" value={this.state.options} 
                    onChange={this.handleInputChange}
                    style={{width: "100%", height: "100px"}}/>
            </div>
            <div className="card-block">{actions}</div> 
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
        let button = null;
        let poll = this.props.poll;
        if (poll.status == 0) {
            button = <button onClick={this.openPoll}>Open</button>
        } else if(poll.status ==1) {
            button = <button onClick={this.closePoll}>Close</button>
        } else if (poll.status == 2) {
            button = <button onClick={this.openPoll}>Re-open</button>
        }
        return <div className="card"><form onSubmit={this.handleSubmit}>
            <div className={classNames("card-header", {"open-poll": poll.status==1})}>{poll.title} ({poll.response_count})</div>
            <div className="card-block"><p>{button}&nbsp; 
                <button onClick={this.editPoll}>Edit</button>&nbsp;
                <button onClick={this.removePoll}>Delete</button>&nbsp;
                <Link to={`/results/${poll.poll_id}`}>results</Link></p></div>
            </form></div>; 
    }    
    
}
