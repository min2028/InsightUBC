import * as fs from "fs-extra";
import chai, {expect} from "chai";
import chaiAsPromised from "chai-as-promised";
import {IDataset} from "../../../src/model/Dataset/IDataset";
import {IBuildingData, IGeoLocation, RDataset} from "../../../src/model/Dataset/RoomDataset/RDataset";
import {IRoomData, Room} from "../../../src/model/Dataset/RoomDataset/Room";
import JSZip from "jszip";
import path from "path";

chai.use(chaiAsPromised);

describe("[ RoomDataset.spec.ts ]", function () {
	let dataset: IDataset;
	const persistDirectory = "./data";
	const datasetContents = new Map<string, string>();
	let rDatasetParser: RDataset;
	let rooms: Room;

	const datasetsToLoad: {[key: string]: string} = {
		rooms: "./test/resources/archives/rooms/rooms.zip"
	};

	before(function () {
		for (const key of Object.keys(datasetsToLoad)) {
			const content = fs.readFileSync(datasetsToLoad[key]).toString("base64");
			datasetContents.set(key, content);
		}
	});

	after(function () {
		console.info("==========================================================\n");
	});

	beforeEach(function () {
		fs.removeSync(persistDirectory);
		rDatasetParser = new RDataset();
	});

	describe("RDataset test", function () {
		it("should checkNodeAttributes,true", function () {
			const name = "class";
			const value = "views-field views-field-field-building-code";
			const result: boolean = rDatasetParser.checkNodeAttributes([{
				name: "class",
				value: "views-field views-field-field-building-code"
			},
			{
				name: "id",
				value: "details"
			}
			], name, value);

			expect(result).to.be.true;
		});

		it("should checkNodeAttributes, false", function () {
			const name = "class";
			const value = "views-field views-field-field-building-code";
			const result: boolean = rDatasetParser.checkNodeAttributes([{
				name: "class",
				value: "views-field-field-building-code"
			}], name, value);
			expect(result).to.be.false;
		});

		it("should checkNodeAttributes, false", function () {
			const name = "class";
			const value = "views-field views-field-field-building-code";
			const result: boolean = rDatasetParser.checkNodeAttributes([{
				name: "id",
				value: "views-field views-field-field-building-code"
			}], name, value);
			expect(result).to.be.false;
		});

		it("should checkNodeAttributes, false", function () {
			const name = "class";
			const value = "views-field views-field-field-building-code";
			const result: boolean = rDatasetParser.checkNodeAttributes([{
				name: "id",
				value: "views-field views-field-field-building-code"
			}], name, value);
			expect(result).to.be.false;
		});

		it("should checkNodeAttributes, false", function () {
			const name = "class";
			const value = "views-field views-field-field-building-code";
			const result: boolean = rDatasetParser.checkNodeAttributes([
				{
					name: "id",
					value: "views-field views-field-field-building-code"
				},
				{
					name: "potato",
					value: "o | o"
				},
				{
					name: "class",
					value: "vies-field views-field-field-building-code"
				}
			], name, value);
			expect(result).to.be.false;
		});

		it("should checkNodeAttributes, true", function () {
			const name = "class";
			const value = "views-field views-field-field-building-code";
			const result: boolean = rDatasetParser.checkNodeAttributes([
				{
					name: "id",
					value: "views-field views-field-field-building-code"
				},
				{
					name: "potato",
					value: "o | o"
				},
				{
					name: "class",
					value: "views-field views-field-field-building-code"
				}
			], name, value);
			expect(result).to.be.true;
		});

		it("should read building code", function () {
			const result = rDatasetParser.readTextData([
				{
					nodeName: "#text",
					value: "\n            ACU          ",
					parentNode: "[Circules.5.childNodes.1.childNodes.3.childNodes.1.childNodes.3]",
					sourceCodeLocation: {
						startLine: 348,
						startCol: 75,
						startOffset: 48705,
						endLine: 349,
						endCol: 26,
						endOffset: 48731
					}
				},
				{
					nodeName: "#text",
					value: "\n            ALRD          ",
					parentNode: "[Nodes.1.childNodes.3.chil3]",
					sourceCodeLocation: {
						startLine: 360,
						startCol: 75,
						startOffset: 49713,
						endLine: 361,
						endCol: 27,
						endOffset: 49740
					}
				}
			]);
			expect(result).to.deep.equal("ACU");
		});

		it("parse room -> should return list of rooms", function () {
			let contents: string = fs.readFileSync("./test/resources/files/SRC.htm", "utf8");
			const buildingInfo = {
				fullname: "building1", shortname: "BLD", address: "CAMPUS", href: ""
			} as IBuildingData;
			const geoInfo = {lon: -14.52, lat: 24.5} as IGeoLocation;
			const results = Room.parseRoom(contents, buildingInfo, geoInfo);
			expect(results).to.have.length(3);
		});

		it("testing traverseHTML", function () {
			let contents: string = fs.readFileSync("./test/resources/files/FNH_tableOnly.json", "utf8");
			let instance: Room = new Room();
			const json = JSON.parse(contents);
			const results = instance.traverseJsonOfHTML(json);
			expect(results).to.have.length(6);
		});

		it("testing readLinkAndTextData", function () {
			let contents: any =
				[{
					nodeName: "#text",
					value: "          ",
					parentNode: "[Circular ~.c.1.childNodes.1.childNodes.1.childNodesdes.1]"
				},
				{
					nodeName: "a",
					tagName: "a",
					attrs: [
						{
							name: "href",
							value: "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/FNH-30"
						},
						{
							name: "title",
							value: "Room Details"
						}
					],
					namespaceURI: "http://www.w3.org/1999/xhtml",
					childNodes: [
						{
							nodeName: "#text",
							value: "30",
							parentNode: "[Circular ~.childNdNodes.1.childNodes.1]"
						}
					],
					parentNode: "[Circular ~..3.childNodes.1]"
				}];
			const results = rDatasetParser.readLinkAndTextData(contents);
			expect(results).to.deep.equal({
				text: "30",
				link: "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/FNH-30"
			});
		});

		// TODO: test error thrown
		it("testing readRoomNumberAndHref", function() {
			const content = {
				nodeName: "td",
				tagName: "td",
				attrs: [
					{
						name: "class",
						value: "views-field views-field-field-room-number"
					}
				],
				namespaceURI: "http://www.w3.org/1999/xhtml",
				childNodes: [
					{
						nodeName: "#text",
						value: "\n            ",
						parentNode: "[Circular ~.childNodes.2.chil]"
					},
					{
						nodeName: "a",
						tagName: "a",
						attrs: [
							{
								name: "href",
								value: "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/FNH-320"
							},
							{
								name: "title",
								value: "Room Details"
							}
						],
						namespaceURI: "http://www.w3.org/1999/xhtml",
						childNodes: [
							{
								nodeName: "#text",
								value: "320",
								parentNode: "[Circular ~.childNodes.2.childNodes.2.childNodes.1.child]"
							}
						],
						parentNode: "[Circular ~.childNodes.2.childNodes.2.childNodes.1.]"
					},
					{
						nodeName: "#text",
						value: "          ",
						parentNode: "[Circular ~.childNodes.2.childNodes.2.childNodes.1.childNode]"
					}
				],
				parentNode: "[Circular ~.child]"
			};
			let instance: Room = new Room();
			let roomData: IRoomData = {};
			instance.readRoomNumberAndHref(content, roomData);
			expect(roomData.href + " + " + roomData.number ?? "").to.equal(
				"http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/FNH-320 + 320");
		});

		describe("testing readRoomPhysicalProps seats/capacity", function () {
			it("testing readRoomPhysicalProps, seats/capacity pass", function () {
				const content = {
					nodeName: "td",
					tagName: "td",
					attrs: [
						{
							name: "class",
							value: "views-field views-field-field-room-capacity"
						}
					],
					namespaceURI: "http://www.w3.org/1999/xhtml",
					childNodes: [
						{
							nodeName: "#text",
							value: "\n            28          ",
							parentNode: "[Circular ~.childNochildNodes.3.childNodes.3.childNodes.3]"
						}
					],
					parentNode: "[Circular ~.childNodes.2Nodes.1.childNodes.1.childNodes.1.childNodes.3.childNodes.3]"
				};
				let instance: Room = new Room();
				let roomData: IRoomData = {};
				instance.readRoomPhysicalProps(content, roomData);
				expect(roomData.seats).to.equal(28);
			});

			it("testing readRoomPhysicalProps, seats/capacity isNaN", function () {
				const content = {
					nodeName: "td",
					tagName: "td",
					attrs: [
						{
							name: "class",
							value: "views-field views-field-field-room-capacity"
						}
					],
					namespaceURI: "http://www.w3.org/1999/xhtml",
					childNodes: [
						{
							nodeName: "#text",
							value: "\n            a          ",
							parentNode: "[Circular ~.childNochildNodes.3.childNodes.3.childNodes.3]"
						}
					],
					parentNode: "[Circular ~.childNodes.2Nodes.1.childNodes.1.childNodes.1.childNodes.3.childNodes.3]"
				};
				let instance: Room = new Room();
				let roomData: IRoomData = {};
				instance.readRoomPhysicalProps(content, roomData);
				expect(roomData.seats).to.equal(0);
			});

			it("testing readRoomPhysicalProps, seats/capacity fail", function () {
				const content = {
					nodeName: "td",
					tagName: "td",
					attrs: [
						{
							name: "class",
							value: "views-field views-field-field-room-number"
						}
					],
					namespaceURI: "http://www.w3.org/1999/xhtml",
					childNodes: [
						{
							nodeName: "#text",
							value: "\n            28          ",
							parentNode: "[Circular ~.childNochildNodes.3.childNodes.3.childNodes.3]"
						}
					],
					parentNode: "[Circular ~.childNodes.2Nodes.1.childNodes.1.childNodes.1.childNodes.3.childNodes.3]"
				};
				let instance: Room = new Room();
				let roomData: IRoomData = {};
				instance.readRoomPhysicalProps(content, roomData);
				expect(roomData.seats).to.equal(undefined);
			});

			it("testing readRoomPhysicalProps, furniture", function () {
				const content = {
					nodeName: "td",
					tagName: "td",
					attrs: [
						{
							name: "class",
							value: "views-field views-field-field-room-furniture"
						}
					],
					namespaceURI: "http://www.w3.org/1999/xhtml",
					childNodes: [
						{
							nodeName: "#text",
							value: "\n            Classroom-Movable Tables & Chairs          ",
							parentNode: "[Circular ~.childNodes.2.childNodes.2.childNodes.]"
						}
					],
					parentNode: "[Circular ~.childNodes.2.childdes.3]"
				};
				let instance: Room = new Room();
				let roomData: IRoomData = {};
				instance.readRoomPhysicalProps(content, roomData);
				expect(roomData.furniture).to.equal("Classroom-Movable Tables & Chairs");
			});

			it("testing readRoomPhysicalProps, furniture fail", function () {
				const content = {
					nodeName: "td",
					tagName: "td",
					attrs: [
						{
							name: "class",
							value: "views-field views-field-field-room-furniture"
						}
					],
					namespaceURI: "http://www.w3.org/1999/xhtml",
					childNodes: [
						{
							nodeName: "#txt",
							value: "\n            Classroom-Movable Tables & Chairs          ",
							parentNode: "[Circular ~.childNodes.2.childNodes.2.childNodes.]"
						}
					],
					parentNode: "[Circular ~.childNodes.2.childdes.3]"
				};
				let instance: Room = new Room();
				let roomData: IRoomData = {};
				try {
					instance.readRoomPhysicalProps(content, roomData);
				} catch (err) {
					expect(err).to.be.an.instanceOf(Error);
				}
			});

			it("testing readRoomPhysicalProps, type", function () {
				const content = {
					nodeName: "td",
					tagName: "td",
					attrs: [
						{
							name: "class",
							value: "views-field views-field-field-room-type"
						}
					],
					namespaceURI: "http://www.w3.org/1999/xhtml",
					childNodes: [
						{
							nodeName: "#text",
							value: "\n            Small Group          ",
							parentNode: "[Circular ~.childNodes.2.childNodes.2.childNodes.]"
						}
					],
					parentNode: "[Circular ~.childNodes.2.childdes.3]"
				};
				let instance: Room = new Room();
				let roomData: IRoomData = {};
				instance.readRoomPhysicalProps(content, roomData);
				expect(roomData.type).to.equal("Small Group");
			});
		});

		it("test get geo location, valid address 1" , async function () {
			let geoLocation: IGeoLocation = await rDatasetParser.getGeoLocation("2211 Wesbrook Mall");
			expect(geoLocation).to.deep.equal({lat: 49.26408, lon: -123.24605});
		});

		it("test get geo location, valid address 2 with zip code" , async function () {
			let geoLocation: IGeoLocation = await rDatasetParser.getGeoLocation("6245 Agronomy Road V6T 1Z4");
			expect(geoLocation).to.deep.equal({lat: 49.26125, lon: -123.24807});
		});

		it("test get geo location, invalid address 1" , async function () {
			let geoLocation: IGeoLocation = await rDatasetParser.getGeoLocation("1234 Wesbrook Mall");
			expect(geoLocation).to.deep.equal({lat: undefined, lon: undefined});
		});

		it("test get geo location, invalid address 2 with whitespace at the end" , async function () {
			let geoLocation: IGeoLocation = await rDatasetParser.getGeoLocation("6245 Agronomy Road V6T 1Z4 ");
			expect(geoLocation).to.deep.equal({lat: undefined, lon: undefined});
		});

		describe("testing extractDataInRow", function () {
			it("should return an object with all the room fields, Room.ts", function () {
				let contents: string = fs.readFileSync("./test/resources/files/extraDataInRows-Rooms.json", "utf8");
				let instance: Room = new Room();
				const json = JSON.parse(contents);
				let result = instance.extractDataInRow(json);
				expect(result).to.deep.equal({
					number: "320",
					href: "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/FNH-320",
					seats: 27,
					furniture: "Classroom-Movable Tablets",
					type: "Small Group"
				});
			});

			it("should return an object with buildingInfo, RDataset.ts", function () {
				let buffer: string = fs.readFileSync("./test/resources/files/simpleIndexTr.json", "utf8");
				let content = JSON.parse(buffer);
				let result = rDatasetParser.extractDataInRow(content);
				expect(result).to.deep.equal({
					shortname: "BUTO",
					fullname: "Buchanan Tower",
					address: "1873 East Mall",
					href: "./campus/discover/buildings-and-classrooms/BUTO.htm"
				});
			});

			// it("should return an object with buildingInfo, RDataset.ts", function () {
			// 	let buffer: string = fs.readFileSync("./test/resources/files/simpleIndexTr.json", "utf8");
			// 	let content = JSON.parse(buffer);
			// 	let result = rDatasetParser.extractDataInRow(content);
			// 	console.log(result);
			// });
		});
	});
});
