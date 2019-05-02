import * as Pusher from "pusher-js";
import React from 'react';
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import { BrowserRouter as Router} from "react-router-dom";
import { Route, Switch } from 'react-router' // react-router v4
import { ToastContainer, toast } from "react-toastify";
import dayjs from "dayjs";

import * as actions from './components/Common/actions/actions.js';
import NotFound from './components/NotFound/NotFound.js';
import LoadingScreen from './components/LoadingScreen/LoadingScreen.js';
import Airtable from "./data/airtable";
import Orders from "./data/orders";
import Items from "./data/items";
import Addons from "./data/addons";
import logo from './Mr_Yum_logo_white.svg';
import classNames from 'classnames';
import stub from './data/airtableDatabaseStub.json';
import SocketListener from './components/Common/SocketListener';

import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  Jumbotron,
  Badge,
} from 'reactstrap';


import './App.css';
import "react-toastify/dist/ReactToastify.css";

const connectionStyles = status => {
  return {
    height: "18px",
    width: "18px",
    borderRadius: "10px",
    backgroundColor:
      status === STATUS.CONNECTED
        ? "green"
        : status === STATUS.CONNECTING
        ? "orange"
        : "red",
    marginLeft: "5px",
  };
};

const statusStyles = {
  background: "white",
  fontSize: "16px",
  zIndex: "2",
  display: "flex",
  alignItems: "center",
  marginLeft: "30px",
  borderRadius: "50px",
  height: "40px",
  marginTop: "5px",
  padding: "10px"
};

////////////////////////////////////////////////////////////////////////////////


const STATUS = {
  CONNECTED: "connected",
  CONNECTING: "connecting"
};

const STATUS_LABELS = {
  connected: "Connected",
  connecting: "Connecting",
  disconnected: "Disconnected",
};

//////////////////////////////////////////////////////////////////////////////////

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentView: '#pending',
    };

    this.channel = null;
  }

  componentWillMount(){
    window.location = '#pending';
  }
  
  componentWillUnmount(){
    localStorage.clear('persist:persistedStore')
  }

  routeTo(suffix){
    window.location = `/${suffix}`;
  }

  clickNav(path){
    this.setState({currentView: path});
  }

  render() {
    // eslint-disable-next-line
    const {isLoading} = this.props

    const displayedRoutes = {
      pending: { label: `Pending Orders`, path: '#pending' },
      ready: { label: `Ready For Pickup`, path: '#ready' },
      completed: { label: `Completed Orders`, path: '#completed' },
    };

      console.log(window.location.hash)
    return (
      <div style={{display: 'block'}} className="App">
        <ToastContainer
          position={toast.POSITION.TOP_RIGHT}
          autoClose={1000}
          pauseOnHover={false}
          pauseOnFocusLoss={false}
          hideProgressBar={true}
        />
        <Navbar className="mercNav" expand="md" fixed="top">
          <NavbarBrand href="/">
              <img style={{ height: "50px", color: "blue" }} src={logo} />
          </NavbarBrand>
          <NavbarToggler onClick={this.toggle} />
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav className="ml-auto" navbar>
              {Object.keys(displayedRoutes).map(key => (
                <NavItem className="navigationLink" >
                  <div style={{background: window.location.hash === displayedRoutes[key].path ? 'white' : 'lightgrey'}}className={classNames(window.location.hash !== '#pending' ? "navigationLink" : "nLinkSelected")} onClick ={() => {this.clickNav(displayedRoutes[key].path)}}>
                    <NavLink className="nlink" href={displayedRoutes[key].path}>
                    {displayedRoutes[key].label}
                    </NavLink>
                    <div className="blueRectBelow"></div>
                  </div>
                </NavItem>
              ))}
            </Nav>
          </Collapse>
        </Navbar>
        <div className="panelContainer">
              <SocketListener label={'#ready'}/>
        </div>
  </div>);
    }
}


const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

const mapStateToProps = state => ({
  router: state.router,
  isLoading: state.common.isLoading,
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
