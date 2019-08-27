import upnp from "./upnpUtils";

export default class lightControl {
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
            url: this.networkAddress + '/' + this.switchControlSubAddress,
            soap: soap
        };
        
        console.log('set light state, url: ', params.url);
        
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