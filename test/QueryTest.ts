import {Dataset, IDataset} from "../src/model/Dataset";

import * as fs from "fs-extra";
import chai, {expect} from "chai";
import chaiAsPromised from "chai-as-promised";
import {InsightDatasetKind, InsightResult} from "../src/controller/IInsightFacade";
import {ISection, Section} from "../src/model/Section";
import {Course} from "../src/model/Course";
import JSZip from "jszip";
import {Disk} from "../src/Utility/Disk";
import path from "path";
import {isValidId} from "../src/Utility/General";
import {IQuery, isValidKeyValuePair, isValidQueryKey, Query, QueryProps, validateQuery} from "../src/model/Query";
import InsightFacade from "../src/controller/InsightFacade";
import exp from "constants";
// import Tree, {buildTree} from "../src/model/Tree";


chai.use(chaiAsPromised);


let dataset: IDataset;
// let tree: Tree<FILTER>;

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

it("a simple query, should return results -> Testing Integration", async function () {
	// let queryProps: QueryProps;
	// let query: IQuery;
	let sectionlist: ISection[];
	// queryProps = await Query.parseQuery({
	// 	WHERE: {
	// 		GT: {
	// 			sections_avg: 97
	// 		}
	// 	},
	// 	OPTIONS: {
	// 		COLUMNS: [
	// 			"sections_dept",
	// 			"sections_avg"
	// 		],
	// 		ORDER: "sections_avg"
	// 	}
	// });
	// query = queryProps.query;
	dataset = await Dataset.parseDataset(
		"sections", datasetContents.get("valid_small") ?? "", InsightDatasetKind.Sections);
	sectionlist = Query.processFILTER({
		GT: {
			sections_avg: 99
		}
	}, dataset);
	expect(sectionlist).to.have.length(0);
});

it("a simple query, should return results -> testing processFILTER valid_small", async function () {
	let sectionlist: ISection[];
	dataset = await Dataset.parseDataset(
		"sections", datasetContents.get("valid_small") ?? "", InsightDatasetKind.Sections);
	sectionlist = Query.processFILTER({
		GT: {
			sections_avg: 97
		}
	}, dataset);
	expect(sectionlist).to.have.length(0);
});

it("a simple query, should return results -> testing processFILTER console log test", async function () {
	let sectionlist: ISection[];
	dataset = await Dataset.parseDataset(
		"sections", datasetContents.get("valid_small") ?? "", InsightDatasetKind.Sections);
	sectionlist = Query.processFILTER({
		GT: {
			sections_avg: 99
		}
	}, dataset);
	console.log(sectionlist);
});


it("a simple query, should return results -> testing processOPTIONS", async function () {
	let insightresultlist: InsightResult[];
	let sectionlist: ISection[];
	dataset = await Dataset.parseDataset(
		"sections", datasetContents.get("sections") ?? "", InsightDatasetKind.Sections);
	sectionlist = Query.processFILTER({
		GT: {
			sections_avg: 99
		}
	}, dataset);
	insightresultlist = Query.processOptions(
		{
			COLUMNS: [
				"sections_dept",
				"sections_avg"
			],
			ORDER: "sections_dept"
		}, sectionlist
	);
	console.log(insightresultlist);
});

it ("valid simple query -> Should pass the validation", function () {
	const result = validateQuery(
		{
			WHERE: {
				GT: {
					sections_avg: 97
				}
			},
			OPTIONS: {
				COLUMNS: [
					"sections_dept",
					"sections_avg"
				],
				ORDER: "sections_avg"
			}
		}, "sections");
	return expect(result).to.be.true;
});

it ("valid complex query -> Should pass the validation", function () {
	const result = validateQuery(
		{
			WHERE: {
				OR: [
					{
						AND: [
							{
								GT: {
									sections_avg: 90
								}
							},
							{
								IS: {
									sections_dept: "adhe"
								}
							}
						]
					},
					{
						EQ: {
							sections_avg: 95
						}
					}
				]
			},
			OPTIONS: {
				COLUMNS: [
					"sections_dept",
					"sections_id",
					"sections_avg"
				],
				ORDER: "sections_avg"
			}
		}, "sections");
	return expect(result).to.be.true;
});

it ("valid query key -> Should pass the validation", function() {
	const result = isValidQueryKey("section_dept", "section");
	return expect(result).to.be.true;
});

it ("valid keyValuePair string -> Should pass the validation", function() {
	const result = isValidKeyValuePair({sections_dept: "cpsc"}, "sections", "s");
	return expect(result).to.be.true;
});

it ("valid keyValuePair numeric -> Should pass the validation", function() {
	const result = isValidKeyValuePair({sections_avg: 97.4}, "sections", "n");
	return expect(result).to.be.true;
});
