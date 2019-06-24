import React from 'react';
import sign_up from './sign_up'
import './style.css';



class SignUp extends React.Component {
  
handleSignIn(event) {
  event.preventDefault()
  let username = this.refs.username.value
  let password = this.refs.password.value
  this.props.onSignIn(username, password)
}


  render() {

    return (
      <div>
        <sign_up />
        <form onSubmit={this.handleSignIn.bind(this)}>
        <input 
          type="text"
          ref="username" 
          placeholder="enter username"
        />
        <br />
        <input 
          type="password"
          ref="password" 
          placeholder="enter password" 
        />
        <br />
        <input 
          type="text"
          ref="firstName" 
          placeholder="enter first name"
        />
        <br />
        <input 
          type="text"
          ref="middleName" 
          placeholder="enter middle name"
        />
        <br />
        <input 
          type="text"
          ref="lastName" 
          placeholder="enter last name"
        />
        <br />
        <input 
          type="email"
          ref="emailId" 
          placeholder="enter email id"
        />
        <br />
        <input 
          type="number" 
          ref="mobile"
          placeholder="enter mobile number"           
        />
        <br />
        <input 
          type="date"
          ref="dob" 
          placeholder="date of birth"
        />
        <br/>
        <input type="submit" value="SignIn" />
        <br />    
        </form>

      </div>              
                       
    );
  }
}

export default SignUp;


    


  