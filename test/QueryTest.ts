// import {Dataset} from "../src/model/Dataset";
//
// import * as fs from "fs-extra";
// import chai, {expect} from "chai";
// import chaiAsPromised from "chai-as-promised";
// import {InsightDatasetKind} from "../src/controller/IInsightFacade";
// import {Section} from "../src/model/Section";
// import {Course} from "../src/model/Course";
// import JSZip from "jszip";
// import {Disk} from "../src/Utility/Disk";
// import path from "path";
// import {isValidId} from "../src/Utility/General";
// import {FILTER, IQuery, KeyValuePair} from "../src/model/Query";
// import Tree, {buildTree} from "../src/model/Tree";
//
//
// chai.use(chaiAsPromised);
//
//
// let dataset: Dataset;
// let query: IQuery;
// let tree: Tree<FILTER>;
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
// // TWO LOGICCOMPARISON within the same level is not working
// it("Should return the tree", function () {
// 	tree = buildTree({
// 		type: "LOGICCOMPARISON",
// 		AND: [{
// 			type: "LOGICCOMPARISON", AND: [{
// 				type: "LOGICCOMPARISON", OR: [{
// 					type: "LOGICCOMPARISON", AND: [{
// 						type: "MCOMPARISON", GT: {}, LT: {}}] , OR: [{
// 						type: "MCOMPARISON", LT: {}, EQ: {}}]}],
// 			}]}]}
// 	);
// });
