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
        return <div><Link to="/podium">Return</Link>{
        this.state.responses.map((resp) => {
            return <p key={resp.rowid}>{resp.response}</p>
        })
        }</div>
    }
}
