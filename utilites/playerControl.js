import upnp from "./upnpUtils";

export default class playerControl {
    networkAddress = "";
    switchControlSubAddress = "AVTransport/a1467806-f66a-2b56-9b3e-c00a7b7cbaa5/control.xml";
    
    constructor(networkAddress) {
        this.networkAddress = networkAddress;
    }
    
    
    nextTrack() {
        const soap = `<?xml version="1.0" encoding="utf-8"?>
            <s:Envelope
                s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"
                xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
                    <s:Body>
                        <u:Next xmlns:u="urn:schemas-upnp-org:service:AVTransport:1">
                            <InstanceID>0</InstanceID>
                        </u:Next>
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
}