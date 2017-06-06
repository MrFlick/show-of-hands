import React from 'react';
const io = require('socket.io-client');
const socket = io();

export default class Presenter extends React.Component {
    constructor(props) {
        super(props)
        this.state = {prompts: [], snippets: []};
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
        return <div className="row">
            <div className="col-6">
                <h2>Prompts</h2>
                <PromptList prompts={this.state.prompts} />
            </div><div className="col-6">
                <h2>Snippets</h2>
                <SnippetList snippets={this.state.snippets}/>
            </div>
        </div>
    }
}

class SnippetList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {title: "", code: ""};
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleInputChange(e) {
        const target = e.target;
        const value = target.value;
        const name = target.name;

        this.setState({[name]: value});
    }
    handleSubmit(e) {
        e.preventDefault();
        socket.emit("add snippet", this.state)
        this.setState({title: "", code: ""});
    }

    render() {
        return <form onSubmit={this.handleSubmit}>
        <input name="title" value={this.state.title} 
            onChange={this.handleInputChange}
            style={{width: "100%"}} />
        <textarea name="code" value={this.state.code} 
            onChange={this.handleInputChange}
            style={{width: "100%", height: "200px"}} />
        <button style={{width: "100%"}} className="btn btn-primary">Send</button>
        </form>;
    }
}

function PromptList(props) {
    return <div>{props.prompts.map((row) => {
          return <Prompt key={row.prompt_id} prompt={row}></Prompt>
        })}</div>
}

function Prompt(props) {
    var prompt = props.prompt;
    function sendPrompt(e) {
        e.preventDefault();
        socket.emit("add poll", prompt);
    }
    return <div><form onSubmit={sendPrompt}>
        <button>Send Poll</button></form>
        {prompt.title}</div>;
}
