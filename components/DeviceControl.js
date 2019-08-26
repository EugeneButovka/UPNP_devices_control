import React from "react";
import { AppRegistry } from "react-native";
import { Text, Button, Card, Picker, Icon } from "native-base";
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
    state = {};

    currentLightControl = null;
    currentLightDeviceNumber = null;

    lightDevices = [];

    player = null;

    constructor(props) {
        super(props);

        //this.currentLightControl = new LightService();
        this.player = new PlayerService();

        this.state = {
            lightState: null
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
        );;
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
        return (this.getDeviceType(device) == 'DimmableLight');
    }

    getLightState = async () => {
        const res = await this.currentLightControl.getLightState();
        console.log("light state is now: ", res);

        this.setState({
            lightState: res
        });
    };

    switchLight = () => {
        const newLightState = !this.state.lightState;
        this.currentLightControl.setLightState(newLightState);
        this.setState({
            lightState: newLightState
        });
    };

    onLightSelect = (lightName, i) => {
        console.log(lightName, i);
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
            //console.log("Device ", device);

            //this.getDeviceType(device);
            //this.getDeviceNetworkAddress(device);

            if (this.isLightDevice(device)){
                console.log('found light device');
                this.lightDevices.push(device);
                if (this.currentLightDeviceNumber == null) {
                    this.currentLightControl = new LightService(this.getDeviceNetworkAddress(device));
                    currentLightDeviceNumber = this.lightDevices.length - 1;
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
        return (
            // <Picker
            //   mode="dropdown"
            //   placeholder="Select One"
            //   placeholderStyle={{ color: "#2874F0" }}
            //   note={false}
            // //   selectedValue={"none available"}
            // //   onValueChange={this.onLightSelect}
            // >
            //    {/* {this.lightDevices.map((device, i) => (<Picker.Item label={device.description.device.friendlyName} value={i} />))} */}
            //    {/* <Picker.Item label={"friendlyName"} value={"12"} />
            //    <Picker.Item label={"friendlyName2"} value={"13"} />  */}
            //    <Picker.Item label={"friendlyName2"} value="0" />
            // </Picker>

<Picker
mode="dropdown"
iosIcon={<Icon name="arrow-down" />}
placeholder="Select your SIM"
placeholderStyle={{ color: "#bfc6ea" }}
placeholderIconColor="#007aff"
style={{ width: undefined }}
>
<Picker.Item label="Wallet" value="key0" />
<Picker.Item label="ATM Card" value="key1" />
<Picker.Item label="Debit Card" value="key2" />
<Picker.Item label="Credit Card" value="key3" />
<Picker.Item label="Net Banking" value="key4" />
{/* <Picker.Item label={"friendlyName2"} value="0" /> */}
{this.lightDevices.map((device, i) => (<Picker.Item label={device.description.device.friendlyName} value="1" />))}
</Picker>
        );
    }

    renderCurrentLightControl() {
        // console.log('this.state.lightState', this.state.lightState);
        return (
          <React.Fragment>
            
            {this.renderLightDevicePicker()}
            {/* <Picker
              mode="dropdown"
              iosIcon={<Icon name="arrow-down" />}
              placeholder="Select your SIM"
              placeholderStyle={{ color: "#bfc6ea" }}
              placeholderIconColor="#007aff"
              style={{ width: undefined }}
            >
              <Picker.Item label="Wallet" value="key0" />
              <Picker.Item label="ATM Card" value="key1" />
              <Picker.Item label="Debit Card" value="key2" />
              <Picker.Item label="Credit Card" value="key3" />
              <Picker.Item label="Net Banking" value="key4" />
            </Picker> */}
            
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
          <>
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
          </>
        );
    }

    render() {
        console.log("device control render");
        // console.log(this.state.lightState);
        return (
          <>
            {this.renderCurrentLightControl()}
            {this.renderPlayerControl()}
          </>
        );
    }
}

AppRegistry.registerComponent("UPnPtest2", () => DeviceControl);
