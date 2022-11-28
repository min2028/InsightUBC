import http from "http";
import {IGeoLocation} from "../../src/model/Dataset/RoomDataset/RDataset";

document.getElementById("click-me-button").addEventListener("click", handleClickMe);

function handleClickMe() {
	alert("Button Clicked!");
}

function getCourses(departmentCode) {
	return;
}

function sendPOSTRequest (body) {
	const urlEncodedAddress = encodeURIComponent(address);
	const url = `${geoURIBase}/${teamNumber}/${urlEncodedAddress}`;
	return new Promise((resolve, reject) => {
		http.get(url, (res) => {
			let contents = "";
			res.on("data", function (content) {
				contents += content;
				let result;
				try {
					result = JSON.parse(contents);
				} catch (e) {
					return reject("Invalid JSON geolocation");
				}
				if (result.error || !result.lon || !result.lat || (isNaN(result.lon) || isNaN(result.lat))) {
					return reject(result.error ?? "Invalid Longitude or Latitude in geolocation");
				} else {
					const geoLocation = {lat: result.lat, lon: result.lon};
					return resolve(geoLocation);
				}
			});
		}).on("error", function () {
			return reject("Geolocation server request error");
		});
	});
}
