import React from "react";
import { AppRegistry } from "react-native";
import { Text, Button, Card, Picker, Icon, Item } from "native-base";
import upnp from "../utilites/upnpUtils";

// import upnp from '../upnpUtils_bundle';

class LightService {
    networkAddress = "";
    switchControlSubAddress = "_urn-upnp-org-serviceId-SwitchPower.0001_control";

    constructor(networkAddress) {
        this.networkAddress = networkAddress;
    }

    setLightState(newState) {
        const soap = `<?xml version="1.0" encoding="utf-8"?>
            <s:Envelope
                s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"
                xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
                    <s:Body>
                        <u:SetTarget xmlns:u="urn:schemas-upnp-org:service:SwitchPower:1">
                            <newTargetValue>${newState}</newTargetValue>
                        </u:SetTarget>
                    </s:Body>
            </s:Envelope>
        `;

        const params = {
            // 'url': 'http://192.168.1.149:60953/DimmableLight/SwitchPower.0001/control',
            // url: "http://192.168.1.149:56419/_urn-upnp-org-serviceId-SwitchPower.0001_control",
            url: this.networkAddress + '/' + this.switchControlSubAddress,
            soap: soap
        };

        console.log('set light state, url: ', params.url)

        upnp.invokeAction(params, (err, obj, xml, res) => {
            if (err) {
                console.log("[ERROR]");
                console.dir(err);
            } else {
                if (res.statusCode === 200) {
                    console.log("[SUCCESS]");
                } else {
                    console.log("[ERROR]");
                }
                console.log("----------------------------------");
                // console.log(JSON.stringify(obj, null, '  '))
            }
        });
    }

    getLightState() {
        const soap = `<?xml version="1.0" encoding="utf-8"?>
            <s:Envelope
                s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"
                xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
                    <s:Body>
                        <u:GetTarget xmlns:u="urn:schemas-upnp-org:service:SwitchPower:1" />
                    </s:Body>
            </s:Envelope>
        `;

        const params = {
            url: this.networkAddress + '/' + this.switchControlSubAddress,
            soap: soap
        };

        // const invokeParams = this.params;

        return new Promise((resolve, reject) => {
            upnp.invokeAction(params, (err, obj, xml, res) => {
                if (err) {
                    console.log("[ERROR]");
                    console.dir(err);
                    reject(null);
                } else {
                    if (res.statusCode === 200) {
                        console.log("[SUCCESS]");
                        //console.log('light state', obj["s:Body"]["u:GetTargetResponse"]);
                        resolve(
                            !!parseInt(
                                obj["s:Body"]["u:GetTargetResponse"].newTargetValue
                            )
                        );
                    } else {
                        console.log("[ERROR]");
                        reject(null);
                    }
                    console.log("----------------------------------");
                    // console.log(JSON.stringify(obj, null, '  '))
                }
            });
        });
    }
}

class PlayerService {
    soap = "";

    params = {};

    constructor() {
        this.soap += '<?xml version="1.0" encoding="utf-8"?>';
        this.soap += "<s:Envelope";
        this.soap +=
            '  s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"';
        this.soap += '  xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">';
        this.soap += "  <s:Body>";
        this.soap +=
            '          <u:Next xmlns:u="urn:schemas-upnp-org:service:AVTransport:1">';
        this.soap += "               <InstanceID>0</InstanceID>";
        this.soap += "          </u:Next>";
        this.soap += "  </s:Body>";
        this.soap += "</s:Envelope>";

        this.params = {
            url:
                "http://192.168.1.149:1176/AVTransport/a1467806-f66a-2b56-9b3e-c00a7b7cbaa5/control.xml",
            soap: this.soap
        };
    }

    nextTrack() {
        upnp.invokeAction(this.params, (err, obj, xml, res) => {
            if (err) {
                console.log("[ERROR]");
                console.dir(err);
            } else {
                if (res.statusCode === 200) {
                    console.log("[SUCCESS]");
                } else {
                    console.log("[ERROR]");
                }
                console.log("----------------------------------");
                // console.log(JSON.stringify(obj, null, '  '))
            }
        });
    }
}

export default class DeviceControl extends React.Component {
    state = {

    currentLightControl: null,
    // currentLightDeviceNumber: null,
    lightState: null,

    lightDevices: ["1", "2", "3"],
    pickerSelectedValue: null,

    player: null

    };

    constructor(props) {
        super(props);

        this.player = new PlayerService();

        this.state = {
            currentLightControl: null,
            // currentLightDeviceNumber: null,
            lightState: null,
        
            lightDevices: [],//["1", "2", "3"],
            pickerSelectedValue: null,
        
            player: null
        };
    }

    componentDidMount() {
        //this.getLightState();
        this.discoverDevices();
    }

    getDeviceType(device) {
        //"urn:schemas-upnp-org:device:DimmableLight:1";
        
        const deviceTypeExpanded = device.description.device.deviceType
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
            currentLightControl: new LightService(this.getDeviceNetworkAddress(device))
        });
        this.getLightState();
    }

    switchLight = () => {
        const newLightState = !this.state.lightState;
        this.state.currentLightControl.setLightState(newLightState);
        this.setState({
            lightState: newLightState
        });
    };

    onLightSelectValue = (value) => {
        //values of Picer items are unique devices .LOCATIONs
        const devices = this.state.lightDevices.filter((device) => device.headers.LOCATION === value);
        console.log('devices', devices);
        const device = devices[0];
        this.setState({
            pickerSelectedValue:device.headers.LOCATION
        });
        this.setCurrentLightControl(device);
    }

    gotoNextTrack = () => {
        this.player.nextTrack();
    };

    discoverDevices = () => {
        // Set an event listener for 'added' event
        upnp.on("added", device => {
            // This callback function will be called whenever an device was added.
            const name = device.description.device.friendlyName;
            const addr = device.address;
            console.log(`Added ${  name  } (${  addr  })`);

            if (this.isLightDevice(device)){
                console.log('found light device');
                this.setState({lightDevices: [...this.state.lightDevices,device]});
                //console.log('light devices list', this.state.lightDevices);
                //if no light device is in Picker => first discovered light device, set it to Picker
                if (this.state.pickerSelectedValue === null) {
                    this.setState({
                        pickerSelectedValue:device.headers.LOCATION
                    });
                    this.setCurrentLightControl(device);
                }
            }                
        });


        // Set an event listener for 'deleted' event
        upnp.on("deleted", device => {
            //TODO: add deletion of devices from local arrays
            // This callback function will be called whenever an device was deleted.
            const name = device.description.device.friendlyName;
            const addr = device.address;
            console.log(`Deleted ${  name  } (${  addr  })`);
        });


        upnp.on("error", err => {console.log('err', err)});

        // Start the discovery process
        upnp.startDiscovery();
    };

    renderLightDevicePicker() {
        //console.log('lightDevices', this.lightDevices);
        //console.log('this.lightDevices', this.lightDevices);
        return (
            <Picker
              mode="dropdown"
              placeholder="Select Light to control"
              placeholderStyle={{ color: "#2874F0" }}
              note={false}
               selectedValue={this.state.pickerSelectedValue}
               onValueChange={this.onLightSelectValue}
            >
               {this.state.lightDevices.map((device, i) => {
                    //console.log('device :', device);
                    return <Picker.Item label={device.description.device.friendlyName+':'+device.headers.LOCATION} value={device.headers.LOCATION} key={i} />
                    //return <Picker.Item label={"device.description.device.friendlyName"} value={"device.headers.USN"} />
               })}
            </Picker>
        );
    }

               /* */
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

    renderPlayerControl() {
        return (
          <React.Fragment>
            <Card style={{ marginTop: "20%" }}>
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
        console.log("device control render");
        // console.log(this.state.lightState);
        return (
          <React.Fragment>
            {this.renderCurrentLightControl()}
            {this.renderPlayerControl()}
          </React.Fragment>
        );
    }
}

AppRegistry.registerComponent("UPnPtest2", () => DeviceControl);
