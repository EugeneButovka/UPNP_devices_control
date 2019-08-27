import React from "react";
import {AppRegistry} from "react-native";
import {Text, Button, Card, Picker, Icon, Item} from "native-base";
import playerControl from "../utilites/playerControl";


export default class PlayerControlHub extends React.Component {
    state = {
        currentPlayerControl: null,

        pickerSelectedValue: null,
    };
    
    constructor(props) {
        super(props);
        
        this.state = {
            currentPlayerControl: null,

            pickerSelectedValue: null,

        };
    }
    
    getDeviceNetworkAddress(device) {
        //console.log('try get device network address', device);
        const str = device.headers.LOCATION.match(/^(http|https)[\s\S]+(?=\/)/i)[0];
        console.log('LOCATION', str);
        return str;
    }
    
    setCurrentPlayerControl = (device) => {
        this.setState({
            currentPlayerControl: new playerControl(this.getDeviceNetworkAddress(device))
        });
    };
    
    
    gotoNextTrack = () => {
        this.state.currentPlayerControl.nextTrack();
    };
    
    onPlayerSelectValue = (value) => {
        //values of Picker items are unique devices .LOCATIONs
        const devices = this.props.playerDevices.filter((device) => device.headers.LOCATION === value);
        console.log('devices', devices);
        console.log('devices', devices);
        const device = devices[0];
        this.setState({
            pickerSelectedValue: device.headers.LOCATION
        });
        this.setCurrentPlayerControl(device);
    };
    
    
    
    renderPlayerDevicePicker() {
        return (
            <Picker
                mode="dropdown"
                placeholder="Select Player to control"
                placeholderStyle={{color: "#2874F0"}}
                note={false}
                selectedValue={this.state.pickerSelectedValue}
                onValueChange={this.onPlayerSelectValue}
                style={{marginTop: "20%", marginBottom: '10%'}}
            >
                {this.props.playerDevices.map((device, i) => {
                    //console.log('device :', device);
                    return <Picker.Item label={device.description.device.friendlyName + ':' + device.headers.LOCATION}
                                        value={device.headers.LOCATION} key={i}/>
                    //return <Picker.Item label={"device.description.device.friendlyName"} value={"device.headers.USN"} />
                })}
            </Picker>
        );
    }
    

    
    
    renderPlayerControl() {
        return (
            <React.Fragment>
                {this.renderPlayerDevicePicker()}
                <Card>
                    <Text
                        style={{
                            alignSelf: "center",
                            fontSize: 20
                        }}
                    >
                        {"next track in upnp player"}
                    </Text>
                </Card>
                <Button block onPress={this.gotoNextTrack}>
                    <Text>Next</Text>
                </Button>
            </React.Fragment>
        );
    }
    
    render() {
        console.log("player hub render");
        return (
            <React.Fragment>
                {this.renderPlayerControl()}
            </React.Fragment>
        );
    }
}

AppRegistry.registerComponent("UPnPtest2", () => PlayerControlHub);
