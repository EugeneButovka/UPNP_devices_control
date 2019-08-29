import React from "react";
import {AppRegistry, View} from "react-native";
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
	
	getServiceType(service) {
		const serviceType = service.serviceType.substring(
			service.serviceType.lastIndexOf("service:") + "service:".length,
			service.serviceType.lastIndexOf(":")
		);
		return serviceType;
	}
	
	getAVTransportControlUrl(device) {
		//"urn:schemas-upnp-org:service:AVTransport:1";
		
		const serviceListArray = device.description.device.serviceList.service;
		let AVTransportControlUrl = null;
		serviceListArray.forEach(service => {
				if (this.getServiceType(service) === 'AVTransport') AVTransportControlUrl = service.controlURL.replace(/^\//, ''); // remove starting '/' if present
				//console.log('service', service);
			}
		);
		
		//console.log('AVTransportControlUrl', AVTransportControlUrl);
		return AVTransportControlUrl;
	}
	
	setCurrentPlayerControl = (device) => {
		const playerControlNetworkAddress = this.getDeviceNetworkAddress(device);
		const playerAVTransportControlSubAddress = this.getAVTransportControlUrl(device);
		
		this.setState({
			currentPlayerControl: new playerControl(playerControlNetworkAddress, playerAVTransportControlSubAddress)
		});
	};
	
	
	pauseTrack = () => {
		this.state.currentPlayerControl.pauseTrack();
	};
	
	playTrack = () => {
		this.state.currentPlayerControl.playTrack();
	};
	
	nextTrack = () => {
		this.state.currentPlayerControl.nextTrack();
	};
	
	sendTrack = () => {
		this.state.currentPlayerControl.setAVTransportURI('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
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
	
	renderControlButtons = () => {
		if (this.state.currentPlayerControl !== null)
			return (
				<View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
					<Button onPress={this.pauseTrack}>
						<Text>Pause</Text>
					</Button>
					<Button onPress={this.playTrack}>
						<Text>Play</Text>
					</Button>
					<Button onPress={this.nextTrack}>
						<Text>Next</Text>
					</Button>
					<Button onPress={this.sendTrack}>
						<Text>SendTrack</Text>
					</Button>
				</View>
			);
		else
			return (
				<View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
					<Button disabled>
						<Text>Pause</Text>
					</Button>
					<Button disabled>
						<Text>Play</Text>
					</Button>
					<Button disabled>
						<Text>Next</Text>
					</Button>
					<Button disabled>
						<Text>SendTrack</Text>
					</Button>
				</View>
			);
	};
	
	renderPlayerControl() {
		return (
			<React.Fragment>
				<Card>
					<Text
						style={{
							alignSelf: "center",
							fontSize: 20
						}}
					>
						{"upnp player contrlol"}
					</Text>
				</Card>
				{this.renderControlButtons()}
			</React.Fragment>
		);
	}
	
	render() {
		console.log("player hub render");
		return (
			<React.Fragment>
				{this.renderPlayerDevicePicker()}
				{this.renderPlayerControl()}
			</React.Fragment>
		);
	}
}

AppRegistry.registerComponent("UPnPtest2", () => PlayerControlHub);
