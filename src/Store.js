// eslint-disable-next-line
import { applyMiddleware, compose, createStore } from 'redux';
import { routerMiddleware } from 'connected-react-router';
import storage from 'redux-persist/lib/storage'
import { createBrowserHistory } from 'history'
import makeRootReducer from './rootReducer';
import createSagaMiddleware from 'redux-saga';
import rootSaga from './integration/sagas/rootSaga.js'

export const history = createBrowserHistory();

export default (initialState = {}) => {

  const sagaMiddleware = createSagaMiddleware();

  const middleware = [
    routerMiddleware(history),
    sagaMiddleware,
  ];
  const enhancers = [];
  let store = '';

  // for dev
  // if (process.env.REACT_APP_REDUX_DEV_TOOLS === 'true') {
  //   store = createStore(
  //     makeRootReducer(history),
  //     initialState,
  //     window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
  //       trace: true,
  //     })(applyMiddleware(...middleware), ...enhancers),
  //   );
  // } // for prod
  // else {
  //   store = createStore(
  //     makeRootReducer(history),
  //     initialState,
  //     compose(applyMiddleware(...middleware), ...enhancers),
  //   );
  // }

  store = createStore(
    makeRootReducer(history),
    initialState,
    compose(applyMiddleware(...middleware), ...enhancers),
  );

  store.asyncReducers = {};
  sagaMiddleware.run(rootSaga)

  window.store = store;
  return store;
};
