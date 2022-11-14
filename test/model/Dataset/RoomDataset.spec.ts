import * as fs from "fs-extra";
import chai, {expect} from "chai";
import chaiAsPromised from "chai-as-promised";
import {IDataset} from "../../../src/model/Dataset/IDataset";
import {RDataset} from "../../../src/model/Dataset/RoomDataset/RDataset";

chai.use(chaiAsPromised);

describe("[ RoomDataset.spec.ts ]", function () {
	let dataset: IDataset;
	const persistDirectory = "./data";
	const datasetContents = new Map<string, string>();
	let rDatasetParser: RDataset;

	const datasetsToLoad: {[key: string]: string} = {
		sections: "./test/resources/archives/courses/pair.zip",
		notInJsonfile: "./test/resources/archives/courses/notinjson.zip",
		noValidSec: "./test/resources/archives/courses/novalidsec.zip",
		skipFiles: "./test/resources/archives/courses/skipfiles.zip",
		rtdirwrong: "./test/resources/archives/courses/rtdirwrong.zip",
		validquerytest: "./test/resources/archives/courses/validquerytest.zip",
		valid_small: "./test/resources/archives/courses/valid-small.zip",
		invalid_course: "./test/resources/archives/courses/invalid-course.zip",
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

	describe("RDataset test",  function() {
		it("should convert zip to json", async function () {
			dataset = await new RDataset().parseDataset(
				"test",datasetContents.get("rooms") ?? "")
				.catch(() => expect.fail("Should have not thrown an error"));
		});

		it("should checkNodeAttributes,true", function () {
			const name = "class";
			const value = "views-field views-field-field-building-code";
			const result: boolean = rDatasetParser.checkNodeAttributes([{
				name: "class",
				value: "views-field views-field-field-building-code"
			}], name, value);
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
					parentNode: "[Nodes.1.childNodes.3.childNodes.1.childNodeodes.3.childNodes.3.childNodes.3]",
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
			console.log(result);
		});

		it("should search the table", function () {
			const result = rDatasetParser.traverseHTML({
				nodeName: "table",
				tagName: "table",
				attrs: [
					{
						name: "class",
						value: "views-table cols-5 table"
					}
				],namespaceURI: "http://www.w3.org/1999/xhtml",
				childNodes: [
					{
						nodeName: "#text",
						value: "\n         ",
						parentNode: "[Circular ~.childNodes.0.childNodes.1.childNodes.0]",
						sourceCodeLocation: {
							startLine: 1,
							startCol: 41,
							startOffset: 40,
							endLine: 2,
							endCol: 10,
							endOffset: 50
						}
					},
					{
						nodeName: "tbody",
						tagName: "tbody",
						attrs: [
							{
								name: "class",
								body: "view-body"
							}
						],
						childNodes: [{
							nodeName: "tr",
							tagName: "tr",
							attrs: [{
								name: "class",
								body: "view-tr"
							}],
							childNodes: [{
								nodeName: "#text"
							}]
						}, {
							nodeName: "td",
							tagName: "td",
							attrs: [{
								name: "class",
								body: "views-field views-field-field-building-code"
							}],
							childNodes: [{
								nodeName: "#text",
								value: "\n            ALRD          ",
								parentNode: "[Nodes.1.childNodes.3.]",
							}]
						}]
					}]});
			console.log(result);
		});
	});
});
