import React from 'react';
import OrderRow from './OrderRow.js';
import _ from 'lodash';

class OrderPanel extends React.Component{

    constructor(props){
        super(props);
        
        this.state={
            internalLoad: false,
            cached: false,
        }

        this.cached = false

        this.renderOrderItem = this.renderOrderItem.bind(this);
    }

    componentWillMount(){
        const orders = this.renderOrderItem();
        this.cached =  orders;
    }

    componentWillUpdate(){
        if(!_.isEqual(this.props.orders, this.state.cached)){
            const orders = this.renderOrderItem();
            this.cached = orders;
        }
    }

    componentDidUpdate(nextProps, nextState) {
        if (!nextProps.new) {
          return false;
        } else {
            console.log('get orders')
            this.props.getOrders();
        }
      }



    groupByOrderId(orders){
        const {sendSms, updateAirtable, label} = this.props;
        const orderIds = [];
        const groupedOrders = {};
        orders.map(order => {
            if(!orderIds.includes(order.stripe_transaction_id)){
                orderIds.push(order.stripe_transaction_id)
                groupedOrders[order.stripe_transaction_id] = [order];
            }
            else{
                groupedOrders[order.stripe_transaction_id].push(order); 
            }
        });


        
        return orderIds.map(orderId => {
            const items = groupedOrders[orderId];
            return (
                <OrderRow
                    items={items}
                    sendSms={sendSms}
                    updateAirtable={updateAirtable}
                    label={label}
                />
            )
        })




    }
renderOrderItem() {
        const {orders} = this.props;
        return this.groupByOrderId(orders);
    }

    render(){
        const {header, hasOrders, label, isLoading } = this.props;
        const Labels ={
            pending: 'Pending Orders',
            ready: 'Ready For Pickup',
            completed: 'Completed Orders',
        }
        const noOrderStyles = {
            padding: "20px"
        };
        const show = this.cashed ? this.cached : 'Loading';
        if(window.location.hash.replace('#', '') === label){
        return(
            <div style={{marginTop: '80px'}} >
                <div style={{marginLeft: '20px', paddingTop:'36px'}}>
                <h4>{`${Labels[window.location.hash.replace('#', '')]}`}</h4>
                </div>
                {isLoading ? this.cached :  (
                    <div>
                        {hasOrders ? this.renderOrderItem() : 'No Orders'}
                    </div>
                )}
          </div>
        );}
        return <div></div>
    }
}

export default OrderPanel;