import * as fs from "fs-extra";
import chai, {expect} from "chai";
import chaiAsPromised from "chai-as-promised";
import {IDataset} from "../../../src/model/Dataset/IDataset";
import {IBuildingData, IGeoLocation, RDataset} from "../../../src/model/Dataset/RoomDataset/RDataset";
import {IRoomData, Room} from "../../../src/model/Dataset/RoomDataset/Room";
import JSZip from "jszip";
import path from "path";
import {parse} from "parse5";
import doc = Mocha.reporters.doc;
import {InsightError} from "../../../src/controller/IInsightFacade";

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

		it("should parse building, testing parseRoom", function () {
			let contents: string = fs.readFileSync("./test/resources/files/SRC.htm", "utf8");
			const buildingInfo = {
				fullname: "building1", shortname: "BLD", address: "CAMPUS", href: ""
			} as IBuildingData;
			const geoInfo = {lon: -14.52, lat: 24.5} as IGeoLocation;
			const results = Room.parseRoom(contents, buildingInfo, geoInfo);
			console.log(results);
		});

		it("testing traverseHTML", function () {
			let contents: string = fs.readFileSync("./test/resources/files/FNH_tableOnly.json", "utf8");
			let instance: Room = new Room();
			// console.log(contents);
			const json = JSON.parse(contents);
			// console.log(typeof json === "object");
			// console.log(json);
			const results = instance.traverseJsonOfHTML(json);
			console.log(results);
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

		it("parse room -> should return list of rooms", function () {
			const filesPath = path.join("./test/resources/files/SRC.htm");
			const content = fs.readFileSync(filesPath).toString("base64");
			const zip = new JSZip();
			zip.loadAsync(content, {base64: true});
			console.log(zip.files);
			// const indexFile = await zip.file("index.htm")?.async("string") ?? "";
			//
			//
			// !fs.existsSync(persistDirectory + idsPath)) {
			// 	return [];
			// }
			// const idsFileContent = fs.readJSONSync(persistDirectory + idsPath);
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

		// ?????? What the hell is this
		it("test get geo location" , async function () {
			let geoLocation: IGeoLocation = await rDatasetParser.getGeoLocation("2211 Wesbrook Mall");
			console.log(geoLocation.lon);
			console.log(geoLocation.lat);
		});
		// test extractDataInRow
	});
});
