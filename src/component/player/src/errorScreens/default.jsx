import { h, render, Component } from "preact"

export default class DefaultErrorScreen extends Component {
    render(){
        let message = this.props.message || "Unfortunately playing is stopped due to some error. Please try again."

        return  <div className="error-screen">
                    <div className="error-content-container">
                        <p>{message}</p>
                    </div>
                </div>
    }
}