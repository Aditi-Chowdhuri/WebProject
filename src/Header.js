import React from "react"

class Header extends React.Component  {
    handleSubmit(event) {
        event.preventDefault()
        let username = this.refs.username.value
        let password = this.refs.password.value
        this.props.onSignIn(username, password)
    }

    render (){
        return (
            <div>
            <form onSubmit={this.handleSubmit.bind(this)}>
            <input type="submit" value="Welcome" />
            </form>
            </div>
        )
    }
}

export default Header