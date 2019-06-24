import React from 'react';
import Welcome from './Welcome';
import LoginForm from './LoginForm';
import './style.css';
import SignUp from './SignUp';
;

class App extends React.Component {
  
  constructor(props) {
    super(props)
    // the initial application state
    this.state = {
      user: null,
      try: null,
    }
  }
  
  // App "actions" (functions that modify state)
  signIn(username, password) {
    // This is where you would call Firebase, an API etc...
    // calling setState will re-render the entire app (efficiently!)
    this.setState({
      user: {
        firstName: "",
        middleName: "",
        lastName: "",
        emailId: "",
        mobile: "",
        dob: "",
        username:"",
        password:"",
      }
      }
    )
  }
  
  signOut() {
    // clear out user from state
    this.setState({user: null})
  }

  logIn(username, password) {
    // This is where you would call Firebase, an API etc...
    // calling setState will re-render the entire app (efficiently!)
    this.setState({
      try: {
        username:"",
        password:"",
      }
      }
    )
  }

  logOut() {
    // clear out user from state
    this.setState({try: null})
  }

  render() {
    // Here we pass relevant state to our child components
    // as props. Note that functions are passed using `bind` to
    // make sure we keep our scope to App
    return (
      <div>

        { 
          (this.state.user) ? 
          
          (this.state.try)?
           <Welcome 
             user={this.state.user} 
             onSignOut={this.signOut.bind(this)}  
             onLogOut={this.logOut.bind(this)}  
            />
            :
            <LoginForm
              onLogIn={this.logIn.bind(this)}
            />
           :  
           <SignUp
             onSignIn={this.signIn.bind(this)} 
            />
           
          
        }
      </div>
    )
    
  }
  
}
export default App;

