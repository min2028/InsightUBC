//import http from "http";

let room = document.getElementById("roomName").value;
let course = document.getElementById("deptName").value;
document.getElementById("click-me-button").addEventListener("click", handleClickMe);
document.getElementById("findCourseButton").addEventListener("click", handleFindCourseButton)
document.getElementById("findRoomButton").addEventListener("click", getRooms)

const roomName_textInput = document.getElementById("roomName");
const departmentCode_textInput = document.getElementById("roomName");
const coursesError_text = document.getElementById("coursesErrorText");
const coursesInfo_table = document.getElementById("coursesTable");

function handleClickMe() {
	alert("Button Clicked!");
}

function handleFindCourseButton() {
	console.log("Find course clicked!");
	clearFields();
	const data = getCourses("DMP");
	console.log("Server Response:"); //{result: []} {error: "errorText"}
	console.log(data);
	if ("error" in data) {
		showError(data.error);
	} else if ("result" in data && Array.isArray(data.result)) {
		showCourseTable(data, coursesInfo_table);
	}
}

function showError(errorText) {
	coursesError_text.innerText = errorText;
}

function clearFields() {
	coursesError_text.innerText = "";
	coursesInfo_table.innerHTML = null;

}

function showCourseTable(data, table) {
	let thead = table.createTHead();
	let row = thead.insertRow();
	for (let key of data) {
		let th = document.createElement("th");
		let text = document.createTextNode(key);
		th.appendChild(text);
		row.appendChild(th);
	}
	for (let course of data) {
		let row = table.insertRow();
		for (let field in course) {
			let cell = row.insertCell();
			let text = document.createTextNode(course[field]);
			cell.appendChild(text);
		}
	}
}

function getCourses(departmentCode) {
	let xhr = new XMLHttpRequest();
	xhr.open("POST", "./query");
	let json = {
		"WHERE": {
			"IS": {
				"sections_dept": departmentCode
			}
		},
		"OPTIONS": {
			"COLUMNS": [
				"sections_dept",
				"sections_id",
				"sections_title",
				"countSections"
			],
			"ORDER": {
				"dir": "DOWN",
				"keys": [
					"countSections"
				]
			}
		},
		"TRANSFORMATIONS": {
			"GROUP": [
				"sections_dept",
				"sections_id",
				"sections_title"
			],
			"APPLY": [
				{
					"countSections": {
						"COUNT": "sections_uuid"
					}
				}
			]
		}
	}
	xhr.send(JSON.stringify(json));
	console.log(xhr);
	return xhr.responseText;
}

function getRooms(roomName) {
	let xhr = new XMLHttpRequest();
	xhr.open("POST", "./query");
	let json = {
		"WHERE": {
			"IS": {
				"rooms_name": roomName
			}
		},
		"OPTIONS": {
			"COLUMNS": [
				"rooms_fullname",
				"rooms_address",
				"rooms_seats",
				"rooms_type",
				"rooms_furniture"
			]
		}
	}
	xhr.send(JSON.stringify(json));
	return xhr.responseText;

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
