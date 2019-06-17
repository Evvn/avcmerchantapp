import React, { Component } from "react";
import dayjs from "dayjs";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Card,
  Button,
  CardImg,
  CardText,
  CardBody,
  CardTitle,
  CardSubtitle
} from "reactstrap";

import Addons from "../data/Addons.json";

const titleStyles = { fontWeight: "bold", padding: "10px 0" };

class Order extends Component {
  findAddon(match) {
    return (
      <div>
        <p>{`--${match.name}  - Addon Price: ${match.price}`}</p>
      </div>
    );
  }

  generateItems() {
    const { items } = this.props;
    return items.map(item => {
      const {
        customer_name,
        table_or_pickup,
        phone_number,
        created_time
      } = item;
      return (
        <div>
          <h5>{`${item.quantity} x ${item.items.name}`}</h5>
          <br />
          <h6>Addons</h6>
          {(item.addons || []).map(toAdd => this.findAddon(toAdd))}
          <br />
          <h5>{"Price: " + item.items.price}</h5>
          {/* <h5>{'Quanity: ' + item.quantity}</h5> */}
          <br />
          <h5>
            {"Ordered at: " +
              dayjs(created_time).format("HH:mm:ss ddd DD/MM/YY")}
          </h5>
          <hr />
          <br />
        </div>
      );
    });
  }

  updateOrderStatus() {
    const { updateAirtable, items, order_is_ready, label } = this.props;
    const newCompletionTime = new Date().toISOString();
    items.map(item => {
      const { id, processed, order_is_ready } = item;
      const fields = {
        processed: true,
        order_is_ready:
          window.location.hash === "#pending" ? false : !order_is_ready,
        completed_time: newCompletionTime
      };
      updateAirtable(id, fields);
    });
  }

  render() {
    const { items, customerName, tableOrPickup, sendSms, label } = this.props;
    const name = items[0].customer_name;
    const redemptionCode = items[0].unique_code;
    const number = items[0].phone_number_for_sms;
    return (
      <div style={{ margin: "0 auto", width: "80%", marginBottom: "30px" }}>
        <Card body>
          <CardTitle>
            <h2>{name}</h2>
            <h2>{redemptionCode}</h2>
          </CardTitle>
          <CardText>{this.generateItems()}</CardText>
          {window.location.hash !== "#completed" ? (
            <Button
              onClick={() => {
                toast("Order Status Updating....");
                this.updateOrderStatus();
              }}
              style={{
                position: "absolute",
                right: "10px",
                top: "20px",
                width: "200px",
                height: "90px",
                background: "green",
                color: "white"
              }}
            >
              {window.location.hash !== "#completed" ? "Complete" : "Undo"}
            </Button>
          ) : null}
          {window.location.hash === "#ready" ? (
            <Button
              style={{
                position: "absolute",
                right: "10px",
                top: "120px",
                width: "200px",
                height: "90px",
                background: "blue",
                color: "white"
              }}
              onClick={() => {
                toast("Sending SMS....");
                sendSms(name, number, redemptionCode);
              }}
            >
              Send SMS
            </Button>
          ) : null}
        </Card>
      </div>
    );
  }
}

export default Order;
