import React from "react";
import socketIOClient from "socket.io-client";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import OrderPanel from "../OrderPanel.js";
import _ from "lodash";

import * as actions from "./actions/actions.js";

class SocketListener extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      response: false,
      update: false,
      endpoint: process.env.REACT_APP_BFF_BASE_URL
    };

    this.old = false;
    this.response = false;
    this.new = false;
  }

  componentWillMount() {
    const { getOrders, orders } = this.props;
    getOrders();
  }

  componentDidMount() {
    const { endpoint } = this.state;
    const socket = socketIOClient(endpoint);
    socket.on("FromAPI", data => {
      if (!_.isEqual(JSON.stringify(data), JSON.stringify(this.response))) {
        console.log("called");
        this.old = this.response;
        this.response = data;
        if (!_.isEqual(this.old, this.response)) {
          // update sound here
          //   new Audio("/coin.mp3").play();
          this.forceUpdate();
        }
      }
    });
  }

  render() {
    const {
      orders,
      isLoading,
      sendSms,
      updateAirtable,
      getOrders,
      label
    } = this.props;
    const pendingOrders = !isLoading ? orders.pending : [];
    const completedOrders = !isLoading ? orders.completed : [];
    const hasPendingOrders = !isLoading ? !!pendingOrders.length : false;
    const hasCompletedOrders = !isLoading ? !!completedOrders.length : false;
    const readyOrders = !isLoading ? orders.ready : [];
    const hasReadyOrders = !isLoading ? !!readyOrders.length : false;

    let ordersOut;
    let hasOrders;
    if (window.location.hash === "#pending") {
      ordersOut = pendingOrders;
      hasOrders = hasPendingOrders;
    } else if (window.location.hash === "#completed") {
      ordersOut = completedOrders;
      hasOrders = hasCompletedOrders;
    } else {
      ordersOut = readyOrders;
      hasOrders = hasReadyOrders;
    }
    return (
      <div>
        <OrderPanel
          hasOrders={hasPendingOrders}
          orders={pendingOrders}
          label="pending"
          header="Pending Orders"
          sendSms={sendSms}
          updateAirtable={updateAirtable}
          isLoading={isLoading}
          getOrders={getOrders}
          new={!_.isEqual(this.response, this.old)}
        />

        <OrderPanel
          hasOrders={hasReadyOrders}
          orders={readyOrders}
          label="ready"
          header="Ready Orders"
          sendSms={sendSms}
          updateAirtable={updateAirtable}
          isLoading={isLoading}
          getOrders={getOrders}
          new={!_.isEqual(this.response, this.old)}
        />
        <OrderPanel
          hasOrders={hasCompletedOrders}
          orders={completedOrders}
          label="completed"
          header="Completed Orders"
          sendSms={sendSms}
          updateAirtable={updateAirtable}
          isLoading={isLoading}
          getOrders={getOrders}
          new={!_.isEqual(this.response, this.old)}
        />
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

const mapStateToProps = state => ({
  router: state.router,
  orders: state.common.orders,
  isLoading: state.common.isLoading
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SocketListener);
