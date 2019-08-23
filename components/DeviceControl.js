import React from "react";
import { AppRegistry } from "react-native";
import { Text, Button, Card } from "native-base";
import upnp from "../utilites/upnpUtils";

// import upnp from '../upnpUtils_bundle';

class LightService {
    soap = "";

    params = {};

    setLightState(newState) {
        this.soap = `<?xml version="1.0" encoding="utf-8"?>
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

        this.params = {
            // 'url': 'http://192.168.1.149:60953/DimmableLight/SwitchPower.0001/control',
            url:
                "http://192.168.1.149:56419/_urn-upnp-org-serviceId-SwitchPower.0001_control",
            soap: this.soap
        };

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

    getLightState() {
        this.soap = `<?xml version="1.0" encoding="utf-8"?>
            <s:Envelope
                s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"
                xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
                    <s:Body>
                        <u:GetTarget xmlns:u="urn:schemas-upnp-org:service:SwitchPower:1" />
                    </s:Body>
            </s:Envelope>
        `;

        this.params = {
            // 'url': 'http://192.168.1.149:60953/DimmableLight/SwitchPower.0001/control',
            url:
                "http://192.168.1.149:56419/_urn-upnp-org-serviceId-SwitchPower.0001_control",
            soap: this.soap
        };

        // const invokeParams = this.params;

        return new Promise((resolve, reject) => {
            upnp.invokeAction(this.params, (err, obj, xml, res) => {
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

    lightControl = null;

    player = null;

    constructor(props) {
        super(props);

        this.lightControl = new LightService();
        this.player = new PlayerService();

        this.state = {
            lightState: null
        };
    }

    componentDidMount() {
        // this.getLightState();
        this.discoverDevices();
    }

    getLightState = async () => {
        const res = await this.lightControl.getLightState();
        console.log("light state is now: ", res);

        this.setState({
            lightState: res
        });
    };

    switchLight = () => {
        const newLightState = !this.state.lightState;
        this.lightControl.setLightState(newLightState);
        this.setState({
            lightState: newLightState
        });
    };

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
            console.log("Device ", device);
        });

        // Set an event listener for 'deleted' event
        upnp.on("deleted", device => {
            // This callback function will be called whenever an device was deleted.
            const name = device.description.device.friendlyName;
            const addr = device.address;
            console.log(`Deleted ${  name  } (${  addr  })`);
        });

        // Start the discovery process
        upnp.startDiscovery();
    };

    renderLightControl() {
        // console.log('this.state.lightState', this.state.lightState);
        return (
          <>
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
          </>
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
            {this.renderLightControl()}
            {this.renderPlayerControl()}
          </>
        );
    }
}

AppRegistry.registerComponent("UPnPtest2", () => DeviceControl);
