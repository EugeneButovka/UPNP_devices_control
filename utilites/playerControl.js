import upnp from "./upnpUtils";

export default class playerControl {
	networkAddress = "";
	controlSubAddress = ""; //AVTransport service sub address
	
	constructor(networkAddress, servicesUrls) {
		this.networkAddress = networkAddress;
		this.servicesUrls = servicesUrls;
	}
	
	
	pauseTrack() {
		this.performPlayerControlAction("Pause");
	}
	
	playTrack() {
		const param = `<Speed>1</Speed>`;
		
		this.performPlayerControlAction("Play", param);
	}
	
	
	nextTrack() {
		this.performPlayerControlAction("Next");
	}
	
	setAVTransportURI(uri) {
		const param = `<CurrentURI>${uri}</CurrentURI>
                       <CurrentURIMetaData />`;
		
		this.performPlayerControlAction("SetAVTransportURI", param);
	}
	
	getTransportInfo() {
		this.performPlayerControlAction("GetTransportInfo");
	}
	
	getVolume() {
		const param = `<Channel>Master</Channel>`;
		
		this.performPlayerControlAction("GetVolume", param, "RenderingControl");
	}
	
	performPlayerControlAction(action, parameter = '', service = "AVTransport") {
		const soap = `<?xml version="1.0" encoding="utf-8"?>
            <s:Envelope
                s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"
                xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
                    <s:Body>
                        <u:${action} xmlns:u="urn:schemas-upnp-org:service:${service}:1">
                            <InstanceID>0</InstanceID>
                            ${parameter}
                        </u:${action}>
                    </s:Body>
            </s:Envelope>
        `;
		
		const params = {
			url: this.networkAddress + '/' + this.servicesUrls[service],
			soap: soap
		};
		
		console.log('action params', JSON.stringify(params));
		
		upnp.invokeAction(params, (err, obj, xml, res) => {
			if (err) {
				console.log("[ERROR]");
				console.dir(err);
				return err;
			} else {
				if (res.statusCode === 200) {
					console.log("[SUCCESS]");
				} else {
					console.log("[ERROR]");
				}
				console.log("----------------------------------");
				console.log("response object: ",JSON.stringify(obj));
				return obj;
			}
		});
	}
}