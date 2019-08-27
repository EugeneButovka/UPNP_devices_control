import React from "react";
import {AppRegistry} from "react-native";
import {Text, Button, Card, Picker, Icon, Item} from "native-base";
import upnp from "../utilites/upnpUtils";
import lightControl from "../utilites/lightControl";


export default class LightControlHub extends React.Component {
    state = {
        currentLightControl: null,
        // currentLightDeviceNumber: null,
        lightState: null,
        
        //lightDevices: ["1", "2", "3"],
        pickerSelectedValue: null,
    };
    
    constructor(props) {
        super(props);
        
        this.state = {
            currentLightControl: null,
            // currentLightDeviceNumber: null,
            lightState: null,
            
            //lightDevices: [],//["1", "2", "3"],
            pickerSelectedValue: null,

        };
    }
    
    getDeviceNetworkAddress(device) {
        //console.log('try get device network address', device);
        const str = device.headers.LOCATION.match(/^(http|https)[\s\S]+(?=\/)/i)[0];
        console.log('LOCATION', str);
        return str;
    }
    
    
    getLightState = async () => {
        const res = await this.state.currentLightControl.getLightState();
        console.log("light state is now: ", res);
        
        this.setState({
            lightState: res
        });
    };
    
    setCurrentLightControl = (device) => {
        this.setState({
            currentLightControl: new lightControl(this.getDeviceNetworkAddress(device))
        });
        this.getLightState();
    };
    
    switchLight = () => {
        const newLightState = !this.state.lightState;
        this.state.currentLightControl.setLightState(newLightState);
        this.setState({
            lightState: newLightState
        });
    };
    
    onLightSelectValue = (value) => {
        //values of Picker items are unique devices .LOCATIONs
        const devices = this.props.lightDevices.filter((device) => device.headers.LOCATION === value);
        console.log('devices', devices);
        const device = devices[0];
        this.setState({
            pickerSelectedValue: device.headers.LOCATION
        });
        this.setCurrentLightControl(device);
    };

    

    renderLightDevicePicker() {
        return (
            <Picker
                mode="dropdown"
                placeholder="Select Light to control"
                placeholderStyle={{color: "#2874F0"}}
                note={false}
                selectedValue={this.state.pickerSelectedValue}
                onValueChange={this.onLightSelectValue}
            >
                {this.props.lightDevices.map((device, i) => {
                    //console.log('device :', device);
                    return <Picker.Item label={device.description.device.friendlyName + ':' + device.headers.LOCATION}
                                        value={device.headers.LOCATION} key={i}/>
                    //return <Picker.Item label={"device.description.device.friendlyName"} value={"device.headers.USN"} />
                })}
            </Picker>
        );
    }
    
    renderCurrentLightControl() {
        // console.log('this.state.lightState', this.state.lightState);
        //this.getLightState();
        return (
            <React.Fragment>
                {this.renderLightDevicePicker()}
                
                <Card>
                    <Text
                        style={{
                            alignSelf: "center",
                            fontSize: 20
                        }}
                    >
                        {`Light is ${this.state.lightState ? "on" : "off"}`}
                    </Text>
                </Card>
                <Button block onPress={this.switchLight}>
                    <Text>Switch</Text>
                </Button>
            
            </React.Fragment>
        );
    }
    
    render() {
        console.log("light hub render");
        // console.log(this.state.lightState);
        return (
            <React.Fragment>
                {this.renderCurrentLightControl()}
            </React.Fragment>
        );
    }
}

AppRegistry.registerComponent("UPnPtest2", () => LightControlHub);
