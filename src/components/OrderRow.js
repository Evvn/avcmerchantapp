import React, { Component } from "react";
import dayjs from "dayjs";
import axios from "axios";
import { toast } from "react-toastify";
import { Card, Button, CardImg, CardText, CardBody,
  CardTitle, CardSubtitle } from 'reactstrap';



const titleStyles = { fontWeight: "bold", padding: "10px 0" };

class Order extends Component {



  generateItems(){
    const {items} = this.props;
    return items.map(item => {
      const {customer_name, table_or_pickup, phone_number, created_time} = item;
      return (
        <div>
        <h6>{`${table_or_pickup}`}</h6>
        <p>{`${item.items.name}`}</p>
        </div>
      );
    });
  }

  updateOrderStatus(){
    const { updateAirtable, items, order_is_ready, label } = this.props;
    const newCompletionTime = new Date().toISOString();
    items.map(item => {
      const {id, processed, order_is_ready } = item;
      const fields = {
        processed: true,
        order_is_ready: label === 'pending' ? false : !order_is_ready,
        completed_time: newCompletionTime,
      }
      updateAirtable(id, fields)})
  }

  render() {
    const { items, customerName, tableOrPickup, sendSms, label} = this.props;
    const name = items[0].customer_name;
    const redemptionCode = items[0].unique_code;
    const number = items[0].phone_number_for_sms;
    return (
      <div style={{margin: '0 auto', width: '80%', marginBottom: '30px'}}>
        <Card  body>
              <CardTitle>
              <h2>{name}</h2>
              <h2>{redemptionCode}</h2>
              <h4>{items[0].table_or_pickup}</h4>
              </CardTitle>
              <CardText>
                {this.generateItems()}
              </CardText>
              <Button onClick={() => {this.updateOrderStatus()}} style={{position: 'absolute', right: '10px', top: '20px', width: '200px', height: '90px',background: 'green', color:'white'}}>
                Complete
              </Button>
              {label === 'pending' ? <Button style={{position: 'absolute', right: '10px', top: '120px', width: '200px', height: '90px',background: 'blue', color:'white'}}  onClick={() => {sendSms(name, number,redemptionCode)}} >
                Send SMS
              </Button> : null}
            
        </Card>
      </div>
  );
  }
}

export default Order;
