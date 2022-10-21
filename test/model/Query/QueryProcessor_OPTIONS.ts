import {Dataset, IDataset} from "../../../src/model/Dataset/Dataset";
import * as fs from "fs-extra";
import chai, {expect} from "chai";
import chaiAsPromised from "chai-as-promised";
import {InsightDatasetKind, InsightResult,} from "../../../src/controller/IInsightFacade";
import {ISection} from "../../../src/model/Dataset/Section";
import InsightFacade from "../../../src/controller/InsightFacade";
import {processFILTER, processOptions} from "../../../src/model/Query/QueryProcessor";

chai.use(chaiAsPromised);

let dataset: IDataset;
const persistDirectory = "./data";
const datasetContents = new Map<string, string>();
const datasetsToLoad: {[key: string]: string} = {
	sections: "./test/resources/archives/pair.zip",
	validquerytest: "./test/resources/archives/validquerytest.zip",
	valid_small: "./test/resources/archives/courses-valid-small.zip"
};

before(function () {
	console.info("\n-----------------------------");
	for (const key of Object.keys(datasetsToLoad)) {
		const content = fs.readFileSync(datasetsToLoad[key]).toString("base64");
		datasetContents.set(key, content);
	}
});

after(function () {
	console.info("\n-----------------------------");
});

beforeEach(function () {
	fs.removeSync(persistDirectory);
});

it("a simple query testing processOPTIONS number -> console log test", async function () {
	let insightresultlist: InsightResult[];
	let sectionlist: ISection[];
	dataset = await Dataset.parseDataset(
		"sections", datasetContents.get("valid_small") ?? "", InsightDatasetKind.Sections);
	sectionlist = processFILTER({
		GT: {
			sections_avg: 78
		}
	}, dataset);
	insightresultlist = processOptions(
		{
			COLUMNS: [
				"sections_dept",
				"sections_avg"
			],
			ORDER: "sections_avg"
		}, sectionlist
	);
	console.log(insightresultlist);
});

it("testing sort by number", async function () {
	let insightresultlist: InsightResult[];
	let sectionlist: ISection[];
	dataset = await Dataset.parseDataset(
		"sections", datasetContents.get("valid_small") ?? "", InsightDatasetKind.Sections);
	sectionlist = processFILTER({
		AND:[
			{GT: {sections_avg: 78}},
			{LT: {sections_avg: 83}}
		]
	}, dataset);
	insightresultlist = processOptions(
		{
			COLUMNS: [
				"sections_avg",
			],
			ORDER: "sections_avg"
		}, sectionlist
	);
	expect(insightresultlist).to.deep.equals(
		[
			{sections_avg: 78.22},
			{sections_avg: 78.32},
			{sections_avg: 78.68},
			{sections_avg: 78.68},
			{sections_avg: 78.69},
			{sections_avg: 79.04},
			{sections_avg: 79.12},
			{sections_avg: 79.12},
			{sections_avg: 79.5},
			{sections_avg: 80.24},
			{sections_avg: 80.32},
			{sections_avg: 80.34},
			{sections_avg: 80.34},
			{sections_avg: 80.35},
			{sections_avg: 81.17},
			{sections_avg: 81.17},
			{sections_avg: 81.18},
			{sections_avg: 81.88},
			{sections_avg: 81.88}
		]
	);
});

it("testing sort by string", async function () {
	let insightresultlist: InsightResult[];
	let sectionlist: ISection[];
	dataset = await Dataset.parseDataset(
		"sections", datasetContents.get("valid_small") ?? "", InsightDatasetKind.Sections);
	sectionlist = processFILTER({
		AND:[
			{GT: {sections_avg: 78}},
			{LT: {sections_avg: 83}}
		]
	}, dataset);
	insightresultlist = processOptions(
		{
			COLUMNS: [
				"sections_instructor",
			],
			ORDER: "sections_instructor"
		}, sectionlist
	);
	expect(insightresultlist).to.deep.equals(
		[
			{sections_instructor: ""},
			{sections_instructor: ""},
			{sections_instructor: ""},
			{sections_instructor: ""},
			{sections_instructor: ""},
			{sections_instructor: ""},
			{sections_instructor: ""},
			{sections_instructor: ""},
			{sections_instructor: "allen, meghan"},
			{sections_instructor: "allen, meghan"},
			{sections_instructor: "allen, meghan"},
			{sections_instructor: "allen, meghan"},
			{sections_instructor: "allen, meghan"},
			{sections_instructor: "baniassad, elisa"},
			{sections_instructor: "baniassad, elisa"},
			{sections_instructor: "baniassad, elisa"},
			{sections_instructor: "holmes, reid"},
			{sections_instructor: "palyart-lamarche, marc"},
			{sections_instructor: "wohlstadter, eric"}
		]
	);
});

it("a simple query, testing OPTIONS with order", function () {
	let insightFacade: InsightFacade = new InsightFacade();
	return insightFacade.addDataset("sections", datasetContents.get("sections") ?? "", InsightDatasetKind.Sections)
		.then(() => {
			return insightFacade.performQuery({
				WHERE: {
					AND: [
						{GT: {sections_avg: 90}},
						{IS: {sections_dept: "adhe"}}
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
			});
		}).then((sectionlist) => {
			expect(sectionlist).to.have.length(15);
		});
});

it("a simple query, testing OPTIONS without order", function () {
	let insightFacade: InsightFacade = new InsightFacade();
	return insightFacade.addDataset("sections", datasetContents.get("sections") ?? "", InsightDatasetKind.Sections)
		.then(() => {
			return insightFacade.performQuery({
				WHERE: {
					AND: [
						{GT: {sections_avg: 90}},
						{IS: {sections_dept: "adhe"}}
					]
				},
				OPTIONS: {
					COLUMNS: [
						"sections_dept",
						"sections_id",
						"sections_avg"
					]
				}
			});
		}).then((sectionlist) => {
			expect(sectionlist).to.have.length(15);
		});
});
