import {Dataset} from "../src/model/Dataset";

import * as fs from "fs-extra";
import chai, {expect} from "chai";
import chaiAsPromised from "chai-as-promised";
import {InsightDatasetKind, InsightError} from "../src/controller/IInsightFacade";
import {ISection, Section} from "../src/model/Section";
import {readJSON} from "fs-extra";
import {Course} from "../src/model/Course";
import JSZip from "jszip";


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
	fs.removeSync(persistDirectory);
});


after(function () {
	console.info("\n-----------------------------");
});

// beforeEach(function () {
// });

afterEach(function () {
	fs.removeSync(persistDirectory);
});

it("Should parse the Dataset : Small", async function () {
	dataset = await Dataset.parseDataset(
		"ubc", datasetContents.get("validquerytest") ?? "", InsightDatasetKind.Sections
	)
		.catch((err) => {
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
