import * as actionTypes from '../../components/Common/actions/actionTypes/actionTypes.js';
import { takeLatest, put } from 'redux-saga/effects';
import callBff from '../callBff.js'
import callAirtable from '../callAirtable.js';
import * as utils from '../../utils/orderUtils';


export function* sendSms(action) {
  const res = yield callBff(`ordering/sms`, 'POST',
    {
      redemptionCode: action.redemptionCode,
      number: action.number,
      name: action.name
    }
  )
    .then(response => response)
      yield put({
        type: actionTypes.SEND_SMS_SUCCESS,
        res,
      })
};

export function* updateAirtableOrder(action){
  const res = yield callAirtable(action.id, 'PATCH', {fields :action.fields})
  .then(response => response);

  yield put({
    type: actionTypes.UPDATE_AIRTABLE_SUCCESS,
    res,
  })
}



export function* getCompleteOrders() {
  try {
    const rawOrders = yield utils.airtableFetch();
    const orderState = yield utils.mapOrdersToData(rawOrders);

    yield put({
      type: actionTypes.GET_ORDERS_SUCCESS,
      orderState,
    })
  } catch (e) {
    console.log(e);
  }
};


export function* updateOrders(action) {
  yield put({
    type: actionTypes.GET_ORDERS_SUCCESS,
    orderState: action.orderState,
  })
}

export function* actionWatcher() {
  yield [
    takeLatest(actionTypes.SEND_SMS_REQUEST, sendSms),
    takeLatest(actionTypes.GET_ORDERS_REQUEST, getCompleteOrders),
    takeLatest(actionTypes.UPDATE_ORDER_STATE_REQUEST, updateOrders),
    takeLatest(actionTypes.UPDATE_AIRTABLE_REQUEST, updateAirtableOrder),
  ]
}
