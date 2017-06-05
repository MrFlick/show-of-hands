import React from 'react';
const io = require('socket.io-client');
const socket = io();

export default class Student extends React.Component {
    constructor(props) {
        super(props)
        this.state = {polls: [], shares: []};
        socket.on("new poll", (poll) => this.newPoll(poll))
        socket.on("close poll", (poll) => this.closePoll(poll))
        socket.on("poll list", (polls) => this.refreshPolls(polls))
        socket.on("new share", (share) => this.newShare(share))
    }
    refreshPolls(polls) {
        this.setState({polls: polls});
    }
    newPoll(poll) {
        console.log("new poll", prompt)
        this.setState(previousState => ({
            polls: [...previousState.polls, poll]
        }))
    }
    closePoll(poll) {

    }
    componentDidMount() {
        socket.emit("request poll list")
    }
    render() {
        return (
            <PollList polls={this.state.polls}></PollList>
        )
    }
}

function PollList(props) {
    return <ul>{props.polls.map((row, i) => {
        return <Poll key={row.poll_id} poll={row}></Poll>;
    })}</ul>
}

function Poll(props) {
   return <li>{props.poll.title}</li>; 
}
