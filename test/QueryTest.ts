// import {Dataset, IDataset} from "../src/model/Dataset/Dataset";
//
// import * as fs from "fs-extra";
// import chai, {expect} from "chai";
// import chaiAsPromised from "chai-as-promised";
// import {InsightDatasetKind, InsightError, InsightResult, ResultTooLargeError} from "../src/controller/IInsightFacade";
// import {ISection} from "../src/model/Dataset/Section";
// import {
// 	IQuery,
// 	Query,
// 	QueryProps
// } from "../src/model/Query/Query";
// import InsightFacade from "../src/controller/InsightFacade";
// import {processFILTER, processOptions} from "../src/model/Query/QueryProcessor";
// import {checkWildCard, isValidKeyValuePair, isValidQueryKey, validateQuery} from "../src/model/Query/QueryValidator";
//
// chai.use(chaiAsPromised);
//
// let dataset: IDataset;
//
// const persistDirectory = "./data";
// const datasetContents = new Map<string, string>();
//
// const datasetsToLoad: {[key: string]: string} = {
// 	sections: "./test/resources/archives/pair.zip",
// 	invalidDir: "./test/resources/archives/rtdirwrong.zip",
// 	notInJsonfile: "./test/resources/archives/notinjson.zip",
// 	noValidSec: "./test/resources/archives/novalidsec.zip",
// 	skipFiles: "./test/resources/archives/skipfiles.zip",
// 	rtdirwrong: "./test/resources/archives/rtdirwrong.zip",
// 	validquerytest: "./test/resources/archives/validquerytest.zip",
// 	valid_small: "./test/resources/archives/courses-valid-small.zip",
// 	valid_singleSection: "./test/resources/archives/courses-valid-singleSection.zip",
// 	invalid_course: "./test/resources/archives/courses-invalid-course.zip",
// 	invalid_empty: "./test/resources/archives/courses-invalid-empty.zip",
// 	invalid_name: "./test/resources/archives/courses-invalid-name.zip",
// 	invalid_section: "./test/resources/archives/courses-invalid-section.zip",
// 	invalid_structure: "./test/resources/archives/courses-invalid-structure.zip",
// };
//
// before(function () {
// 	console.info("\n-----------------------------");
//
// 	// This section runs once and loads all datasets specified in the datasetsToLoad object
// 	for (const key of Object.keys(datasetsToLoad)) {
// 		const content = fs.readFileSync(datasetsToLoad[key]).toString("base64");
// 		datasetContents.set(key, content);
// 	}
// 	// Just in case there is anything hanging around from a previous run of the test suite
// 	// fs.removeSync(persistDirectory);
// });
//
//
// after(function () {
// 	console.info("\n-----------------------------");
// });
//
// beforeEach(function () {
// 	fs.removeSync(persistDirectory);
// });
//
// // afterEach(function () {
// // });
//
// it("Should parse the Dataset : Small", async function () {
// 	dataset = await Dataset.parseDataset(
// 		"ubc", datasetContents.get("validquerytest") ?? "", InsightDatasetKind.Sections
// 	).catch((err) => {
// 		expect.fail("Should have not thrown an error");
// 	});
// });
//
// it("a simple query, should return results -> Testing Integration", async function () {
// 	let queryProps: QueryProps;
// 	let query: IQuery;
// 	let sectionlist: InsightResult[];
// 	queryProps = await Query.parseQuery({
// 		WHERE: {
// 			GT: {
// 				sections_avg: 99
// 			}
// 		},
// 		OPTIONS: {
// 			COLUMNS: [
// 				"sections_dept",
// 				"sections_avg"
// 			],
// 			ORDER: "sections_avg"
// 		}
// 	});
// 	query = queryProps.query;
// 	dataset = await Dataset.parseDataset(
// 		"sections", datasetContents.get("sections") ?? "", InsightDatasetKind.Sections);
// 	sectionlist = await Query.processQuery(query, dataset);
// 	expect(sectionlist).to.have.length(3);
// });
//
// it("a simple query, should return results -> testing processFILTER valid_small", async function () {
// 	let sectionlist: ISection[];
// 	dataset = await Dataset.parseDataset(
// 		"sections", datasetContents.get("valid_small") ?? "", InsightDatasetKind.Sections);
// 	sectionlist = processFILTER({
// 		GT: {
// 			sections_avg: 97
// 		}
// 	}, dataset);
// 	expect(sectionlist).to.have.length(0);
// });
//
// it("a simple query, should return results -> testing processFILTER console log test", async function () {
// 	let sectionlist: ISection[];
// 	dataset = await Dataset.parseDataset(
// 		"sections", datasetContents.get("valid_small") ?? "", InsightDatasetKind.Sections);
// 	sectionlist = processFILTER({
// 		GT: {
// 			sections_avg: 99
// 		}
// 	}, dataset);
// 	console.log(sectionlist);
// });
//
// it("testing sort by number", async function () {
// 	let insightresultlist: InsightResult[];
// 	let sectionlist: ISection[];
// 	dataset = await Dataset.parseDataset(
// 		"sections", datasetContents.get("valid_small") ?? "", InsightDatasetKind.Sections);
// 	sectionlist = processFILTER({
// 		AND:[
// 			{
// 				GT: {
// 					sections_avg: 78
// 				}
// 			},
// 			{
// 				LT: {
// 					sections_avg: 83
// 				}
// 			}
// 		]
// 	}, dataset);
// 	insightresultlist = processOptions(
// 		{
// 			COLUMNS: [
// 				"sections_avg",
// 			],
// 			ORDER: "sections_avg"
// 		}, sectionlist
// 	);
// 	console.log(insightresultlist);
// 	expect(insightresultlist).to.deep.equals(
// 		[
// 			{sections_avg: 78.22},
// 			{sections_avg: 78.32},
// 			{sections_avg: 78.68},
// 			{sections_avg: 78.68},
// 			{sections_avg: 78.69},
// 			{sections_avg: 79.04},
// 			{sections_avg: 79.12},
// 			{sections_avg: 79.12},
// 			{sections_avg: 79.5},
// 			{sections_avg: 80.24},
// 			{sections_avg: 80.32},
// 			{sections_avg: 80.34},
// 			{sections_avg: 80.34},
// 			{sections_avg: 80.35},
// 			{sections_avg: 81.17},
// 			{sections_avg: 81.17},
// 			{sections_avg: 81.18},
// 			{sections_avg: 81.88},
// 			{sections_avg: 81.88}
// 		]
// 	);
// });
//
// it("a simple query, should return results -> testing processOPTIONS number", async function () {
// 	let insightresultlist: InsightResult[];
// 	let sectionlist: ISection[];
// 	dataset = await Dataset.parseDataset(
// 		"sections", datasetContents.get("valid_small") ?? "", InsightDatasetKind.Sections);
// 	sectionlist = processFILTER({
// 		GT: {
// 			sections_avg: 78
// 		}
// 	}, dataset);
// 	insightresultlist = processOptions(
// 		{
// 			COLUMNS: [
// 				"sections_dept",
// 				"sections_avg"
// 			],
// 			ORDER: "sections_avg"
// 		}, sectionlist
// 	);
// 	console.log(insightresultlist);
// });
//
// it("a simple query, should return results -> testing processOPTIONS number", async function () {
// 	let insightresultlist: InsightResult[];
// 	let sectionlist: ISection[];
// 	dataset = await Dataset.parseDataset(
// 		"sections", datasetContents.get("valid_small") ?? "", InsightDatasetKind.Sections);
// 	sectionlist = processFILTER({
// 		GT: {
// 			sections_avg: 78
// 		}
// 	}, dataset);
// 	insightresultlist = processOptions(
// 		{
// 			COLUMNS: [
// 				"sections_dept",
// 				"sections_avg"
// 			],
// 			ORDER: "sections_avg"
// 		}, sectionlist
// 	);
// 	console.log(insightresultlist);
// });
//
// it("testing sort by string", async function () {
// 	let insightresultlist: InsightResult[];
// 	let sectionlist: ISection[];
// 	dataset = await Dataset.parseDataset(
// 		"sections", datasetContents.get("valid_small") ?? "", InsightDatasetKind.Sections);
// 	sectionlist = processFILTER({
// 		AND:[
// 			{
// 				GT: {
// 					sections_avg: 78
// 				}
// 			},
// 			{
// 				LT: {
// 					sections_avg: 83
// 				}
// 			}
// 		]
// 	}, dataset);
// 	insightresultlist = processOptions(
// 		{
// 			COLUMNS: [
// 				"sections_instructor",
// 			],
// 			ORDER: "sections_instructor"
// 		}, sectionlist
// 	);
// 	console.log(insightresultlist);
// 	expect(insightresultlist).to.deep.equals(
// 		[
// 			{sections_instructor: ""},
// 			{sections_instructor: ""},
// 			{sections_instructor: ""},
// 			{sections_instructor: ""},
// 			{sections_instructor: ""},
// 			{sections_instructor: ""},
// 			{sections_instructor: ""},
// 			{sections_instructor: ""},
// 			{sections_instructor: "allen, meghan"},
// 			{sections_instructor: "allen, meghan"},
// 			{sections_instructor: "allen, meghan"},
// 			{sections_instructor: "allen, meghan"},
// 			{sections_instructor: "allen, meghan"},
// 			{sections_instructor: "baniassad, elisa"},
// 			{sections_instructor: "baniassad, elisa"},
// 			{sections_instructor: "baniassad, elisa"},
// 			{sections_instructor: "holmes, reid"},
// 			{sections_instructor: "palyart-lamarche, marc"},
// 			{sections_instructor: "wohlstadter, eric"}
// 		]
// 	);
// });
//
// it("valid simple query -> Should pass the validation", function () {
// 	const result = validateQuery(
// 		{
// 			WHERE: {
// 				GT: {
// 					sections_avg: 97
// 				}
// 			},
// 			OPTIONS: {
// 				COLUMNS: [
// 					"sections_dept",
// 					"sections_avg"
// 				],
// 				ORDER: "sections_avg"
// 			}
// 		}, "sections");
// 	return expect(result).to.be.true;
// });
