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
		const str = device.headers.LOCATION.match(/^(?:(http[s]?|ftp[s]):\/\/)?([^:\/\s]+)(:[0-9]+)/i)[0];//<-new ok, OLD buggy: (/^(http|https)[\s\S]+(?=\/)/i)[0];
		//const port = device.headers.LOCATION.match(/(?:\:\d{2,4})/ig)[0];
		
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
				if (this.getServiceType(service) === 'AVTransport') {
					AVTransportControlUrl = service.controlURL.replace(/^\//, '');// remove starting '/' if present
					console.log('service AVTransportControlUrl', AVTransportControlUrl);
				}
				
			}
		);
		//console.log('AVTransportControlUrl', AVTransportControlUrl);
		return AVTransportControlUrl;
	}
	
	getRenderingControlUrl(device) {
		//"urn:schemas-upnp-org:service:AVTransport:1";
		
		const serviceListArray = device.description.device.serviceList.service;
		let RenderingControlUrl = null;
		serviceListArray.forEach(service => {
				//console.log('service', service);
				if (this.getServiceType(service) === 'RenderingControl') {
					RenderingControlUrl = service.controlURL.replace(/^\//, '');// remove starting '/' if present
					console.log('service RenderingControlURL', RenderingControlUrl);
				}
				
			}
		);
		//console.log('AVTransportControlUrl', AVTransportControlUrl);
		return RenderingControlUrl;
	}
	
	setCurrentPlayerControl = (device) => {
		const playerControlNetworkAddress = this.getDeviceNetworkAddress(device);
		const playerAVTransportControlSubAddress = this.getAVTransportControlUrl(device);
		const playerRenderingControlSubAddress = this.getRenderingControlUrl(device);
		
		const servicesUrls = {
			"AVTransport": playerAVTransportControlSubAddress,
			"RenderingControl": playerRenderingControlSubAddress
		};
		
		this.setState({
			currentPlayerControl: new playerControl(playerControlNetworkAddress, servicesUrls)
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
	
	getPlayerInfo = () => {
		this.state.currentPlayerControl.getTransportInfo();
	};
	
	getPlayerVolume = () => {
		this.state.currentPlayerControl.getVolume();
	};
	
	onPlayerSelectValue = (value) => {
		//values of Picker items are unique devices .LOCATIONs
		const devices = this.props.playerDevices.filter((device) => device.headers.LOCATION === value);
		console.log('devices', JSON.stringify(devices));
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
				<React.Fragment>
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
					<View>
						<Button onPress={this.getPlayerInfo}>
							<Text>Info</Text>
						</Button>
						<Button onPress={this.getPlayerVolume}>
							<Text>Volume</Text>
						</Button>
					</View>
				</React.Fragment>
			);
		else
			return (
				<React.Fragment>
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
				<View>
					<Button disabled>
						<Text>Info</Text>
					</Button>
					<Button disabled>
						<Text>Volume</Text>
					</Button>
				</View>
				</React.Fragment>
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
