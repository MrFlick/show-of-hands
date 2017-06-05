import React from 'react';
const io = require('socket.io-client');
const socket = io();

export default class Student extends React.Component {
    constructor(props) {
        super(props)
        this.state = {prompts: [], shares: []};
        socket.on("new prompt", (prompt) => this.newPrompt(prompt))
        socket.on("close prompt", (prompt) => this.closePrompt(prompt))
        socket.on("new share", (share) => this.newShare(share))
    }
    newPrompt(prompt) {
        console.log("new prompt", prompt)
        this.setState(previousState => ({
            prompts: [...previousState.prompts, prompt]
        }))
    }
    closePrompt(prompt) {

    }
    render() {
        console.log("emit");
        socket.emit("loaded");
        return (
            <PromptList prompts={this.state.prompts}></PromptList>
        )
    }
}

function PromptList(props) {
    return <ul>{props.prompts.map((row, i) => {
        return <Prompt key={row.id} prompt={row}></Prompt>;
    })}</ul>
}

function Prompt(props) {
   return <li>{props.prompt.title}</li>; 
}
