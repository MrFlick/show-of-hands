import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Switch, Route } from 'react-router-dom';  
  
import Student from './student';
import Presenter from './presenter';

ReactDOM.render(
    <BrowserRouter><Switch>
        <Route exact path="/" component={Student}/>
        <Route path="/podium" component={Presenter} />
    </Switch></BrowserRouter>, 
    document.getElementById('root')
);
