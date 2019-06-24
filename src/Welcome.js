import React from 'react';
const Welcome = ({user, onSignOut , onLogOut})=> {
    // This is a dumb "stateless" component
    return (
      <div>
        <header><p>Welcome</p><p> {user.username}</p></header>
        <a className="try" href="javascript:;" onClick={onSignOut}> Sign in </a>
        <br />
        <a className="try" href="javascript:;" onClick={onLogOut}> Log in </a>
        <br />
        <a className="try" href="javascript:;" onClick={console.log("Hello")}> Post </a>
      </div>
    )
  }
  export default Welcome;