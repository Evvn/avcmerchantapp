import React, { Component } from "react";

import bugsnag from "@bugsnag/js";
import bugsnagReact from "@bugsnag/plugin-react";

const bugsnagClient = bugsnag({
  apiKey: "ce67048b6301106e9778dbdb8904959f",
  metaData: { fullstoryURL: null },
  beforeSend: report => {
    window.FS &&
      report.updateMetaData(
        "fullstoryURL",
        window.FS.getCurrentSessionURL(true)
      );
  }
});
bugsnagClient.use(bugsnagReact, React);

const buttonStyles = {
  textDecoration: "underline",
  cursor: "pointer"
};

class ErrorBoundary extends Component {
  state = {
    hasError: false
  };

  componentDidCatch(error, info) {
    // Display fallback UI
    this.setState({ hasError: true });
    bugsnagClient.notify(error);
  }

  reloadPage = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div>
          Well this is embarrassing. Something isn't working correctly. Please{" "}
          <span style={buttonStyles} onClick={this.reloadPage}>
            click here
          </span>{" "}
          to try again.
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
