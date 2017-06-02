import React from 'react';
const io = require('socket.io-client');
const socket = io();

export default class Student extends React.Component {
    constructor(props) {
        super(props)
        this.state = {prompts: [{title: "A"}, {title: "Z"}], shares: []};
        socket.on("new prompt", (prompt) => this.newPrompt(prompt))
        socket.on("close prompt", (prompt) => this.closePrompt(prompt))
        socket.on("new share", (share) => this.newShare(share))
    }
    newPrompt(prompt) {
        this.state.shares.append(prompt);
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
        return <Prompt prompt={row}></Prompt>;
    })}</ul>
}

function Prompt(props) {
   return <li>{props.prompt.title}</li>; 
}
