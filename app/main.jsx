import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Switch, Route } from 'react-router-dom';  

const io = require('socket.io-client');
const socket = io("/", {"path": `${PUB_STEM}socket.io`});

import Student from './student';
import Presenter from './presenter';

ReactDOM.render(
    <BrowserRouter basename={PUB_STEM}><Switch>
        <Route exact path="/" render={(props) => <Student socket={socket} {...props}/>}/>
        <Route path="/podium" render={(props) => <Presenter socket={socket} {...props}/>}/>
    </Switch></BrowserRouter>, 
    document.getElementById('root')
);
