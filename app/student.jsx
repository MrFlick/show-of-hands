import React from 'react';

export default class Student extends React.Component {
    constructor(props) {
        super(props)
        this.state = {test: 'foo'};
    }
    render() {
        return (
            <div>{this.state.test}</div>
        )
    }
}
