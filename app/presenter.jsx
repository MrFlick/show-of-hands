import React from 'react';


export default class Presenter extends React.Component {
    constructor(props) {
        super(props)
        this.socket = props.socket
        this.state = {prompts: [], snippets: [], polls: []};
        this.socket.on("prompt list", (prompts) => this.refreshPrompts(prompts))
        this.socket.on("poll list", (polls) => this.refreshPolls(polls))
        this.socket.on("new poll", (poll) => this.newPoll(poll))
        this.socket.on("close poll", (poll) => this.closePoll(poll))
    }
    refreshPrompts(prompts) {
        this.setState({prompts: prompts});
    }
    newPoll(poll) {
        this.setState(previousState => ({
            polls: [...previousState.polls, poll]
        }))
    }
    closePoll(poll) {

    }
    refreshPolls(polls) {
        this.setState({polls: polls});
    }
    componentDidMount() {
        this.socket.emit("request prompt list")
        this.socket.emit("request poll list all")
    }
    render() {
        return <div className="row">
            <div className="col-6">
                <h2>Prompts</h2>
                <PromptList prompts={this.state.prompts} socket={this.socket}/>
                <h2>Polls</h2>
                <PollList polls={this.state.polls} socket={this.socket}/>
            </div><div className="col-6">
                <h2>Snippets</h2>
                <SnippetList snippets={this.state.snippets} socket={this.socket}/>
            </div>
        </div>
    }
}

class SnippetList extends React.Component {
    constructor(props) {
        super(props);
        this.socket = props.socket;
        this.state = {title: "", code: ""};
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleInputChange(e) {
        const target = e.target;
        const value = target.value;
        const name = target.name;

        this.setState({[name]: value});
    }
    handleSubmit(e) {
        e.preventDefault();
        this.socket.emit("add snippet", this.state)
        this.setState({title: "", code: ""});
    }

    render() {
        return <form onSubmit={this.handleSubmit}>
        <input name="title" value={this.state.title} 
            onChange={this.handleInputChange}
            style={{width: "100%"}} />
        <textarea name="code" value={this.state.code} 
            onChange={this.handleInputChange}
            style={{width: "100%", height: "200px"}} />
        <button style={{width: "100%"}} className="btn btn-primary">Send</button>
        </form>;
    }
}

function PromptList(props) {
    var socket = props.socket;
    return <div>{props.prompts.map((row) => {
          return <Prompt key={row.prompt_id} prompt={row} socket={socket}></Prompt>
        })}</div>
}

function Prompt(props) {
    var prompt = props.prompt;
    var socket = props.socket;
    function sendPrompt(e) {
        e.preventDefault();
        socket.emit("add poll", prompt);
    }
    return <div><form onSubmit={sendPrompt}>
        <button>Send Poll</button></form>
        {prompt.title}</div>;
}

function PollList(props) {
    var socket = props.socket;
    return <div>{props.polls.map((row) => {
          return <Poll key={row.poll_id} poll={row} socket={socket}></Poll>
        })}</div>
}

class Poll extends React.Component {
    constructor(props) {
        super(props);
        var poll = props.poll;
        this.state = {
            poll_id: poll.poll_id,
            title: poll.title,
            is_open: poll.is_open
        }
        this.socket = props.socket;
        this.handleOptionChange = this.handleOptionChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    handleOptionChange(e) {
        this.setState({
            is_open: e.target.value
        });
    }
    handleSubmit(e) {
        e.preventDefault();
        //socket.emit("close poll", poll);
    }
    closePoll() {

    }
    render() {
        var name = "status" + this.state.poll_id;
        return <div><form onSubmit={this.handleSubmit}><div className="btn-group"  data-toggle="buttons">
            <label className={`btn btn-primary ${this.state.is_open>0 ? 'active' : ''}`}><input type="radio" name={name} value={1} checked={this.state.is_open>0} onChange={this.handleOptionChange}/>Open</label>
            <label className={`btn btn-primary ${this.state.is_open==0 ? 'active' : ''}`}><input type="radio" name={name} value={0} checked={this.state.is_open==0} onChange={this.handleOptionChange}/>Closed</label>
        </div></form>
        {this.state.title}</div>;
    }    
    
}
