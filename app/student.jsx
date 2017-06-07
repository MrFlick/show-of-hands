import React from 'react';
import debounce from 'lodash/debounce';

export default class Student extends React.Component {
    constructor(props) {
        super(props)
        this.state = {polls: [], snippets: [], clientID: -1};
        this.socket = props.socket
        this.socket.on("you are", (client) => this.initClient(client))
        this.socket.on("open poll", (poll) => this.newPoll(poll))
        this.socket.on("close poll", (poll) => this.closePoll(poll))
        this.socket.on("poll list", (polls) => this.refreshPolls(polls))
        this.socket.on("snippet list", (snips) => this.refreshSnippets(snips))
        this.socket.on("new snippet", (snip) => this.newSnippet(snip))
        this.socket.on("remove snippet", (snip) => this.removeSnippet(snip))
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
        this.setState({
            polls: this.state.polls.filter((p)=>p.poll_id != poll.poll_id)
        })
    }
    refreshSnippets(snips) {
        this.setState({snippets: snips});
    }
    newSnippet(snip) {
        this.setState(previousState => ({
            snippets: [snip, ...previousState.snippets]
        }))
    }
    removeSnippet(snip) {
        this.setState({
            snippets: this.state.snippets.filter((s)=>s.snippet_id != snip.snippet_id)
        })
    }
    refresh() {
        this.socket.emit("request poll list")
        this.socket.emit("request snippet list")
        console.log("request sent")
    }
    componentDidMount() {
        this.refresh()
    }
    render() {
        return <div className="row">
            <div className="col-6">
                <h2>Questions</h2>
                <PollList polls={this.state.polls} socket={this.socket}/>
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
    var socket = props.socket;
    return <div>{props.polls.map((row, i) => {
        return <Poll key={row.poll_id} poll={row} socket={socket}></Poll>;
    })}</div>
}

class Poll extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            answered: false,
            value: null
        }
        this.socket = props.socket;
        this.handleChange = this.handleChange.bind(this);
        this.handleTextChange = this.handleTextChange.bind(this);
        this.handleChangeDebounce = debounce(this.handleChange, 500).bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    handleChange(e) {
        console.log("change");
        this.setState({value: e.target.value});
        let poll = this.props.poll;
        let resp = {
            poll_id: poll.poll_id,
            value: this.state.value
        };
        this.socket.emit("poll response", resp);
        this.setState({answered: true});
    }
    handleTextChange(e) {
        e.persist()
        this.handleChangeDebounce(e);;
    }
    handleSubmit(e) {
        e.preventDefault();
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
            input = <div><textarea style={{width: "100%", height: "100px"}} onChange={this.handleTextChange}/></div>;
        }
        return <div className="card"><form onSubmit={this.handleSubmit}>
            <div className="card-header">{poll.title}</div>
            <div className="card-block">{input}</div>
            </form></div>; 
    }    
    
}
