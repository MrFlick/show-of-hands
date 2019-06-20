import React from 'react';
import Results from './results';

export default class ResultView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {polls: []};
        this.socket = props.socket
        this.socket_events = {    
            "show results": (polls) => this.refreshPolls(polls),
        }
    }
    refreshPolls(polls) {
        this.setState({polls: polls});
    }
    componentDidMount() {
        Object.keys(this.socket_events).map((k)=> {
            this.socket.on(k, this.socket_events[k])
        })
        this.socket.emit("request poll shared list", {});
    }
    componentWillUnmount() {
        Object.keys(this.socket_events).map((k)=> {
            this.socket.off(k, this.socket_events[k])
        })
    }
    render() {
        return <div className="row">
            <div className="col-12">
                <h2>Results</h2>
                <ResultsList polls={this.state.polls} socket={this.socket} />
            </div>
        </div>
    }
}

function ResultsList(props) {
    var socket = props.socket;
    if (props.polls.length) {
        return <div>{props.polls.map((poll) => {
            return <Results key={poll.poll_id} poll_id={poll.poll_id} socket={socket} />
        })}</div>
    } else {
        return <p>No results currently shared</p>
    }
}