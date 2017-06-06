import React from 'react';
const io = require('socket.io-client');
const socket = io();

export default class Student extends React.Component {
    constructor(props) {
        super(props)
        this.state = {polls: [], snippets: [], clientID: -1};
        socket.on("you are", (client) => this.initClient(client))
        socket.on("new poll", (poll) => this.newPoll(poll))
        socket.on("close poll", (poll) => this.closePoll(poll))
        socket.on("poll list", (polls) => this.refreshPolls(polls))
        socket.on("new snippet", (snip) => this.newSnippet(snip))
        socket.on("snippet list", (snips) => this.refreshSnippets(snips))
    }
    initClient(client) {
        this.setState({clientID: client.id});
    }
    refreshPolls(polls) {
        this.setState({polls: polls});
    }
    newPoll(poll) {
        this.setState(previousState => ({
            polls: [...previousState.polls, poll]
        }))
    }
    closePoll(poll) {

    }
    refreshSnippets(snips) {
        this.setState({snippets: snips});
    }
    newSnippet(snip) {
        this.setState(previousState => ({
            snippets: [...previousState.snippets, snip]
        }))
    }
    refresh() {
        socket.emit("request poll list")
        socket.emit("request snippet list")
    }
    componentDidMount() {
        this.refresh()
    }
    render() {
        return <div className="row">
            <div className="col-6">
                <h2>Questions</h2>
                <PollList polls={this.state.polls} client={this.state.clientID}/>
            </div><div className="col-6">
                <h2>Snippets</h2>
                <SnippetList snippets={this.state.snippets}/>
            </div>
        </div>
        
    }
}

function SnippetList(props) {
    return <div>{props.snippets.map((row, i) => {
        return <Snippet key={row.snippet_id} snippet={row}/>;
    })}</div>
}

function Snippet(props) {
    let snippet = props.snippet;
    return <div className="card">
        <div className="card-header">{snippet.title}</div>
        <div className="card-block">{snippet.code}</div>
    </div>; 
}

function PollList(props) {
    return <div>{props.polls.map((row, i) => {
        return <Poll key={row.poll_id} poll={row} client={props.client}></Poll>;
    })}</div>
}

class Poll extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            answered: false,
            value: null
        }

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    handleChange(e) {
        this.setState({value: e.target.value});
    }
    handleSubmit(e) {
        e.preventDefault();
        let poll = this.props.poll;
        let resp = {
            poll_id: poll.poll_id,
            client_id: this.props.client,
            value: this.state.value
        };
        socket.emit("poll response", resp);
        this.setState({answered: true});
        console.log("submitted", resp);
    }
    render() {
        let state = this.state;
        function bclass(x) {
            if (state.answered) {
                if (state.value==x) {
                    return "btn btn-primary"
                } else {
                    return "btn btn-secondary"
                }
            } else {
                return "btn btn-outline-primary"
            }
        }
        let poll = this.props.poll;
        let input;
        if (poll.type=="multiple_choice") {
            if (poll.options && poll.options.values) {
                input = poll.options.values.map((x, i) => {
                    return <button className={bclass(x)} onClick={this.handleChange} value={x} key={x}>{x}</button>
                });
            } 
        } else {
            input = <div><textarea style={{width: "100%", height: "100px"}} onChange={this.handleChange}/><button className="btn btn-outline-primary">submit</button></div>;
        }
        return <div className="card"><form onSubmit={this.handleSubmit}>
            <div className="card-header">{poll.title}</div>
            <div className="card-block">{input}</div>
            </form></div>; 
    }    
    
}
