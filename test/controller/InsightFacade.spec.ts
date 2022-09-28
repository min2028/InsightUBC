import {
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult, NotFoundError,
	ResultTooLargeError
} from "../../src/controller/IInsightFacade";
import InsightFacade from "../../src/controller/InsightFacade";

import * as fs from "fs-extra";

import {folderTest} from "@ubccpsc310/folder-test";
import {expect} from "chai";

describe("InsightFacade", function () {
	let insightFacade: InsightFacade;

	const persistDirectory = "./data";
	const datasetContents = new Map<string, string>();

	// Reference any datasets you've added to test/resources/archives here and they will
	// automatically be loaded in the 'before' hook.
	const datasetsToLoad: {[key: string]: string} = {
		pair: "./test/resources/archives/pair.zip",
		invalidDir: "./test/resources/archives/rtdirwrong.zip",
		notInJsonfile: "./test/resources/archives/notinjson.zip",
		noValidSec: "./test/resources/archives/novalidsec.zip",
		skipFiles: "./test/resources/archives/skipfiles.zip"
	};

	before(function () {
		// This section runs once and loads all datasets specified in the datasetsToLoad object
		for (const key of Object.keys(datasetsToLoad)) {
			const content = fs.readFileSync(datasetsToLoad[key]).toString("base64");
			datasetContents.set(key, content);
		}
		// Just in case there is anything hanging around from a previous run of the test suite
		fs.removeSync(persistDirectory);
	});

	describe("AKM tests", function () {
		describe("Add Dataset", function () {
			before(function () {
				console.info(`Before: ${this.test?.parent?.title}`);
			});

			beforeEach(function () {
				// This section resets the insightFacade instance
				// This runs before each test
				console.info(`BeforeTest: ${this.currentTest?.title}`);
				insightFacade = new InsightFacade();
			});

			after(function () {
				console.info(`After: ${this.test?.parent?.title}`);
			});

			afterEach(function () {
				// This section resets the data directory (removing any cached data)
				// This runs after each test, which should make each test independent of the previous one
				console.info(`AfterTest: ${this.currentTest?.title}`);
				fs.removeSync(persistDirectory);
			});

			// This is a unit test. You should create more like this!
			it("Should add a valid dataset", function () {
				const id: string = "sections";
				const content: string = datasetContents.get("sections") ?? "";
				const expected: string[] = [id];
				return insightFacade.addDataset(id, content, InsightDatasetKind.Sections)
					.then((result: string[]) => expect(result).to.deep.equal(expected));
			});

			it("should add dataset successfully", async function () {
				const insightDatasets = await insightFacade.addDataset(
					"courses", datasetContents.get("pair") ?? "", InsightDatasetKind.Sections
				);
				expect(insightDatasets).to.be.instanceof(Array);
				expect(insightDatasets).to.deep.equal(["courses"]);
				const [insightDataset] = insightDatasets;
				expect(insightDataset).to.be.a("string");
			});

			it("should successfully add two datasets", function () {
				return insightFacade.addDataset(
					"courses", datasetContents.get("pair") ?? "", InsightDatasetKind.Sections
				)
					.then(() => {
						return insightFacade.addDataset(
							"courses-2", datasetContents.get("pair") ?? "", InsightDatasetKind.Sections
						);
					})
					.then((insightDatasetIDs) => {
						expect(insightDatasetIDs).to.be.instanceof(Array);
						expect(insightDatasetIDs).to.have.length(2);
						const expectedIDs = ["courses", "courses-2"];
						expect(insightDatasetIDs).to.have.deep.members(expectedIDs);
					});
			});

			it("should reject the dataset with whitespace only id", function () {
				return insightFacade.addDataset(
					" ", datasetContents.get("pair") ?? "", InsightDatasetKind.Sections
				)
					.catch((err) =>
						expect(err).to.be.instanceof(InsightError));
			});

			it("should reject the dataset with underscore in id", function () {
				return insightFacade.addDataset(
					"a_b", datasetContents.get("pair") ?? "", InsightDatasetKind.Sections
				)
					.catch((err) =>
						expect(err).to.be.instanceof(InsightError));
			});

			it("should reject dataset with the existing id", function () {
				return insightFacade.addDataset(
					"courses", datasetContents.get("pair") ?? "", InsightDatasetKind.Sections
				)
					.then(() => {
						return insightFacade.addDataset(
							"courses", datasetContents.get("pair") ?? "", InsightDatasetKind.Sections
						);
					})
					.catch((err) =>
						expect(err).to.be.instanceof(InsightError));
			});

			it("courses/ root directory or else InsightError", function () {
				return insightFacade.addDataset(
					"ubc", datasetContents.get("invalidDir") ?? "", InsightDatasetKind.Sections
				)
					.catch((err) =>
						expect(err).to.be.instanceof(InsightError));
			});

			it("not in JSON format, invalid dataset will have InsightError", function () {
				return insightFacade.addDataset(
					"ubc", datasetContents.get("notInJsonfile") ?? "", InsightDatasetKind.Sections
				)
					.catch((err) =>
						expect(err).to.be.instanceof(InsightError));
			});

			it("no valid section, will be invalid data", function () {
				return insightFacade.addDataset(
					"ubc", datasetContents.get("novalidsec") ?? "", InsightDatasetKind.Sections
				)
					.catch((err) =>
						expect(err).to.be.instanceof(InsightError));
			});

			it("successful add but skip some files for insufficient query info", function () {
				return insightFacade.addDataset(
					"ubc", datasetContents.get("skipFiles") ?? "", InsightDatasetKind.Sections
				)
					.then(() => {
						return insightFacade.listDatasets();
					})
					.then((insightDatasets) => {
						const expectedDataset: InsightDataset[] = [{
							id: "ubc",
							kind: InsightDatasetKind.Sections,
							numRows: 5,
						}];
						expect(insightDatasets).to.be.instanceof(Array);
						expect(insightDatasets).to.have.length(1);
						expect(insightDatasets).to.deep.equal(expectedDataset);
					});
			});
		});

		describe("Remove/List Dataset", function () {
			before(function () {
				console.info(`Before: ${this.test?.parent?.title}`);
			});

			beforeEach(function () {
				// This section resets the insightFacade instance
				// This runs before each test
				console.info(`BeforeTest: ${this.currentTest?.title}`);
				insightFacade = new InsightFacade();
			});

			after(function () {
				console.info(`After: ${this.test?.parent?.title}`);
			});

			afterEach(function () {
				// This section resets the data directory (removing any cached data)
				// This runs after each test, which should make each test independent of the previous one
				console.info(`AfterTest: ${this.currentTest?.title}`);
				fs.removeSync(persistDirectory);
			});

			it("successful removal", function () {
				return insightFacade.addDataset(
					"courses", datasetContents.get("pair") ?? "", InsightDatasetKind.Sections
				)
					.then(() => {
						return insightFacade.removeDataset("courses");
					})
					.then((removedId) => {
						expect(removedId).to.equal("courses");
						expect(removedId).to.be.a("string");
					});
			});

			it("reject non existent dataset removal, NotFoundError", function () {
				return insightFacade.addDataset(
					"courses", datasetContents.get("pair") ?? "", InsightDatasetKind.Sections
				)
					.then(() => {
						return insightFacade.removeDataset("courses-2");
					})
					.catch((err) => {
						expect(err).to.be.instanceof(NotFoundError);
					});
			});

			it("reject with Insight Error if removing id is whitespace", function () {
				return insightFacade.removeDataset("  ")
					.catch((err) => {
						expect(err).to.be.instanceof(InsightError);
					});
			});

			it("reject with Insight Error if removing id containing underscore", function () {
				return insightFacade.removeDataset("ab_bc")
					.catch((err) => {
						expect(err).to.be.instanceof(InsightError);
					});
			});

			it("should list no datasets", function () {
				return insightFacade.listDatasets().then((insightDatasets) => {
					expect(insightDatasets).to.deep.equal([]);
				});

				// expect([]).to.equal([]) will always fail because asserting equality on two different objects
				// two different arrays that happen to have equal
				// deep.equal check if both are same kind of object and check individual properties
				// could do expect(insightDatasets).to.be.an.instanceof(Array);
				// expect(insightDatasets).to.have.length(0);
			});

			it("should list one dataset", function () {
				// 1. add dataset

				return insightFacade.addDataset(
					"courses", datasetContents.get("pair") ?? "", InsightDatasetKind.Sections
				)
					// 2. list dataset
					.then(() => insightFacade.listDatasets())
					.then((insightDatasets) => {
						expect(insightDatasets).to.deep.equal([{
							id: "courses",
							kind: InsightDatasetKind.Sections,
							numRows: 64612,
						}]);
						expect(insightDatasets).to.be.an.instanceof(Array);
						expect(insightDatasets).to.have.length(1);
					});
			});

			it("should list multiple dataset", function () {
				return insightFacade.addDataset(
					"courses", datasetContents.get("pair") ?? "", InsightDatasetKind.Sections
				)
					.then(() => {
						return insightFacade.addDataset(
							"courses-2", datasetContents.get("pair") ?? "", InsightDatasetKind.Sections
						);
					})
					.then(() => {
						return insightFacade.listDatasets();
					})
					.then((insightDatasets) => {
						const expectedDatasets: InsightDataset[] = [
							{
								id: "courses",
								kind: InsightDatasetKind.Sections,
								numRows: 64612,
							},
							{
								id: "courses-2",
								kind: InsightDatasetKind.Sections,
								numRows: 64612,
							}
						];
						expect(insightDatasets).to.be.an.instanceof(Array);
						expect(insightDatasets).to.have.deep.members(expectedDatasets);
						expect(insightDatasets).to.have.length(2);
					});
			});
		});
		/*
		 * This test suite dynamically generates tests from the JSON files in test/resources/queries.
		 * You should not need to modify it; instead, add additional files to the queries directory.
		 * You can still make tests the normal way, this is just a convenient tool for a majority of queries.
		 */
		describe("PerformQuery", () => {
			before(function () {
				console.info(`Before: ${this.test?.parent?.title}`);

				insightFacade = new InsightFacade();

				// Load the datasets specified in datasetsToQuery and add them to InsightFacade.
				// Will *fail* if there is a problem reading ANY dataset.
				const loadDatasetPromises = [
					insightFacade.addDataset(
						"sections",
						datasetContents.get("sections") ?? "",
						InsightDatasetKind.Sections
					),
				];

				return Promise.all(loadDatasetPromises);
			});

			after(function () {
				console.info(`After: ${this.test?.parent?.title}`);
				fs.removeSync(persistDirectory);
			});

			type PQErrorKind = "ResultTooLargeError" | "InsightError";

			folderTest<unknown, Promise<InsightResult[]>, PQErrorKind>(
				"Dynamic InsightFacade PerformQuery tests",
				(input): Promise<InsightResult[]> => insightFacade.performQuery(input),
				"./test/resources/queries",
				{
					errorValidator: (error): error is PQErrorKind =>
						error === "ResultTooLargeError" || error === "InsightError",
					assertOnError: (actual, expected) => {
						if (expected === "ResultTooLargeError") {
							expect(actual).to.be.instanceof(ResultTooLargeError);
						} else {
							expect(actual).to.be.instanceof(InsightError);
						}
					},
				}
			);
		});
	});
});

/*
	describe("InsightFacade", function () {

		describe("ValidQueryKeys API performQuery EBNF", function () {

			let insightFacade: IInsightFacade;

			before(async function () {
				clearDisk();
				insightFacade = new InsightFacade();
				let querytest: string = getContentFromArchives("pair.zip");
				let querytest2: string = getContentFromArchives("pair.zip");
				await insightFacade.addDataset("sections", querytest, InsightDatasetKind.Sections);
				await insightFacade.addDataset("ubc", querytest2, InsightDatasetKind.Sections);
			});

			function assertError(actual: any, expected: Error): void {
				if (expected === "InsightError") {
					expect(actual).to.be.instanceof(InsightError);
				} else if (expected === "ResultTooLargeError") {
					expect(actual).to.be.instanceof(ResultTooLargeError);
				}
			}

			function assertResult(actual: any, expected: Awaited<Output>) {
				expect(actual).to.have.deep.members(expected);
			}

			folderTest<Input, Output, Error>(
				"API ValidQueryKeys performQuery EBNF",
				(input: Input): Output => {
					return insightFacade.performQuery(input);
				},
				"./test/resources/json",
				{
					assertOnResult: assertResult,
					assertOnError: assertError,
				}
			);
		});
	});
});

 */
