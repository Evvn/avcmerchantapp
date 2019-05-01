import React from 'react';
import { connect } from 'react-redux';
import { createRouteNodeSelector } from 'redux-router5';

function Switch({ route, moduleMappings, topRouteName }) {
  let Component = '';

  // eslint-disable-next-line
  Object.keys(moduleMappings).map((key) => {
    console.log(key, topRouteName)
    if (topRouteName === key) {

      Component = moduleMappings[`${key}`].component;
    }
  });

  return <Component />;
}

export default connect(createRouteNodeSelector(''))(Switch);
