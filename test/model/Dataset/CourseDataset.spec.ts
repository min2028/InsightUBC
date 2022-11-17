import {CDataset} from "../../../src/model/Dataset/CourseDataset/CDataset";

import * as fs from "fs-extra";
import chai, {expect} from "chai";
import chaiAsPromised from "chai-as-promised";
import {InsightDatasetKind} from "../../../src/controller/IInsightFacade";
import {Section} from "../../../src/model/Dataset/CourseDataset/Section";
import {Course} from "../../../src/model/Dataset/CourseDataset/Course";
import JSZip from "jszip";
import {Disk} from "../../../src/Utility/Disk";
import {IDataset} from "../../../src/model/Dataset/IDataset";

chai.use(chaiAsPromised);

describe("[ CourseDataset.spec.ts ]", function () {
	let dataset: IDataset;
	const persistDirectory = "./data";
	const datasetContents = new Map<string, string>();

	const datasetsToLoad: {[key: string]: string} = {
		sections: "./test/resources/archives/courses/pair.zip",
		notInJsonfile: "./test/resources/archives/courses/notinjson.zip",
		noValidSec: "./test/resources/archives/courses/novalidsec.zip",
		skipFiles: "./test/resources/archives/courses/skipfiles.zip",
		rtdirwrong: "./test/resources/archives/courses/rtdirwrong.zip",
		validquerytest: "./test/resources/archives/courses/validquerytest.zip",
		valid_small: "./test/resources/archives/courses/valid-small.zip",
		invalid_course: "./test/resources/archives/courses/invalid-course.zip",
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
	});

	describe("parse Dataset", function() {
		it("Should parse the Dataset : Small", async function () {
			dataset = await new CDataset().parseDataset(
				"ubc", datasetContents.get("validquerytest") ?? ""
			).catch((err) => {
				expect.fail("Should have not thrown an error");
			});
		});

		it("Should parse the Dataset : Large", async function () {
			dataset = await new CDataset().parseDataset(
				"ubc", datasetContents.get("sections") ?? ""
			);
		});

		it("Should not parse the Dataset : Invalid syntax", function () {
			const err = new CDataset().parseDataset(
				"ubc", datasetContents.get("invalid_course") ?? ""
			);
			return expect(err).eventually.to.be.rejected;
		});

		it("Should not parse the Dataset : Invalid file", function () {
			const err = new CDataset().parseDataset(
				"ubc", datasetContents.get("notInJsonfile") ?? ""
			);
			return expect(err).eventually.to.be.rejected;
		});

		it("Should reject with InsightError, not start with courses", function () {
			// const dataset1 : Promise<Dataset>;
			const err = new CDataset().parseDataset(
				"ubc", datasetContents.get("rtdirwrong") ?? ""
			);
			return expect(err).eventually.to.be.rejected;
		});
	});

	describe("parse Course", function() {
		it("Course.parse - valid data -> should parse the course", async function () {
			const content = fs.readFileSync("./test/resources/files/validCourse");
			const myFile = new JSZip().file("./test/resources/files/validCourse", content)
				.file("./test/resources/files/validCourse");
			if (myFile === null) {
				expect.fail("Bad test, file is invalid");
			}
			const course = await Course.parseCourse(myFile);
			return expect(course.sections).to.have.length(39);
		});

		it("Course.parse - invalid data -> should throw error", function () {
			const content = fs.readFileSync("./test/resources/files/invalidSyntaxCourse");
			const myFile = new JSZip().file("./test/resources/files/invalidSyntaxCourse", content)
				.file("./test/resources/files/invalidSyntaxCourse");
			if (myFile === null) {
				expect.fail("Bad test, file is invalid");
			}
			const course = Course.parseCourse(myFile);
			return expect(course).eventually.to.be.rejected;
		});
	});

	describe("parse Section", function() {
		it("Should return true, json file contains title", function () {
			Section.parseSection(
				{
					Year: "2008",
					id: 24495,
					Subject: "astr",
					Title: "adv plnt comm",
					Professor: "",
					Audit: 1,
					Course: "526",
					Pass: 6,
					Fail: 0,
					Avg: 83.83,
					// Section: "overall"
				}
			).catch((err) => {
				expect.fail(err);
			});
		});
	});

	describe("write to disk", function () {
		it("Should write the metadata on the disk", function () {
			Disk.writeDatasetMeta([{id: "ubc", kind: InsightDatasetKind.Rooms, numRows: 10},
				{id: "Min", kind: InsightDatasetKind.Sections, numRows: 3}]);
			const idList = Disk.readDatasetMeta();
			return expect(idList).to.deep.equal([{id: "ubc", kind: InsightDatasetKind.Rooms, numRows: 10},
				{id: "Min", kind: InsightDatasetKind.Sections, numRows: 3}]);
		});

		it("Should write the meta data on the disk multiple times", function () {
			Disk.writeDatasetMeta([{id: "ubc", kind: InsightDatasetKind.Sections, numRows: 10},
				{id: "Min", kind: InsightDatasetKind.Sections, numRows: 3}]);
			Disk.writeDatasetMeta([{id: "ubc", kind: InsightDatasetKind.Sections, numRows: 2},
				{id: "Payam", kind: InsightDatasetKind.Rooms, numRows: 5},
				{id: "ubc", kind: InsightDatasetKind.Sections, numRows: 6}]);
			const idList = Disk.readDatasetMeta();
			return expect(idList).to.deep.equal([{id: "ubc", kind: InsightDatasetKind.Sections, numRows: 2},
				{id: "Payam", kind: InsightDatasetKind.Rooms, numRows: 5},
				{id: "ubc", kind: InsightDatasetKind.Sections, numRows: 6}]);
		});

		it ("write Dataset", function () {
			return new CDataset().parseDataset(
				"ubc", datasetContents.get("validquerytest") ?? "")
				.then((small_dataset) => {
					Disk.writeDataset(small_dataset);
					const content = Disk.readDataset("ubc");
					expect(content).to.deep.equal(small_dataset);
				});
		});

		it ("write multiple Datasets", function () {
			return new CDataset().parseDataset("ubc", datasetContents.get("validquerytest") ?? "")
				.then(() => {
					return new CDataset().parseDataset("small", datasetContents.get("valid_small") ?? "")
						.then((small_dataset) => {
							Disk.writeDataset(small_dataset);
							const content = Disk.readDataset("small");
							expect(content).to.deep.equal(small_dataset);
						});
				});
		});
	});

	describe("remove from disk", function () {
		it("should remove a dataset, testing writeDataset", function () {
			return new CDataset().parseDataset("ubc", datasetContents.get("validquerytest") ?? "")
				.then((small_dataset) => {
					Disk.writeDataset(small_dataset);
					Disk.removeDataset("ubc");
				});
		});

		it("should remove a dataset, testing writeDataMeta", function () {
			Disk.writeDatasetMeta([{id: "ubc", kind: InsightDatasetKind.Rooms, numRows: 10},
				{id: "Min", kind: InsightDatasetKind.Sections, numRows: 3}]);
			Disk.removeDataset("ubc");
		});
	});
});
