import React, { Component } from "react";
import dayjs from "dayjs";
import axios from "axios";
import { toast } from "react-toastify";

const containerStyles = {
  display: "flex",
  padding: "20px",
  justifyContent: "space-between"
};

const orderInfoStyles = {
  display: "flex",
  flexDirection: "column",
  flex: 3,
  border: "1px solid"
};

const orderInfoWrapper = {
  display: "flex",
  justifyContent: "space-between",
  padding: "20px"
};

const customerDetailsStyles = {
  display: "flex",
  flex: 1
};

const orderDetailsStyles = {
  display: "flex",
  flexDirection: "column",
  padding: "20px",
  paddingTop: "0"
};

const actionStyles = {
  flex: 1,
  padding: "20px",
  background: "green",
  color: "white",
  fontSize: "24px",
  border: "1px solid green"
};

const titleStyles = { fontWeight: "bold", padding: "10px 0" };

class Order extends Component {
  updateStatus = () => {
    const { updateOrder, order } = this.props;
    const { updateFields, processed, id } = order;
    const newCompletionTime = new Date().toISOString();

    if (updateFields) {
      updateOrder({
        id,
        processed: !processed,
        completed_time: newCompletionTime
      });

      updateFields({
        processed: !processed,
        completed_time: newCompletionTime
      }).catch(error => {
        console.error(error);
        toast.error(
          "Please refresh the page, we are having issues with the connection."
        );
        updateOrder({ id, processed: processed }); // Set order back to the original state
      });
    } else {
      updateOrder({
        id,
        processed: !processed,
        completed_time: newCompletionTime
      });

      axios
        .patch(
          `https://api.airtable.com/v0/app4XnP7NuSCWMWD7/Orders/${id}`,
          {
            fields: {
              processed: !processed,
              completed_time: newCompletionTime
            }
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.REACT_APP_AIRTABLE_API_KEY}`
            }
          }
        )
        .catch(error => {
          console.error(error);
          toast.error(
            "Please refresh the page, we are having issues with the connection."
          );
          updateOrder({ id, processed: processed }); // Set order back to the original state
        });
    }
  };

  getOrderTotal = () => {
    const { items } = this.props.order;
    const itemTotals =
      (items.length &&
        items.reduce((total, currentItem) => {
          const itemQuantity = currentItem.quantity || 1;
          const totalPerItem = +currentItem.item.price * itemQuantity;
          const addonTotal =
            (currentItem.addons.length &&
              currentItem.addons.reduce((total, currentAddon) => {
                const totalPerAddon = +currentAddon.price * itemQuantity;
                return total + totalPerAddon;
              }, 0)) ||
            0;
          return total + totalPerItem + addonTotal;
        }, 0)) ||
      0;
    return itemTotals.toFixed(2);
  };

  render() {
    const { order } = this.props;
    const {
      customer_name,
      table_number,
      created_time,
      items,
      processed,
      id
    } = order;

    const prettyTime = dayjs(created_time).format("hh:mm A");
    const prettyDate = dayjs(created_time).format("DD-MM-YYYY");

    const orderTotal = this.getOrderTotal();

    return (
      <div key={id} style={containerStyles}>
        <div style={orderInfoStyles}>
          <div style={orderInfoWrapper}>
            <div style={customerDetailsStyles}>
              <div>{customer_name}</div>&nbsp;-&nbsp;<div>{table_number}</div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end"
              }}
            >
              <div>{prettyTime}</div>
              <div>{prettyDate}</div>
            </div>
          </div>
          <div style={orderDetailsStyles}>
            {items.map(item => {
              const itemQuantity = item.quantity || "1";
              const itemTotal = (+item.item.price * +itemQuantity).toFixed(2);
              return (
                <div
                  key={`${id}-${item.item.id}`}
                  style={{ paddingBottom: "20px" }}
                >
                  <div style={titleStyles}>Item</div>
                  <div>
                    {itemQuantity} x {item.item.name} ($ {itemTotal})
                  </div>
                  <div style={titleStyles}>Extras</div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {item.addons.map(addon => {
                      const addonTotal = (+addon.price * +itemQuantity).toFixed(
                        2
                      );
                      return (
                        <span key={`${id}-${item.item.id}-${addon.id}`}>
                          {addon.name} ($ {addonTotal})
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            <div style={{ fontWeight: "bold" }}>Total: $ {orderTotal}</div>
          </div>
        </div>
        <button style={actionStyles} onClick={this.updateStatus}>
          {processed ? "Undo" : "Complete"}
        </button>
      </div>
    );
  }
}

export default Order;
