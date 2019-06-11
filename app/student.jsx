import React from 'react';
import debounce from 'lodash/debounce';
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import { ImageGrabber } from './image-grabber'

function Image(props) {
    if (props.value) {
        let url = (props.imglink || "") + "/" + props.value;
        return <img src={url} style={{width: "100%"}}/>
    } else {
        return null
    }
}

export default class Student extends React.Component {
    constructor(props) {
        super(props)
        this.state = {polls: [], snippets: [], clientID: -1};
        this.socket = props.socket
        this.socket_events = {
            "you are": (client) => this.initClient(client),
            "open poll": (poll) => this.newPoll(poll),
            "close poll": (poll) => this.closePoll(poll),
            "remove poll": (poll) => this.closePoll(poll),
            "update poll": (poll) => this.updatePoll(poll),
            "poll list": (polls) => this.refreshPolls(polls),
            "snippet list": (snips) => this.refreshSnippets(snips),
            "open snippet": (snip) => this.openSnippet(snip),
            "close snippet": (snip) => this.closeSnippet(snip),
            "remove snippet": (snip) => this.closeSnippet(snip),
            "update snippet": (poll) => this.updateSnippet(poll),
        }
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
    updatePoll(poll) {
        this.setState({
            polls: this.state.polls.map(p=>{
                if(p.poll_id == poll.poll_id) {
                    return Object.assign(p, poll)
                } else {
                    return p
                }
            })
        })
    }
    refreshSnippets(snips) {
        this.setState({snippets: snips});
    }
    openSnippet(snip) {
        this.setState(previousState => ({
            snippets: [snip, ...previousState.snippets]
        }))
    }
    closeSnippet(snip) {
        this.setState({
            snippets: this.state.snippets.filter((s)=>s.snippet_id != snip.snippet_id)
        })
    }
    updateSnippet(snip) {
        this.setState({
            snippets: this.state.snippets.map( s  => {
                if(s.snippet_id == snip.snippet_id) {
                    return Object.assign(s, snip)
                } else {
                    return s
                }
            })
        })
    }
    refresh() {
        this.socket.emit("request poll list")
        this.socket.emit("request snippet list")
    }
    componentDidMount() {
        Object.keys(this.socket_events).map((k)=> {
            this.socket.on(k, this.socket_events[k])
        })
        this.refresh()
    }
    componentWillUnmount() {
        Object.keys(this.socket_events).map((k)=> {
            this.socket.off(k, this.socket_events[k])
        })
    }
    render() {
        return <div className="row">
            <div className="col-6">
                <h2>Questions</h2>
                <PollList polls={this.state.polls} socket={this.socket} 
                    imglink={this.props.history.createHref({pathname:"/img"})}/>
            </div><div className="col-6">
                <h2>Snippets</h2>
                <SnippetList snippets={this.state.snippets}/>
            </div>
        </div>
        
    }
}

function SnippetList(props) {
    if (props.snippets.length) {
        return <div><TransitionGroup transitionName="list">{props.snippets.map((row) => {
            return <CSSTransition timeout={{ enter: 500, exit:300 }} key={row.snippet_id}>
                <Snippet snippet={row}/>
            </CSSTransition>;
        })}</TransitionGroup></div>
    } else {
        return <p>No snippets currently shared</p>
    }
}

function Icon(props) {
    let icon = props.icon;
    let other = Object.assign({}, props);
    delete other.icon
    return <span className={"fa fa-" + icon} {...other} aria-hidden="true"></span>
}

// from https://stackoverflow.com/a/33928558/2372064
function copyToClipboard(text) {
    if (window.clipboardData && window.clipboardData.setData) {
        // IE specific code path to prevent textarea being shown while dialog is visible.
        return clipboardData.setData("Text", text); 

    } else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
        var textarea = document.createElement("textarea");
        textarea.textContent = text;
        textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in MS Edge.
        document.body.appendChild(textarea);
        textarea.select();
        try {
            return document.execCommand("copy");  // Security exception may be thrown by some browsers.
        } catch (ex) {
            console.warn("Copy to clipboard failed.", ex);
            return false;
        } finally {
            document.body.removeChild(textarea);
        }
    }
}

function Snippet(props) {
    let snippet = props.snippet;
    return <div className="card">
        <div className="card-header">
        <div className="float-left">{snippet.title}</div>
        <div className="float-right"><button onClick={()=>copyToClipboard(snippet.code)}><Icon icon="copy"/></button></div></div>
        <div className="card-block"><pre>{snippet.code}</pre></div>
    </div>; 
}

function PollList(props) {
    var socket = props.socket;
    if (props.polls.length) {
        return <div><TransitionGroup transitionName="list">{props.polls.map((row) => {
            return <CSSTransition timeout={{enter: 500, exit: 300}} key={row.poll_id}>
                <Poll poll={row} socket={socket} imglink={props.imglink}></Poll>
            </CSSTransition>;
        })}</TransitionGroup></div>
    } else {
        return <p>No polls curently open</p>
    }
}

class Poll extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            answered: false,
            value: null
        }
        this.socket = props.socket;
        this.changeValue = this.changeValue.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleTextChange = this.handleTextChange.bind(this);
        this.handleChangeDebounce = debounce(this.handleChange.bind(this), 500);
        this.handleImageUpload = this.handleImageUpload.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    changeValue(value) {
        this.setState({value: value}, () => {
            let poll = this.props.poll;
            let resp = {
                poll_id: poll.poll_id,
                value: this.state.value
            };
            this.socket.emit("poll response", resp);
            this.setState({answered: true});
        });
    }
    handleChange(e) {
        this.changeValue(e.target.value)
    }
    handleTextChange(e) {
        e.persist()
        this.handleChangeDebounce(e)
    }
    handleImageUpload(e) {
        this.changeValue(e.id)
    }
    handleSubmit(e) {
        e.preventDefault();
    }
    componentWillUnmount() {
        this.handleChangeDebounce.cancel()
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
                input = poll.options.values.map((x) => {
                    return <button className={bclass(x)} onClick={this.handleChange} value={x} key={x}>{x}</button>
                });
            } 
        } else if (poll.type=="number") { 
            input = <div><input types="text" style={{width: "100%"}} placeholder="Please enter a number" onChange={this.handleTextChange}/></div>
        } else if (poll.type=="image") {
            input = [<Image value={this.state.value} imglink={this.props.imglink} key="view"/>, 
                <ImageGrabber action={this.props.imglink} onUpload={this.handleImageUpload} key="new"/>]
        } else {
            input = <div><textarea style={{width: "100%", height: "100px"}} onChange={this.handleTextChange}/></div>;
        }
        return <div className="card"><form onSubmit={this.handleSubmit}>
            <div className="card-header">{poll.title}</div>
            <div className="card-block">{input}</div>
            </form></div>; 
    }    
    
}
