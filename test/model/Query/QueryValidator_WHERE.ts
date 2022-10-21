import {IDataset} from "../../../src/model/Dataset/Dataset";
import * as fs from "fs-extra";
import chai, {expect} from "chai";
import chaiAsPromised from "chai-as-promised";
import {InsightDatasetKind, InsightError} from "../../../src/controller/IInsightFacade";
import InsightFacade from "../../../src/controller/InsightFacade";
import {checkWildCard, isValidKeyValuePair,
	isValidQueryKey, validateQuery} from "../../../src/model/Query/QueryValidator";

chai.use(chaiAsPromised);

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

it("valid complex query -> Should pass the validation", function () {
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

it("valid query key -> Should pass the validation", function () {
	const result = isValidQueryKey("section_dept", "section");
	return expect(result).to.be.true;
});

it("valid keyValuePair string -> Should pass the validation", function () {
	const result = isValidKeyValuePair({sections_dept: "cpsc"}, "sections", "s");
	return expect(result).to.be.true;
});

it("valid keyValuePair numeric -> Should pass the validation", function () {
	const result = isValidKeyValuePair({sections_avg: 97.4}, "sections", "n");
	return expect(result).to.be.true;
});

it("valid simple query -> Should pass the validation", function () {
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

it("Query on dataset with different id -> should fail", function () {
	let insightFacade: InsightFacade = new InsightFacade();
	return insightFacade.addDataset("ubc", datasetContents.get("sections") ?? "", InsightDatasetKind.Sections)
		.then(() => {
			return insightFacade.performQuery({
				WHERE: {
					GT: {
						sections_avg: 70
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
		}).catch((err) => {
			expect(err).to.be.instanceOf(InsightError);
		});
});

it("test checkWildcard, *abc*d", function () {
	const result: boolean = checkWildCard("*abc*d");
	return expect(result).to.be.false;
});

it("test checkWildcard, d**", function () {
	const result: boolean = checkWildCard("d**");
	return expect(result).to.be.false;
});

it("test checkWildcard, abcd", function () {
	const result: boolean = checkWildCard("abcd");
	return expect(result).to.be.true;
});

it("test checkWildcard, *", function () {
	const result: boolean = checkWildCard("*");
	return expect(result).to.be.true;
});

it("test checkWildcard, **", function () {
	const result: boolean = checkWildCard("**");
	return expect(result).to.be.true;
});

it("test checkWildcard, ***", function () {
	const result: boolean = checkWildCard("***");
	return expect(result).to.be.false;
});
