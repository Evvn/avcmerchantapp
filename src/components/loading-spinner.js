import React, { Component } from "react";

const loadingWrapper = {
  display: "flex",
  justfityContent: "center",
  alignItems: "center",
  padding: "20px"
};

let loadingTimeout = null;

class LoadingSpinner extends Component {
  static defaultProps = {
    dotTotal: 3,
    delay: 500, // Milliseconds
    children: "Loading"
  };

  state = {
    dots: 0
  };

  componentDidMount() {
    // Add and update the dots
    requestAnimationFrame(this.updateDots);
  }

  componentWillUnmount() {
    clearTimeout(loadingTimeout);
  }

  updateDots = () => {
    const { dotTotal, delay } = this.props;
    const { dots } = this.state;
    const newDotCount = dots > dotTotal - 1 ? 0 : dots + 1;

    this.setState({ dots: newDotCount }, () => {
      loadingTimeout = setTimeout(
        () => requestAnimationFrame(this.updateDots),
        delay
      );
    });
  };

  renderDots = () => {
    const { dots } = this.state;
    let allDots = "";
    for (let i = 0; i < dots; i++) {
      allDots += ".";
    }
    return allDots;
  };

  render() {
    const { children } = this.props;
    return (
      <div style={loadingWrapper}>
        {children}
        {this.renderDots()}
      </div>
    );
  }
}

export default LoadingSpinner;
