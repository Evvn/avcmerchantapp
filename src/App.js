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
import OrderPanel from './components/OrderPanel.js';
import stub from './data/airtableDatabaseStub.json';
import socketIOClient from "socket.io-client";

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

// Pusher Setup and Channels
// NOTE: Has to have the 'client-' prefix otherwise Pusher rejects the event.
// https://pusher.com/docs/client_api_guide/client_events#trigger-events
const ORDER_COMPLETE_EVENT = "client-complete-order";
const ORDER_CHANNEL_NAME = "private-order-channel";
const ORDER_ADDED_EVENT = "new-order";
const pusher = new Pusher(process.env.REACT_APP_PUSHER_APP_KEY, {
  authEndpoint: process.env.REACT_APP_PUSHER_DOMAIN + "/pusher/auth",
  cluster: "ap1"
});
//////////////////////////////////////////////////////////////////////////////

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
      response: false,
      endpoint: "localhost:5000",
      currentView: '#pending',
    };

    this.channel = null;
  }

  componentWillMount(){
    const {  getOrders, orders } = this.props;
    getOrders();
    

  }

  componentWillUpdate(){
    const { getOrders, orders} = this.props;
    //getOrders();
    
  }

  

  componentWillUnmount(){
    localStorage.clear('persist:persistedStore')
  }

  componentDidMount(){

    const { endpoint } = this.state;
    const socket = socketIOClient(endpoint);
    socket.on("FromAPI", data => this.setState({ response: data }, this.checkUpdate(this.state.response, data)));
  }

  checkUpdate(past, current){
    console.log(past, this.state.response)
    if(past !== current){
      console.log('got here')
      this.props.getOrders()
    }
  }

  routeTo(suffix){
    window.location = `/${suffix}`;
  }

  clickNav(path){
    this.setState({currentView: path});
  }

  render() {
    // eslint-disable-next-line
    const { orders, isLoading, sendSms, updateAirtable } = this.props
    const {connectionStatus} = this.state;
    console.log(orders);

    if(isLoading){
      return <LoadingScreen />
    }
    else{

    const pendingOrders = orders.pending;
    console.log(pendingOrders)
    const completedOrders = orders.completed;
    const hasPendingOrders = !!pendingOrders.length;
    const hasCompletedOrders = !!completedOrders.length;

    const routes = [
      { name: 'home', path: '#pending' },
      { name: 'about', path: '#ready' },
      { name: 'whatwedo', path: '#completed' },
    ];

    const displayedRoutes = {
      pending: { label: `Pending Orders`, amount: `(${pendingOrders.length})`, path: routes[0].path },
      ready: { label: `Ready For Pickup`, amount: `(${pendingOrders.length})`, path: routes[1].path },
      completed: { label: `Completed Orders`, amount: `(${completedOrders.length})`, path: routes[2].path },
    };

    console.log(this.state.response);
    // const path = router.location.pathname.split('/')[1];
    // const showMenu = venueNames ? venueNames.includes(path) ? true : false : false;
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
                <NavItem className="nlink" >
                  <div className="navigationLink" onClick ={() => {this.clickNav(displayedRoutes[key].path)}}>
                    <NavLink className="nlink" href={displayedRoutes[key].path}>
                    {displayedRoutes[key].label}
                    <br/>
                    {displayedRoutes[key].amount}
                    </NavLink>
                    <div className="blueRectBelow"></div>
                  </div>
                </NavItem>
              ))}
            </Nav>
          </Collapse>
        </Navbar>
        <div className="panelContainer">
          <OrderPanel
            hasOrders={hasPendingOrders}
            orders={pendingOrders}
            label='pending'
            header="Pending Orders"
            sendSms={sendSms}
            updateAirtable={updateAirtable}
            channel={this.channel}
          />
      </div>
  </div>);
    }
  }
}


const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

const mapStateToProps = state => ({
  router: state.router,
  orders: state.common.orders,
  isLoading: state.common.isLoading,
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
