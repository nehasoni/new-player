import { h, Component } from "preact";
export default class ImaLoader extends Component {
  componentDidMount(){
    var self = this
    if(!window.google || !window.google.ima){
      var script = document.createElement("script")
      script.onload = function(){
        if(self.props.onLoad){
          self.props.onLoad()
        }
      }
      script.onerror = function(){}
      script.src = "//imasdk.googleapis.com/js/sdkloader/ima3.js"
      document.body.appendChild(script)
    }
  }
  render() {
    return null
  }
}