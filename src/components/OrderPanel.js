import React from 'react';
import OrderRow from './OrderRow.js';

class OrderPanel extends React.Component{

    constructor(props){
        super(props);
        
        

        this.renderOrderItem = this.renderOrderItem.bind(this);
    }






    groupByOrderId(orders){
        const {sendSms, updateAirtable, channel} = this.props;
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

        console.log(groupedOrders, orderIds)

        
        return orderIds.map(orderId => {
            const items = groupedOrders[orderId];
            return (
                <OrderRow
                    items={items}
                    sendSms={sendSms}
                    updateAirtable={updateAirtable}
                    channel={channel}
                />
            )
        })




    }
renderOrderItem() {
        const {orders} = this.props;
        return this.groupByOrderId(orders);
    }

    render(){
        const {header, hasOrders, orders, label } = this.props;

        const noOrderStyles = {
            padding: "20px"
        };

        return(
            <div style={{marginTop: '80px'}} id={label}>
                <div style={{marginLeft: '20px', paddingTop:'36px'}}>
                <h4>{header}{this.props.response}</h4>
                </div>
                {true ? this.renderOrderItem(): (
                    <div style={noOrderStyles}>
                        {`No ${label} orders yet.`}
                    </div>
                )}
          </div>
        );
    }
}

export default OrderPanel;