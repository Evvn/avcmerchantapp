// 404 page featuring Johnny boy
import React from 'react'

class NotFound extends React.Component {

  render() {
    return(
      <div className="loading">
        <img className="pnf" src="/mryum_assets/Mr_Yum_logo_white.svg" alt="Mr Yum"/>
        <div>
          <h2 className="pnf">We can't find what you're looking for!</h2>
        </div>
        <img className="lost" src="/mryum_assets/lost.gif" alt="404"/>
      </div>
    )
  }
}

export default NotFound
