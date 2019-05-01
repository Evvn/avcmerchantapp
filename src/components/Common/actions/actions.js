import * as actionTypes from './actionTypes/actionTypes.js';

export function getOrders() {
    return {
      type: actionTypes.GET_ORDERS_REQUEST,
    }
}

export function updateOrderState() {
    return {
      type: actionTypes.UPDATE_ORDER_STATE_REQUEST,
    }
}

export function sendSms(name, number,redemptionCode){
    return {
        type: actionTypes.SEND_SMS_REQUEST,
        name,
        number,
        redemptionCode
    }
}

export function updateAirtable(id, fields) {
    return {
      type: actionTypes.UPDATE_AIRTABLE_REQUEST,
      id,
      fields,
    }
}
