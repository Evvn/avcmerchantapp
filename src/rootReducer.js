import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import commonReducer from './components/Common/reducers/commonReducer.js';
//import { router5Reducer } from 'redux-router5';

export const makeRootReducer = (history) => combineReducers({
  // Add sync reducers here
  router: connectRouter(history),
  common: commonReducer,
});

export default makeRootReducer;
