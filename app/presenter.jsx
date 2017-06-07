import React from 'react';


export default class Presenter extends React.Component {
    constructor(props) {
        super(props)
        this.socket = props.socket
        this.state = {snippets: [], polls: []};
        this.socket.on("poll list", (polls) => this.refreshPolls(polls))
        this.socket.on("new poll", (poll) => this.newPoll(poll))
        this.socket.on("close poll", (poll) => this.closePoll(poll))
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
        this.socket.emit("request poll list all")
    }
    render() {
        return <div className="row">
            <div className="col-6">
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
        this.state = poll
        this.socket = props.socket;
        this.openPoll = this.openPoll.bind(this);
        this.closePoll = this.closePoll.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handlePollUpdate = this.handlePollUpdate.bind(this);
        this.handlePollResponse = this.handlePollResponse.bind(this);
        this.socket_events = {
            "open poll":  this.handlePollUpdate,
            "close poll": this.handlePollUpdate,
            "new poll response": this.handlePollResponse
        }
    }
    componentDidMount() {
        Object.keys(this.socket_events).map((k)=> {
            this.socket.on(k, this.socket_events[k])
        })
    }
    componentWillUnmount() {
        Object.keys(this.socket_events).map((k)=> {
            this.socket.off(k, this.socket_events[k])
        })
    }
    handlePollResponse(poll) {
        if (this.state.poll_id == poll.poll_id & poll.action=="insert") {
            this.setState({response_count: this.state.response_count +1})
        };
    }
    handlePollUpdate(poll) {
        if (this.state.poll_id == poll.poll_id) {
            this.setState(poll)
        };
    }
    handleSubmit(e) {
        e.preventDefault();
        //socket.emit("close poll", poll);
    }
    openPoll() {
        this.socket.emit("open poll", this.state);
    }
    closePoll() {
        this.socket.emit("close poll", this.state);
    }
    render() {
        var name = "status" + this.state.poll_id;
        let button = null;
        let poll = this.state;
        if (poll.status == 0) {
            button = <button onClick={this.openPoll}>Open</button>
        } else if(poll.status ==1) {
            button = <button onClick={this.closePoll}>Close</button>
        } else if (poll.status == 2) {
            button = <button onClick={this.openPoll}>Re-open</button>
        }
        return <div className="card"><form onSubmit={this.handleSubmit}>
            <div className="card-header">{this.state.title} ({this.state.response_count})</div>
            <div className="card-block">{button}</div>
            </form></div>; 
    }    
    
}
