
import React from 'react';
import { Link, useRouteMatch } from 'react-router-dom';

export default class NavBar extends React.Component {
    constructor(props) {
        super(props)
    }
    render() {
        let navclass = "navbar navbar-expand navbar-dark bg-dark fixed-top"
        return <nav className={navclass}>
          <a className="navbar-brand" href="#">BDSI Classroom</a>
          <div>
            <ul className="navbar-nav mr-auto">
              <NavLink to="/" label="Polls/Snippets"/>
              <NavLink to="/slides" label="Slides"/>
            </ul>
          </div>
        </nav>
    }
}

function NavLink({to, label}) {
  let match = useRouteMatch({
    path: to,
    exact: true
  });

  let className = match ? "nav-item active" : "nav-item";

  return (
    <li className={className}>
      <Link className="nav-link" to={to}>{label}</Link>
    </li>
  );
}

