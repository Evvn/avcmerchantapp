// eslint-disable-next-line
import * as actionTypes from '../actions/actionTypes/actionTypes.js';

const initialState = {
  orders: false,
  isConnecting: false,
  isLoading: true,
}

function commonReducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.GET_ORDERS_REQUEST:
      return {
        ...state,
        isLoading: true,
      }
    case actionTypes.GET_ORDERS_SUCCESS:
      return {
        ...state,
        orders: action.orderState,
        isLoading: false,
      }
    default:
      return state
  }
}

export default commonReducer;