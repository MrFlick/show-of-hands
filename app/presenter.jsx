import React from 'react';
const io = require('socket.io-client');
const socket = io();

export default class Presenter extends React.Component {
    constructor(props) {
        super(props)
        this.state = {prompts: [], shares: []};
        socket.on("prompt list", (prompts) => this.refreshPrompts(prompts))
    }
    refreshPrompts(prompts) {
        this.setState({prompts: prompts});
        console.log(prompts);
    }
    componentDidMount() {
        socket.emit("request prompt list")
    }
    render() {
        return (
            <PromptList prompts={this.state.prompts}></PromptList>
        )
    }
}

function PromptList(props) {
    return <div>{props.prompts.map((row) => {
          return <Prompt key={row.prompt_id} prompt={row}></Prompt>
        })}</div>
}

function Prompt(props) {
    var prompt = props.prompt;
    console.log(prompt)
    function sendPrompt(e) {
        e.preventDefault();
        socket.emit("add poll", prompt);
    }
    return <div><form onSubmit={sendPrompt}>
        <button>Send Poll</button></form>
        {prompt.title}</div>;
}
