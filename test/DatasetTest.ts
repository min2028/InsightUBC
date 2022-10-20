import {Dataset} from "../src/model/Dataset/Dataset";

import * as fs from "fs-extra";
import chai, {expect} from "chai";
import chaiAsPromised from "chai-as-promised";
import {InsightDatasetKind} from "../src/controller/IInsightFacade";
import {Section} from "../src/model/Dataset/Section";
import {Course} from "../src/model/Dataset/Course";
import JSZip from "jszip";
import {Disk} from "../src/Utility/Disk";
import path from "path";
import {isValidId} from "../src/Utility/General";


chai.use(chaiAsPromised);


let dataset: Dataset;

const persistDirectory = "./data";
const datasetContents = new Map<string, string>();

const datasetsToLoad: {[key: string]: string} = {
	sections: "./test/resources/archives/pair.zip",
	invalidDir: "./test/resources/archives/rtdirwrong.zip",
	notInJsonfile: "./test/resources/archives/notinjson.zip",
	noValidSec: "./test/resources/archives/novalidsec.zip",
	skipFiles: "./test/resources/archives/skipfiles.zip",
	rtdirwrong: "./test/resources/archives/rtdirwrong.zip",
	validquerytest: "./test/resources/archives/validquerytest.zip",
	valid_small: "./test/resources/archives/courses-valid-small.zip",
	valid_singleSection: "./test/resources/archives/courses-valid-singleSection.zip",
	invalid_course: "./test/resources/archives/courses-invalid-course.zip",
	invalid_empty: "./test/resources/archives/courses-invalid-empty.zip",
	invalid_name: "./test/resources/archives/courses-invalid-name.zip",
	invalid_section: "./test/resources/archives/courses-invalid-section.zip",
	invalid_structure: "./test/resources/archives/courses-invalid-structure.zip",
};

before(function () {
	console.info("\n-----------------------------");

	// This section runs once and loads all datasets specified in the datasetsToLoad object
	for (const key of Object.keys(datasetsToLoad)) {
		const content = fs.readFileSync(datasetsToLoad[key]).toString("base64");
		datasetContents.set(key, content);
	}
	// Just in case there is anything hanging around from a previous run of the test suite
	// fs.removeSync(persistDirectory);
});


after(function () {
	console.info("\n-----------------------------");
});

beforeEach(function () {
	fs.removeSync(persistDirectory);
});

// afterEach(function () {
// });

it("Should parse the Dataset : Small", async function () {
	dataset = await Dataset.parseDataset(
		"ubc", datasetContents.get("validquerytest") ?? "", InsightDatasetKind.Sections
	).catch((err) => {
		expect.fail("Should have not thrown an error");
	});
});

it("Should parse the Dataset : Large", async function () {
	dataset = await Dataset.parseDataset(
		"ubc", datasetContents.get("sections") ?? "", InsightDatasetKind.Sections
	);
});

it("Should not parse the Dataset : Invalid syntax", function () {
	const err = Dataset.parseDataset(
		"ubc", datasetContents.get("invalid_course") ?? "", InsightDatasetKind.Sections
	);
	return expect(err).eventually.to.be.rejected;
});

it("Should not parse the Dataset : Invalid file", function () {
	const err = Dataset.parseDataset(
		"ubc", datasetContents.get("notInJsonfile") ?? "", InsightDatasetKind.Sections
	);
	return expect(err).eventually.to.be.rejected;
});

it("Should reject with InsightError, not start with courses", function () {
	// const dataset1 : Promise<Dataset>;
	const err = Dataset.parseDataset(
		"ubc", datasetContents.get("rtdirwrong") ?? "", InsightDatasetKind.Sections
	);
	return expect(err).eventually.to.be.rejected;

});

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
		console.log(err);
	});
});

it("Course.parse - valid data -> should parse the course", async function () {
	const content = fs.readFileSync("./test/resources/files/valid");
	const myFile = new JSZip().file("./test/resources/files/valid", content)
		.file("./test/resources/files/valid");
	if (myFile === null) {
		expect.fail("Bad test, file is invalid");
	}
	const course = await Course.parseCourse(myFile);
	return expect(course.sections).to.have.length(39);
});

it("Course.parse - invalid data -> should throw error", function () {
	const content = fs.readFileSync("./test/resources/files/invalidSyntax");
	const myFile = new JSZip().file("./test/resources/files/invalidSyntax", content)
		.file("./test/resources/files/invalidSyntax");
	if (myFile === null) {
		expect.fail("Bad test, file is invalid");
	}
	const course = Course.parseCourse(myFile);
	return expect(course).eventually.to.be.rejected;
});

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

it ("testing", function () {
	const contentPath = "/content";
	fs.mkdirSync(path.join(persistDirectory + contentPath), {recursive: true});
	fs.createFileSync(persistDirectory + contentPath + "/test.json");
	fs.writeJSONSync(persistDirectory + contentPath + "/test.json", "first content");
	fs.createFileSync(persistDirectory + contentPath + "/test.json");
	fs.writeJSONSync(persistDirectory + contentPath + "/test.json", "second content");
});

it ("write Dataset", function () {
	return Dataset.parseDataset("ubc", datasetContents.get("validquerytest") ?? "", InsightDatasetKind.Sections)
		.then((small_dataset) => {
			Disk.writeDataset(small_dataset);
			const content = Disk.readDataset("ubc");
			console.log(small_dataset);
			console.log(content);
			expect(content).to.deep.equal(small_dataset);
		});
});

it ("write multiple Datasets", function () {
	return Dataset.parseDataset("ubc", datasetContents.get("validquerytest") ?? "", InsightDatasetKind.Sections)
		.then(() => {
			return Dataset.parseDataset("small", datasetContents.get("valid_small") ?? "", InsightDatasetKind.Sections)
				.then((small_dataset) => {
					Disk.writeDataset(small_dataset);
					const content = Disk.readDataset("small");
					expect(content).to.deep.equal(small_dataset);
				});
		});
});

it("should remove a dataset, testing writeDataset", function () {
	return Dataset.parseDataset("ubc", datasetContents.get("validquerytest") ?? "", InsightDatasetKind.Sections)
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

it ("invalid id", function() {
	const res = isValidId("\n");
	return expect(res).to.be.false;
});
