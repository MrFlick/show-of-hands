
import React from 'react';
export default class Site extends React.Component {
    constructor(props) {
        super(props)
    }
    render() {
        let navclass = "navbar navbar-toggleable-md navbar-inverse bg-inverse fixed-top"
        return <div><nav className={navclass}>
          <a className="navbar-brand" href="#">BDSI Classroom</a>

          <div className="collapse navbar-collapse" id="navbarsExampleDefault">
            <ul className="navbar-nav mr-auto">
              <li className="nav-item active">
                <a className="nav-link" href="#">Home <span className="sr-only">(current)</span></a>
              </li>
            </ul>
            <form className="form-inline my-2 my-lg-0">
              {/*<a className="nav-link" href="#">Viewer</a>*/}
            </form>
          </div>
        </nav>
        <div className="container">{this.props.children}</div></div>
    }
}
