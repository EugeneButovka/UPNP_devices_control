import React from 'react';
import {AppRegistry} from 'react-native';
import {
    Text,
    Button,
    Card,
} from "native-base";
//import upnp from '../utilites/upnpUtils';

/*class LightService {
    soap = '';
    
    constructor() {
        soap += '<?xml version="1.0" encoding="utf-8"?>';
        soap += '<s:Envelope';
        soap += '  s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"';
        soap += '  xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">';
        soap += '  <s:Body>';
        soap += '          <u:SetTarget xmlns:u="urn:schemas-upnp-org:service:SwitchPower:1">';
        soap += '               <newTargetValue>1</newTargetValue>';
        soap += '          </u:SetTarget>';
        soap += '  </s:Body>';
        soap += '</s:Envelope>';
    }
    
    params = {
        //'url': 'http://192.168.1.149:60953/DimmableLight/SwitchPower.0001/control',
        'url': 'http://192.168.1.149:60953/_urn-upnp-org-serviceId-SwitchPower.0001_control',
        'soap': soap
    };
    
    turnOnLight() {
        upnp.invokeAction(params, (err, obj, xml, res) => {
            if(err) {
                console.log('[ERROR]');
                console.dir(err);
            } else {
                if(res['statusCode'] === 200) {
                    console.log('[SUCCESS]');
                } else {
                    console.log('[ERROR]');
                }
                console.log('----------------------------------');
                console.log(JSON.stringify(obj, null, '  '))
            }
        });
    };
    turnOffLight() {};

}*/


export default class DeviceControl extends React.Component {
    state = {};
    
    //LightServiceLightService
    
    constructor(props) {
        super(props);
        this.state = {
            lightState: null
        };
    }
    
    componentDidMount() {
        this.getLightState();
    }
    
    getLightState = async () => {
        //-----
        let result = false;
        
        
        this.setState({
            lightState: result
        });
    };
    
    
    render() {
        console.log('device control render');
        console.log(this.state.lightState);
        return (
            <React.Fragment>
                <Card>
                    <Text style={{ alignSelf: "center", fontSize: 20 }}>{`Light is ${this.state.lightState ? 'on' : 'off'}`}</Text>
                </Card>
                <Button block>
                    <Text>Switch</Text>
                </Button>
            </React.Fragment>
        )
    }
}

AppRegistry.registerComponent('UPnPtest2', () => DeviceControl);
