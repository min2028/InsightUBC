import {Dataset, IDataset} from "../../../src/model/Dataset/Dataset";
import * as fs from "fs-extra";
import chai, {expect} from "chai";
import chaiAsPromised from "chai-as-promised";
import {InsightDatasetKind} from "../../../src/controller/IInsightFacade";
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

it("testing processFILTER valid_small -> should return empty results", async function () {
	let sectionlist: ISection[];
	dataset = await Dataset.parseDataset(
		"sections", datasetContents.get("valid_small") ?? "", InsightDatasetKind.Sections);
	sectionlist = processFILTER({
		GT: {sections_avg: 97}
	}, dataset);
	expect(sectionlist).to.have.length(0);
});

it("testing AND with one item in the list", async function () {
	let sectionlist: ISection[];
	dataset = await Dataset.parseDataset(
		"sections", datasetContents.get("sections") ?? "", InsightDatasetKind.Sections);
	sectionlist = processFILTER({
		AND: [
			{
				IS: {sections_dept: "adhe"}
			}
		]
	}, dataset);
	expect(sectionlist).to.have.length(232);
});

it("testing OR with one item in the list", async function () {
	let sectionlist: ISection[];
	dataset = await Dataset.parseDataset(
		"sections", datasetContents.get("sections") ?? "", InsightDatasetKind.Sections);
	sectionlist = processFILTER({
		OR: [
			{
				IS: {sections_dept: "adhe"}
			}
		]
	}, dataset);
	expect(sectionlist).to.have.length(232);
});

it("testing AND with three item in the list", async function () {
	let sectionlist: ISection[];
	dataset = await Dataset.parseDataset(
		"sections", datasetContents.get("sections") ?? "", InsightDatasetKind.Sections);
	sectionlist = processFILTER({
		AND: [
			{
				GT: {sections_avg: 90}
			},
			{
				IS: {sections_dept: "adhe"}
			},
			{
				LT: {sections_avg: 96}
			}
		]
	}, dataset);
	expect(sectionlist).to.have.length(14);
});

it("testing NOT with one item in the list", async function () {
	let sectionlist: ISection[];
	dataset = await Dataset.parseDataset(
		"sections", datasetContents.get("sections") ?? "", InsightDatasetKind.Sections);
	sectionlist = processFILTER({
		AND: [
			{
				NOT: {GT: {sections_avg: 40}}
			}
		]
	}, dataset);
	expect(sectionlist).to.have.length(12);
});

it("testing AND", async function () {
	let sectionlist: ISection[];
	dataset = await Dataset.parseDataset(
		"sections", datasetContents.get("sections") ?? "", InsightDatasetKind.Sections);
	sectionlist = processFILTER({
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
	}, dataset);
	expect(sectionlist).to.have.length(15);
});

it("testing OR", async function () {
	let sectionlist: ISection[];
	dataset = await Dataset.parseDataset(
		"sections", datasetContents.get("sections") ?? "", InsightDatasetKind.Sections);
	sectionlist = processFILTER({
		OR: [
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
	}, dataset);
	expect(sectionlist).to.have.length(3344);
});

it("SCOMP test, cpsc", async function () {
	let sectionlist: ISection[];
	dataset = await Dataset.parseDataset(
		"sections", datasetContents.get("valid_small") ?? "", InsightDatasetKind.Sections);
	sectionlist = processFILTER({
		IS: {
			sections_dept: "cpsc"
		}
	}, dataset);
	console.log(sectionlist.length);
});

it("SCOMP test, *cpsc*, should return length 39", async function () {
	let sectionlist: ISection[];
	dataset = await Dataset.parseDataset(
		"sections", datasetContents.get("valid_small") ?? "", InsightDatasetKind.Sections);
	sectionlist = processFILTER({
		IS: {
			sections_dept: "*cpsc*"
		}
	}, dataset);
	console.log(sectionlist.length);
});

it("SCOMP test on pair, adhe, should return length 232", async function () {
	let sectionlist: ISection[];
	dataset = await Dataset.parseDataset(
		"sections", datasetContents.get("sections") ?? "", InsightDatasetKind.Sections);
	sectionlist = processFILTER({
		IS: {
			sections_dept: "adhe"
		}
	}, dataset);
	console.log(sectionlist.length);
});

it("SCOMP test on pair, abcd, should return length 0", async function () {
	let sectionlist: ISection[];
	dataset = await Dataset.parseDataset(
		"sections", datasetContents.get("sections") ?? "", InsightDatasetKind.Sections);
	sectionlist = processFILTER({
		IS: {
			sections_dept: "abcd"
		}
	}, dataset);
	console.log(sectionlist.length);
});

it("SCOMP test on pair, a*, should return length 4652", async function () {
	let sectionlist: ISection[];
	dataset = await Dataset.parseDataset(
		"sections", datasetContents.get("sections") ?? "", InsightDatasetKind.Sections);
	sectionlist = processFILTER({
		IS: {
			sections_dept: "a*"
		}
	}, dataset);
	console.log(sectionlist.length);
});

it("SCOMP test, *a, should return empty list", async function () {
	let sectionlist: ISection[];
	dataset = await Dataset.parseDataset(
		"sections", datasetContents.get("valid_small") ?? "", InsightDatasetKind.Sections);
	sectionlist = processFILTER({
		IS: {
			sections_dept: "*a"
		}
	}, dataset);
	console.log(sectionlist.length);
});

it("SCOMP test, *ps*, should return length 39", async function () {
	let sectionlist: ISection[];
	dataset = await Dataset.parseDataset(
		"sections", datasetContents.get("valid_small") ?? "", InsightDatasetKind.Sections);
	sectionlist = processFILTER({
		IS: {
			sections_dept: "*ps*"
		}
	}, dataset);
	expect(sectionlist).to.have.length(39);
});

it("testing SCOMP *computer*, should return 80", function () {
	let insightFacade: InsightFacade = new InsightFacade();
	return insightFacade.addDataset("sections", datasetContents.get("sections") ?? "", InsightDatasetKind.Sections)
		.then(() => {
			return insightFacade.performQuery({
				WHERE: {
					IS: {sections_title: "*computer*"}
				},
				OPTIONS: {
					COLUMNS: [
						"sections_title",
					]
				}
			});
		}).then((sectionlist) => {
			expect(sectionlist).to.have.length(80);
		});
});

it("testing SCOMP **, should return 49", function () {
	let insightFacade: InsightFacade = new InsightFacade();
	return insightFacade.addDataset("sections", datasetContents.get("sections") ?? "", InsightDatasetKind.Sections)
		.then(() => {
			return insightFacade.performQuery({
				WHERE: {
					AND: [
						{GT: {sections_avg: 97}},
						{IS: {sections_title: "**"}}
					]
				},
				OPTIONS: {
					COLUMNS: [
						"sections_dept",
						"sections_id"
					]
				}
			});
		}).then((sectionlist) => {
			expect(sectionlist).to.have.length(49);
		});
});
