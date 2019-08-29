import React from "react";
import {AppRegistry} from "react-native";
import {Text, Button, Card, Picker, Icon, Item} from "native-base";
import upnp from "../utilites/upnpUtils";

import LightControlHub from "./LightControlHub";
import PlayerControlHub from "./PlayerControlHub";



export default class UpnpControlHub extends React.Component {
    state = {};
    
    constructor(props) {
        super(props);
        
        this.state = {
            discoveredDevices: [],
            lightDevices: [],
            playerDevices: []
        };
    }
    
    componentDidMount() {
        //this.getLightState();
        this.discoverDevices();
    }
    
    getDeviceType(device) {
        //"urn:schemas-upnp-org:device:DimmableLight:1";
        
        const deviceTypeExpanded = device.description.device.deviceType;
        const deviceType = deviceTypeExpanded.substring(
            deviceTypeExpanded.lastIndexOf("device:") + "device:".length,
            deviceTypeExpanded.lastIndexOf(":")
        );
        console.log('deviceType', deviceType);
        return deviceType;
    }
    
    getDeviceNetworkAddress(device) {
        //console.log('try get device network address', device);
        const str = device.headers.LOCATION.match(/^(http|https)[\s\S]+(?=\/)/i)[0];
        console.log('LOCATION', str);
        return str;
    }
    
    isLightDevice = (device) => {
        return (this.getDeviceType(device) === 'DimmableLight');
    };
    
    isMediaRendererDevice = (device) => {
        return (this.getDeviceType(device) === 'MediaRenderer');
    };
    
    discoverDevices = () => {
        // Set an event listener for 'added' event
        upnp.on("added", device => {
            // This callback function will be called whenever an device was added.
            const name = device.description.device.friendlyName;
            const addr = device.address;
            console.log(`Added ${name} (${addr})`);
            
            this.setState({discoveredDevices: [...this.state.discoveredDevices, device]});
            if (this.isLightDevice(device)) this.setState({lightDevices: [...this.state.lightDevices, device]});
            if (this.isMediaRendererDevice(device)) this.setState({playerDevices: [...this.state.playerDevices, device]});
        });
        
        
        // Set an event listener for 'deleted' event
        upnp.on("deleted", device => {
            //TODO: add deletion of devices from local arrays
            // This callback function will be called whenever an device was deleted.
            const name = device.description.device.friendlyName;
            const addr = device.address;
            console.log(`Deleted ${name} (${addr})`);
    
            this.setState({
                discoveredDevices: this.state.discoveredDevices.filter(
                    item =>
                        item.headers.LOCATION !== device.headers.LOCATION &&
                        item.description.device.friendlyName !== device.description.device.friendlyName
                )});
	        this.setState({lightDevices: []});
	        this.setState({playerDevices: []});
	
	        this.state.discoveredDevices.forEach((device) => {
		        if (this.isLightDevice(device)) this.setState({lightDevices: [...this.state.lightDevices, device]});
		        if (this.isMediaRendererDevice(device)) this.setState({playerDevices: [...this.state.playerDevices, device]});
	        });
        });
        
        
        upnp.on("error", err => {
            console.log('err', err)
        });
        
        // Start the discovery process
        upnp.startDiscovery();
    };
    
    
    
    render() {
        console.log("device control render");
        
        return (
            <React.Fragment>
                <LightControlHub lightDevices={this.state.lightDevices}/>
                <PlayerControlHub playerDevices={this.state.playerDevices}/>
            </React.Fragment>
        );
    }
}

AppRegistry.registerComponent("UPnPtest2", () => UpnpControlHub);
