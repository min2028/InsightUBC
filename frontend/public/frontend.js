//import http from "http";

let room = document.getElementById("roomName").value;
let course = document.getElementById("deptName").value;
document.getElementById("click-me-button").addEventListener("click", handleClickMe);
document.getElementById("findCourseButton").addEventListener("click", handleFindCoursesButton)
document.getElementById("findRoomButton").addEventListener("click", getRooms)

const roomName_textInput = document.getElementById("roomName");
const departmentCode_textInput = document.getElementById("deptName");
const coursesError_text = document.getElementById("coursesErrorText");
const coursesInfo_table = document.getElementById("coursesTable");

function handleClickMe() {
	alert("Button Clicked!");
}

function handleFindCoursesButton() {
	console.log("Find courses clicked!");
	clearFields();
	getCourses(departmentCode_textInput.value.toLowerCase())
		.then((response) => response.json())
		.then((data)=> {
			console.log(data);
			if ("error" in data) {
				showError(data.error);
			} else if ("result" in data && Array.isArray(data.result)) {
				if (!data.result.length) {
					showError("No courses available for the specified department code.");
				} else {
					showCourseTable(data.result, coursesInfo_table);
				}
			} else {
				console.error(data);
			}
		}).catch((error) => {
			showError("Server connection error.");
		});
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
	for (let field of ["Department", "Course ID", "Course name", "Total number of sections offered"]) {
		console.log(field);
		let th = document.createElement("th");
		let text = document.createTextNode(field);
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
	// let xhr = new XMLHttpRequest();
	// xhr.open("POST", "./query", false);
	// xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	const query = {
		WHERE: {
			IS: {
				sections_dept: departmentCode
			}
		},
		OPTIONS: {
			COLUMNS: [
				"sections_dept",
				"sections_id",
				"sections_title",
				"countSections"
			],
			ORDER: {
				dir: "DOWN",
				keys: [
					"countSections"
				]
			}
		},
		TRANSFORMATIONS: {
			GROUP: [
				"sections_dept",
				"sections_id",
				"sections_title"
			],
			APPLY: [
				{
					countSections: {
						COUNT: "sections_uuid"
					}
				}
			]
		}
	}
	return fetch('./query', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(query),
	});
	// const response = await fetch()
	// // xhr.send(JSON.stringify(query));
	// return JSON.parse(xhr.responseText);
}

function getRooms(roomName) {
	let xhr = new XMLHttpRequest();
	xhr.open("POST", "./query");
	xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
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
