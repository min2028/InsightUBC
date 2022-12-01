// Course fields and variables
const departmentCode_textInput = document.getElementById("deptName");
let course = document.getElementById("deptName").value;
document.getElementById("findCourseButton").addEventListener("click", handleFindCoursesButton)
const coursesError_div = document.getElementById("coursesErrorDiv");
const coursesInfo_table = document.getElementById("coursesTable");

// Room fields and variables
const roomName_textInput = document.getElementById("roomName");
let room = document.getElementById("roomName").value;
document.getElementById("findRoomButton").addEventListener("click", handleFindRoomsButton);
const roomsError_div = document.getElementById("roomsErrorDiv");
const roomsInfo_table = document.getElementById("roomsTable");

function handleFindCoursesButton() {
	console.log("Find courses clicked!");
	clearFields();
	getCourses(departmentCode_textInput.value.toLowerCase())
		.then((response) => response.json())
		.then((data) => {
			console.log(data);
			if ("error" in data) {
				showError(data.error);
			} else if ("result" in data && Array.isArray(data.result)) {
				if (!data.result.length) {
					showError("No courses available for the specified department code.", coursesError_div);
				} else {
					showCourseTable(data.result, coursesInfo_table);
				}
			} else {
				console.error(data);
			}
		}).catch((error) => {
		showError("Server connection error.", coursesError_div);
	});
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

function handleFindRoomsButton() {
	console.log("Find Rooms clicked!");
	clearFields();
	getRooms(roomName_textInput.value.toUpperCase())
		.then((response) => response.json())
		.then((data) => {
			console.log(data);
			if ("error" in data) {
				showError(data.error, roomsError_div);
			} else if ("result" in data && Array.isArray(data.result)) {
				if (!data.result.length) {
					showError("No room exist for the specified Room Name.", roomsError_div);
				} else {
					showRoomTable(data.result, roomsInfo_table);
				}
			} else {
				console.error(data);
			}
		}).catch((error) => {
		showError("Server connection error.", roomsError_div);
	});
}

function showRoomTable(data, table) {
	let thead = table.createTHead();
	let row = thead.insertRow();
	for (let field of ["Full name", "Address", "Number of seats", "Type of room", "Furniture"]) {
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

function getRooms(roomName) {
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
	return fetch('./query', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(json),
	});
}

function showError(errorText, errorDiv) {
	let errorTitle = document.createElement("h5");
	let errorDesc = document.createElement("p");
	errorTitle.textContent = "Error"
	errorDesc.textContent = errorText;
	errorDiv.append(errorTitle, errorDesc);
}

function clearFields() {
	coursesError_div.innerText = "";
	coursesInfo_table.innerHTML = null;
	roomsError_div.innerText = "";
	roomsInfo_table.innerHTML = null;
}
