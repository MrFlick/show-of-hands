
import React from 'react';

export default class Site extends React.Component {
    constructor(props) {
        super(props)
    }
    render() {
        return <div><div className="container">{this.props.children}</div></div>
    }
}
