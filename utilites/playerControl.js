import upnp from "./upnpUtils";

export default class playerControl {
	networkAddress = "";
	controlSubAddress = ""; //AVTransport service sub address
	
	constructor(networkAddress, controlSubAddress) {
		this.networkAddress = networkAddress;
		this.controlSubAddress = controlSubAddress;
	}
	
	
	pauseTrack() {
		this.performPlaybackControlAction("Pause");
	}
	
	playTrack() {
		const param = `<Speed>1</Speed>`;
		
		this.performPlaybackControlAction("Play", param);
	}
	
	
	nextTrack() {
		this.performPlaybackControlAction("Next");
	}
	
	setAVTransportURI(uri) {
		const param = `<CurrentURI>${uri}</CurrentURI>
                       <CurrentURIMetaData />`;
		
		this.performPlaybackControlAction("SetAVTransportURI", param);
	}
	
	performPlaybackControlAction(action, parameter = '') {
		const soap = `<?xml version="1.0" encoding="utf-8"?>
            <s:Envelope
                s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"
                xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
                    <s:Body>
                        <u:${action} xmlns:u="urn:schemas-upnp-org:service:AVTransport:1">
                            <InstanceID>0</InstanceID>
                            ${parameter}
                        </u:${action}>
                    </s:Body>
            </s:Envelope>
        `;
		
		const params = {
			url: this.networkAddress + '/' + this.controlSubAddress,
			soap: soap
		};
		
		console.log('action params', JSON.stringify(params));
		
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