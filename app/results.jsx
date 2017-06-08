import React from 'react';
import { Link } from 'react-router-dom';  

export default class Results extends React.Component { 
    constructor(props) {
        super(props)
        let poll_id = props.match.params.pollid
        this.state = {
            poll_id: poll_id,
            responses: []
        }
        this.socket = props.socket
        this.socket_events = {
            "poll responses list": (resp) => this.refreshResponses(resp),
            "poll detail": (resp) => this.refreshPoll(resp)
        }
    }
    refreshPoll(resp) {
        this.setState(resp);
    }
    refreshResponses(resp) {
        this.setState({responses: resp});
    }
    componentDidMount() {
        Object.keys(this.socket_events).map((k)=> {
            this.socket.on(k, this.socket_events[k])
        })
        this.socket.emit("request poll detail", {poll_id: this.state.poll_id});
        this.socket.emit("request poll responses list", {poll_id: this.state.poll_id});
    }
    componentWillUnmount() {
        Object.keys(this.socket_events).map((k)=> {
            this.socket.off(k, this.socket_events[k])
        })
    }
    render() {
        let drawcomp = null;
        if (this.state.type=="multiple_choice") {
            drawcomp = <ChoiceBarPlot poll={this.state} responses={this.state.responses}/>
        } else if (this.state.type=="text") {
            drawcomp = <ResponseDump poll={this.state} responses={this.state.responses}/>
        } else {
            drawcomp = <div>Type: {this.state.type}</div>
        }
        return <div><Link to="/podium">Return</Link>
        <h2>{this.state.title || "Poll"}</h2>{drawcomp}</div>
    }
}

function count(ary, classifier) {
    return ary.reduce(function(counter, item) {
        var p = (classifier || String)(item);
        counter[p] = counter.hasOwnProperty(p) ? counter[p] + 1 : 1;
        return counter;
    }, {})
}

function ResponseDump(props) {
    return <div>{props.responses.map((resp) => {
        return <p key={resp.rowid}>{resp.response}</p>
    })}</div>    
}

class ChoiceBarPlot extends React.Component {
    constructor(props) {
        super(props)
        this.summarizeStats = this.summarizeStats.bind(this);
    }
    summarizeStats() {
        var resps = this.props.responses;
        var poll = this.props.poll;
        var n = resps.length;
        var counts = count(resps, (x) => {return x.response} )
        var keys = (poll.options && poll.options.values) || Object.keys(counts)
        return keys.map((k) => {
            return {value: k, n: counts[k] || 0, p: counts[k]/n || 0}
        })
    }
    render() {
        let stats = this.summarizeStats();
        return <dl>{stats.map((x) => {
            return <dd className="percentage" key={x.value}><span className="text">{x.value} ({x.n})</span>
            <span className="bar" style={{width: (x.p*100) + "%"}}></span></dd>
        })}</dl>
    }
}
