import React from 'react';
import Header from './Header'
class LoginForm extends React.Component {
  
    // Using a class based component here because we're accessing DOM refs
   
    handleLogIn(e) {
      e.preventDefault()
      let username = this.refs.username.value
      let password = this.refs.password.value
      this.props.onLogIn(username, password)
    }
    
    render() {
      return (
          <div>
         <header><p>Log In</p></header>
        <form className="login" onSubmit={this.handleLogIn.bind(this)}>
          <input type="text" ref="username" placeholder="enter username" />
          <br />
          <input type="password" ref="password" placeholder="enter password" />
          <br/>
          <input type="submit" value="Login" />
        </form>
        </div>
      )
    }
  
  }
  export default LoginForm;
  