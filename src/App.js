import React, { Component } from "react";
import "./App.css";
import Airtable from "./data/airtable";

import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import Orders from "./data/orders";
import Items from "./data/items";
import Addons from "./data/addons";
import OrderRow from "./components/order-row";
import LoadingSpinner from "./components/loading-spinner";

import * as Pusher from "pusher-js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import dayjs from "dayjs";

const STATUS = {
  CONNECTED: "connected",
  CONNECTING: "connecting"
};
const ORDER_CHANNEL_NAME = "private-order-channel";
const ORDER_ADDED_EVENT = "new-order";
// NOTE: Has to have the 'client-' prefix otherwise Pusher rejects the event.
// https://pusher.com/docs/client_api_guide/client_events#trigger-events
const ORDER_COMPLETE_EVENT = "client-complete-order";

const noOrderStyles = {
  padding: "20px"
};

const pusher = new Pusher(process.env.REACT_APP_PUSHER_APP_KEY, {
  authEndpoint: process.env.REACT_APP_PUSHER_DOMAIN + "/pusher/auth",
  cluster: "ap1"
});

const connectionStyles = status => {
  return {
    height: "4px",
    width: "4px",
    borderRadius: "10px",
    backgroundColor:
      status === STATUS.CONNECTED
        ? "green"
        : status === STATUS.CONNECTING
        ? "orange"
        : "red",
    marginLeft: "5px"
  };
};

const statusStyles = {
  position: "absolute",
  fontSize: "16px",
  top: "32px",
  right: "16px",
  zIndex: "2",
  display: "flex",
  alignItems: "center"
};

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      orders: [],
      items: [],
      addons: [],
      isLoading: true,
      connectionStatus: {
        previous: null,
        current: "connecting"
      }
    };

    this.channel = null;

    this.updateOrderItem = this.updateOrderItem.bind(this);
    this.renderOrderItem = this.renderOrderItem.bind(this);
    this.mapOrdersToData = this.mapOrdersToData.bind(this);
    this.itemsWithData = this.itemsWithData.bind(this);
  }

  updateOrderItem(orderToUpdate, isFromPusher = false) {
    this.setState(
      {
        orders: this.state.orders.map(order => {
          if (order.id === orderToUpdate.id) {
            return {
              ...order,
              ...orderToUpdate
            };
          }
          return order;
        })
      },
      () => {
        // TODO: Notify others in the channel that we have updated an order item
        // We don't want other staff seeing an order that has been completed, you know??

        if (!isFromPusher) {
          this.channel.trigger(ORDER_COMPLETE_EVENT, { orderToUpdate });
        }
      }
    );
  }

  async componentDidMount() {
    pusher.connection.bind("state_change", states => {
      this.setState({ connectionStatus: states });
    });
    // TODO: Replace venueName with venueId
    // It is currently hardcoded for the pilot trial night :D
    const venueName = "Hopscotch";

    /**
     * Get all current available orders.
     */
    await Airtable.fetchBase({
      venueName,
      baseName: "Orders"
    }).then(response => {
      Orders.setAll({
        venueName,
        items: response
      });
      const currentOrders = Orders.getAll("Hopscotch");
      this.setState({ orders: currentOrders });
    });

    /**
     * Get all current available items to map with the order.
     */
    await Airtable.fetchBase({
      venueName,
      baseName: "Database"
    }).then(response => {
      Items.setAll({
        items: response.map(Airtable.mapItemColumns),
        venueName
      });
      const currentItems = Items.getAll("Hopscotch");
      this.setState({ items: currentItems });
    });

    /**
     * Get all current available items to map with the order.
     */
    await Airtable.fetchBase({
      venueName,
      baseName: "Add-On by Group"
    }).then(response => {
      Addons.setAll({
        addons: response.map(Airtable.mapAddonColumns),
        venueName
      });
      const currentAddons = Addons.getAll("Hopscotch");
      this.setState({ addons: currentAddons });
    });

    // First load we map over all orders to set the correct item/addon data
    this.mapOrdersToData({ orders: this.state.orders }).then(response => {
      if (response.success) {
        /**
         * Pusher has been added to listen to new orders from a customer.
         *
         * It will append new orders to the current state of orders so that the
         * staff are able to see them live.
         */
        this.channel = pusher.subscribe(ORDER_CHANNEL_NAME);
        this.channel.bind(ORDER_ADDED_EVENT, orders => {
          if (!Array.isArray(orders)) {
            return;
          }
          this.mapOrdersToData({ orders, appendOrders: true }).then(
            response => {
              toast.dismiss();
              toast("A new order has arrived!");
            }
          );
        });
        this.channel.bind(ORDER_COMPLETE_EVENT, ({ orderToUpdate }) => {
          if (orderToUpdate) {
            this.updateOrderItem(orderToUpdate, true);
          }
        });
      } else {
        toast.error("Having troubles loading, please refresh the page.");
      }
    });
  }

  componentWillUnmount() {
    // Unsubscribe for clean up purposes. We don't want to keep a dormant
    // subscription around for longer than necessary.
    pusher.unsubscribe(ORDER_CHANNEL_NAME);
  }

  itemsWithData(order) {
    return order.combinedItems.map(({ item_id: itemId, addons, quantity }) => {
      return {
        item: this.state.items.find(item => item.id === itemId),
        addons: (addons || []).map(addonId => {
          return this.state.addons.find(addon => addon.id === addonId);
        }),
        quantity
      };
    });
  }

  /**
   * Handles combining orders with the same stripe_transaction_id. Each row in the Orders
   * table is restricted to 1 item ID and many add-ons. It was done in this way so we can tell
   * which add-ons are for which item. Unfortunately airtable doesn't support saving objects so
   * this is the best solution we have currently.
   *
   * Once the orders have their items and add-on ids combined, the item + add-on data from the other
   * tables are added. The data is added based on the item id and add-on id.
   *
   * @param {Object} orders
   * @returns {Promise} Once the orders have been added to the local state.
   */
  mapOrdersToData({ orders, appendOrders = false }) {
    return new Promise((resolve, reject) => {
      try {
        const squishedOrders = orders.reduce((result, currentOrder) => {
          const { item_id, addons, quantity, ...rest } = currentOrder;
          const [itemId] = item_id; // Grab the first as we only ever have 1 item id
          const possibleTransaction = result.findIndex(
            order =>
              order.stripe_transaction_id === currentOrder.stripe_transaction_id
          );

          let currentTransaction = result[possibleTransaction] || rest;

          if (!currentTransaction.combinedItems) {
            currentTransaction.combinedItems = [
              {
                item_id: itemId,
                addons,
                quantity
              }
            ];
          } else {
            currentTransaction.combinedItems.push({
              item_id: itemId,
              addons,
              quantity
            });
          }

          if (possibleTransaction > -1) {
            result[possibleTransaction] = currentTransaction;
          } else {
            result.push(currentTransaction);
          }

          return result;
        }, []);

        this.setState(
          {
            orders: [
              ...squishedOrders.map(order => {
                return {
                  ...order,
                  items: this.itemsWithData(order)
                };
              }),
              ...(appendOrders ? this.state.orders : [])
            ],
            isLoading: false
          },
          () => {
            resolve({ success: true });
          }
        );
      } catch (error) {
        reject({ success: false, error });
      }
    });
  }

  /**
   * Simply checks if the orders have the correct item data ready to show the user.
   * If not we just don't render anything.
   *
   * @param {Object} order
   */
  renderOrderItem(order) {
    if (!!order.items) {
      return (
        <OrderRow
          key={order.id}
          order={order}
          updateOrder={this.updateOrderItem}
        />
      );
    }
    return null;
  }

  render() {
    const { connectionStatus, orders, isLoading } = this.state;

    const pendingOrders = orders
      .filter(order => !order.processed)
      .sort((a, b) => {
        // Sorts the pending orders by the created_time field
        const firstItem = dayjs(a.created_time);
        const secondItem = dayjs(b.created_time);

        if (firstItem.isBefore(secondItem)) {
          return -1;
        }

        if (firstItem.isAfter(secondItem)) {
          return 1;
        }

        // The dates are the same
        return 0;
      });
    const completedOrders = orders
      .filter(order => !!order.processed)
      .sort((a, b) => {
        // Sorts the completed orders by the completed_time field
        const firstItem = dayjs(
          a.completed_time ? a.completed_time : a.created_time
        );
        const secondItem = dayjs(
          b.completed_time ? b.completed_time : b.created_time
        );

        if (firstItem.isBefore(secondItem)) {
          return 1;
        }

        if (firstItem.isAfter(secondItem)) {
          return -1;
        }

        // The dates are the same
        return 0;
      });
    const hasPendingOrders = !!pendingOrders.length;
    const hasCompletedOrders = !!completedOrders.length;

    return (
      <div className="App">
        <ToastContainer
          position={toast.POSITION.TOP_RIGHT}
          autoClose={1000}
          pauseOnHover={false}
          pauseOnFocusLoss={false}
          hideProgressBar={true}
        />
        <div style={statusStyles}>
          {connectionStatus.current}{" "}
          <div style={connectionStyles(connectionStatus.current)} />
        </div>
        <Tabs>
          <TabList>
            <Tab>Pending ({pendingOrders.length})</Tab>
            <Tab>Completed ({completedOrders.length})</Tab>
          </TabList>

          <TabPanel>
            {isLoading ? (
              <LoadingSpinner delay={250}>Loading Orders</LoadingSpinner>
            ) : hasPendingOrders ? (
              pendingOrders.map(this.renderOrderItem)
            ) : (
              <div style={noOrderStyles}>No pending orders yet.</div>
            )}
          </TabPanel>
          <TabPanel>
            {isLoading ? (
              <LoadingSpinner delay={250}>Loading Orders</LoadingSpinner>
            ) : hasCompletedOrders ? (
              completedOrders.map(this.renderOrderItem)
            ) : (
              <div style={noOrderStyles}>No completed orders yet.</div>
            )}
          </TabPanel>
        </Tabs>
      </div>
    );
  }
}

export default App;
