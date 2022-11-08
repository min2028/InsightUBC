import {ICDataset} from "../../../src/model/CourseDataset/CDataset";
import * as fs from "fs-extra";
import chai, {expect} from "chai";
import chaiAsPromised from "chai-as-promised";
import {InsightDatasetKind, InsightError} from "../../../src/controller/IInsightFacade";
import InsightFacade from "../../../src/controller/InsightFacade";
import {checkWildCard, isValidKeyValuePair,
	isValidQueryKey, validateQuery} from "../../../src/model/Query/QueryValidator";
import {isValidId} from "../../../src/Utility/General";

chai.use(chaiAsPromised);

describe("[ QueryValidator.spec.ts ]", function () {
	const persistDirectory = "./data";
	const datasetContents = new Map<string, string>();
	const datasetsToLoad: {[key: string]: string} = {
		sections: "./test/resources/archives/courses/pair.zip",
		validquerytest: "./test/resources/archives/courses/validquerytest.zip",
		valid_small: "./test/resources/archives/courses/valid-small.zip"
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

	describe("validate complete query", function() {
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
			return insightFacade
				.addDataset("ubc", datasetContents.get("sections") ?? "", InsightDatasetKind.Sections)
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
	});

	describe("validate keys and value types", function () {
		it ("invalid id", function() {
			const res = isValidId("\n");
			return expect(res).to.be.false;
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

		it("testing SCOMP no string, should fail", function () {
			let insightFacade: InsightFacade = new InsightFacade();
			return insightFacade
				.addDataset("sections", datasetContents.get("sections") ?? "", InsightDatasetKind.Sections)
				.then(() => {
					return insightFacade.performQuery({
						WHERE: {
							AND: [
								{GT: {sections_avg: 97}},
								{IS: {sections_title: null}}
							]
						},
						OPTIONS: {
							COLUMNS: [
								"sections_dept",
								"sections_id"
							]
						}
					});
				}).then(() => {
					expect.fail("Should've returned error");
				}).catch((err) => {
					expect(err).to.be.instanceof(InsightError);
				});
		});
	});

	describe("validate wildcards", function () {

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
	});
});
