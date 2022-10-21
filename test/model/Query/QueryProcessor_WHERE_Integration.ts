import {Dataset, IDataset} from "../../../src/model/Dataset/Dataset";
import * as fs from "fs-extra";
import chai, {expect} from "chai";
import chaiAsPromised from "chai-as-promised";
import {InsightDatasetKind, InsightResult, ResultTooLargeError} from "../../../src/controller/IInsightFacade";
import {
	IQuery,
	Query,
	QueryProps
} from "../../../src/model/Query/Query";
import InsightFacade from "../../../src/controller/InsightFacade";

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

it("a very complex query", function () {
	let insightFacade: InsightFacade = new InsightFacade();
	return insightFacade.addDataset("sections", datasetContents.get("sections") ?? "", InsightDatasetKind.Sections)
		.then(() => {
			return insightFacade.performQuery({
				WHERE: {
					AND: [
						{
							OR: [
								{GT: {sections_avg: 90}},
								{LT: {sections_fail: 1}}
							]
						},
						{
							AND: [
								{NOT: {IS: {sections_title: "* *"}}},
								{EQ: {sections_year: 2016}}
							]
						},
						{
							OR: [
								{GT: {sections_pass: 40}}
							]
						}
					]
				},
				OPTIONS: {
					COLUMNS: [
						"sections_uuid",
					]
				}
			});
		}).then((sectionlist) => {
			expect(sectionlist).to.have.length(9);
		});
});

it("a simple query, should reject with ResultTooLargeError", async function () {
	let insightFacade: InsightFacade = new InsightFacade();
	return insightFacade.addDataset("sections", datasetContents.get("sections") ?? "", InsightDatasetKind.Sections)
		.then(() => {
			return insightFacade.performQuery({
				WHERE: {
					GT: {sections_avg: 70}
				},
				OPTIONS: {
					COLUMNS: [
						"sections_dept",
						"sections_avg"
					],
					ORDER: "sections_avg"
				}
			});
		}).catch((err) => {
			expect(err).to.be.instanceOf(ResultTooLargeError);
		});
});

it("a complex query, testing OR", function () {
	let insightFacade: InsightFacade = new InsightFacade();
	return insightFacade.addDataset("sections", datasetContents.get("sections") ?? "", InsightDatasetKind.Sections)
		.then(() => {
			return insightFacade.performQuery({
				WHERE: {
					OR: [
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
			console.log(sectionlist);
			expect(sectionlist).to.have.length(3344);
		});
});

it("a complex query, testing EQ", function () {
	let insightFacade: InsightFacade = new InsightFacade();
	return insightFacade.addDataset("sections", datasetContents.get("sections") ?? "", InsightDatasetKind.Sections)
		.then(() => {
			return insightFacade.performQuery({
				WHERE: {
					EQ: {
						sections_avg: 95
					}
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
			console.log(sectionlist);
			expect(sectionlist).to.have.length(41);
		});
});

it("a simple query, should return results -> Testing Integration", async function () {
	let queryProps: QueryProps;
	let query: IQuery;
	let sectionlist: InsightResult[];
	queryProps = await Query.parseQuery({
		WHERE: {
			GT: {
				sections_avg: 99
			}
		},
		OPTIONS: {
			COLUMNS: [
				"sections_dept",
				"sections_avg"
			],
			ORDER: "sections_avg"
		}
	});
	query = queryProps.query;
	dataset = await Dataset.parseDataset(
		"sections", datasetContents.get("sections") ?? "", InsightDatasetKind.Sections);
	sectionlist = await Query.processQuery(query, dataset);
	expect(sectionlist).to.have.length(3);
});

it("a complex query, testing integration", function () {
	let insightFacade: InsightFacade = new InsightFacade();
	return insightFacade.addDataset("sections", datasetContents.get("sections") ?? "", InsightDatasetKind.Sections)
		.then(() => {
			return insightFacade.performQuery({
				WHERE: {
					OR: [
						{
							AND: [
								{GT: {sections_avg: 90}},
								{IS: {sections_dept: "adhe"}
								}
							]
						},
						{EQ: {sections_avg: 95}}
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
			console.log(sectionlist);
			expect(sectionlist).to.have.length(56);
		});
});
