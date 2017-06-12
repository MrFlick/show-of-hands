import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Switch, Route } from 'react-router-dom';  

const io = require('socket.io-client');
const socket = io("/", {"path": `${PUB_STEM}socket.io`});


/* global PUB_STEM, document */

import Student from './student';
import Presenter from './presenter';
import Results from './results';
import Site from './site';
import { getClientID } from './guid'

let cid = getClientID()

socket.on("who are you", () => {
    socket.emit("hello", {client_id: cid})
})

ReactDOM.render(
    <Site><BrowserRouter basename={PUB_STEM}><Switch>
        <Route exact path="/" render={(props) => <Student socket={socket} {...props}/>}/>
        <Route path="/podium" render={(props) => <Presenter socket={socket} {...props}/>}/>
        <Route path="/results/:pollid" render={(props) => <Results socket={socket} {...props}/>}/>
    </Switch></BrowserRouter></Site>, 
    document.getElementById('root')
);
