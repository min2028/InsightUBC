import {
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
	ResultTooLargeError
} from "../../src/controller/IInsightFacade";
import InsightFacade from "../../src/controller/InsightFacade";

import * as fs from "fs-extra";

import {folderTest} from "@ubccpsc310/folder-test";
import chai, {expect} from "chai";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);

describe("[ InsightFacade.spec.ts ]", function () {
	let insightFacade: InsightFacade;
	let smallSectionsContent: string;

	const persistDirectory = "./data";
	const datasetContents = new Map<string, string>();

	// Reference any datasets you've added to test/resources/archives here and they will
	// automatically be loaded in the 'before' hook.
	const datasetsToLoad: {[key: string]: string} = {
		// Sections Test Datasets
		sections: "./test/resources/archives/courses/pair.zip",
		invalidDir: "./test/resources/archives/courses/rtdirwrong.zip",
		notInJsonfile: "./test/resources/archives/courses/notinjson.zip",
		noValidSec: "./test/resources/archives/courses/novalidsec.zip",
		skipFiles: "./test/resources/archives/courses/skipfiles.zip",
		valid_small: "./test/resources/archives/courses/valid-small.zip",
		valid_singleSection: "./test/resources/archives/courses/valid-singleSection.zip",
		invalid_course: "./test/resources/archives/courses/invalid-course.zip",
		invalid_empty: "./test/resources/archives/courses/invalid-empty.zip",
		invalid_name: "./test/resources/archives/courses/invalid-name.zip",
		invalid_section: "./test/resources/archives/courses/invalid-section.zip",
		invalid_structure: "./test/resources/archives/courses/invalid-structure.zip",

		// Rooms Test Datasets
		rooms: "./test/resources/archives/rooms/rooms.zip",
		rooms_valid_oneRoom: "./test/resources/archives/rooms/valid-oneRoom.zip",
		rooms_valid_small: "./test/resources/archives/rooms/valid-small.zip",
		rooms_valid_defaultSeat: "./test/resources/archives/rooms/valid-defaultSeat.zip",
		rooms_invalid_noIndex: "./test/resources/archives/rooms/invalid-noIndex.zip",
		rooms_invalid_extraFolder: "./test/resources/archives/rooms/invalid-extraFolder.zip",
		rooms_invalid_noRoom: "./test/resources/archives/rooms/invalid-noRoom.zip",
		rooms_invalid_noBuidling: "./test/resources/archives/rooms/invalid-noBuilding.zip",
		rooms_invalid_notRoot: "./test/resources/archives/rooms/invalid-notRoot.zip",
		rooms_invalid_wrongClassName: "./test/resources/archives/rooms/invalid-wrongClassName.zip"
	};

	before(function () {
		// This section runs once and loads all datasets specified in the datasetsToLoad object
		for (const key of Object.keys(datasetsToLoad)) {
			const content = fs.readFileSync(datasetsToLoad[key]).toString("base64");
			datasetContents.set(key, content);
		}
		smallSectionsContent = datasetContents.get("valid_small") ?? "";
		// Just in case there is anything hanging around from a previous run of the test suite
		fs.removeSync(persistDirectory);
	});

	after(function () {
		console.info("==========================================================\n");
	});

	describe("~~~~~Sections Dataset~~~~~", function () {
		describe("addDataset", function () {
			after(function () {
				console.info();
			});

			beforeEach(function () {
				// This section resets the insightFacade instance
				// This runs before each test
				insightFacade = new InsightFacade();
			});

			afterEach(function () {
				// This section resets the data directory (removing any cached data)
				// This runs after each test, which should make each test independent of the previous one
				fs.removeSync(persistDirectory);
			});

			describe("C1's", function () {
				// This is a unit test. You should create more like this!
				it("Should add a valid dataset", function () {
					const id: string = "sections";
					const content: string = datasetContents.get("sections") ?? "";
					const expected: string[] = [id];
					return insightFacade.addDataset(id, content, InsightDatasetKind.Sections)
						.then((result: string[]) => expect(result).to.deep.equal(expected));
				});
			});

			describe("Min's", function () {
				it("should add dataset successfully", async function () {
					const insightDatasets = await insightFacade.addDataset(
						"courses", datasetContents.get("sections") ?? "", InsightDatasetKind.Sections
					);
					expect(insightDatasets).to.be.instanceof(Array);
					expect(insightDatasets).to.deep.equal(["courses"]);
					const [insightDataset] = insightDatasets;
					expect(insightDataset).to.be.a("string");
				});

				it("should successfully add two datasets", function () {
					return insightFacade.addDataset(
						"courses", smallSectionsContent, InsightDatasetKind.Sections
					)
						.then(() => {
							return insightFacade.addDataset(
								"courses-2", smallSectionsContent, InsightDatasetKind.Sections
							);
						})
						.then((insightDatasetIDs) => {
							expect(insightDatasetIDs).to.be.instanceof(Array);
							expect(insightDatasetIDs).to.have.length(2);
							const expectedIDs = ["courses", "courses-2"];
							expect(expectedIDs).to.have.deep.members(insightDatasetIDs);
						});
				});

				it("should reject the dataset with whitespace only id", function () {
					return insightFacade.addDataset(
						" ", smallSectionsContent, InsightDatasetKind.Sections
					)
						.catch((err) =>
							expect(err).to.be.instanceof(InsightError));
				});

				it("should reject the dataset with underscore in id", function () {
					return insightFacade.addDataset(
						"a_b", smallSectionsContent, InsightDatasetKind.Sections
					)
						.catch((err) =>
							expect(err).to.be.instanceof(InsightError));
				});

				it("should reject dataset with the existing id", function () {
					return insightFacade.addDataset(
						"courses", smallSectionsContent, InsightDatasetKind.Sections
					)
						.then(() => {
							return insightFacade.addDataset(
								"courses", smallSectionsContent, InsightDatasetKind.Sections
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

			describe("Payam's", function () {
				it("simple valid add (small dataset) -> should add the dataset", async function () {
					const result = await insightFacade.addDataset("small",
						smallSectionsContent, InsightDatasetKind.Sections);
					expect(result).to.deep.equal(["small"]);
					const list = await insightFacade.listDatasets();
					expect(list).to.deep.equal([{
						id: "small",
						kind: InsightDatasetKind.Sections,
						numRows: 39
					}] as InsightDataset[]);
				});

				it("simple valid add (large dataset) -> should add the dataset", async function () {
					const content = datasetContents.get("sections") ?? "";
					const result = await insightFacade.addDataset("large", content, InsightDatasetKind.Sections);
					expect(result).to.deep.equal(["large"]);
					const list = await insightFacade.listDatasets();
					expect(list).to.deep.equal([{
						id: "large",
						kind: InsightDatasetKind.Sections,
						numRows: 64612
					}] as InsightDataset[]);
				});

				it("valid id of symbols -> should add the dataset", function () {
					const result = insightFacade.addDataset(
						"ABC abc 0123 @.,&^%$#@!-=+?<>:[]{}() ",
						smallSectionsContent,
						InsightDatasetKind.Sections
					);
					return expect(result).eventually.to.deep.equal(["ABC abc 0123 @.,&^%$#@!-=+?<>:[]{}() "]);
				});

				it("similar id -> should add both datasets", async function () {
					const firstAdd = await insightFacade.addDataset("myID",
						smallSectionsContent, InsightDatasetKind.Sections);
					expect(firstAdd).to.have.length(1);

					const secondAdd = await insightFacade.addDataset("MyID",
						smallSectionsContent, InsightDatasetKind.Sections);
					expect(secondAdd).to.have.length(2);
					expect(secondAdd).to.have.deep.members(["myID", "MyID"]);

					const list = await insightFacade.listDatasets();
					expect(list).to.have.length(2);
					expect(list).to.have.deep.members([
						{
							id: "myID",
							kind: InsightDatasetKind.Sections,
							numRows: 39
						},
						{
							id: "MyID",
							kind: InsightDatasetKind.Sections,
							numRows: 39
						}
					] as InsightDataset[]);
				});

				it("valid content (single section) -> should add the dataset", async function () {
					const content = datasetContents.get("valid_singleSection") ?? "";
					const result = await insightFacade.addDataset("single", content, InsightDatasetKind.Sections);
					expect(result).to.deep.equal(["single"]);

					const list = await insightFacade.listDatasets();
					expect(list).to.have.length(1);
					expect(list).to.deep.equal([
						{
							id: "single",
							kind: InsightDatasetKind.Sections,
							numRows: 1
						}
					] as InsightDataset[]);
				});

				it("invalid id (whitespace 1) -> should reject with InsightError", function () {
					const result = insightFacade.addDataset(" ", smallSectionsContent, InsightDatasetKind.Sections);
					return expect(result).eventually.to.be.rejectedWith(InsightError);
				});

				it("invalid id (whitespace 2) -> should reject with InsightError", function () {
					const result = insightFacade.addDataset("\n\t ", smallSectionsContent, InsightDatasetKind.Sections);
					return expect(result).eventually.to.be.rejectedWith(InsightError);
				});

				it("invalid id (underscore 1) -> should reject with InsightError", function () {
					const result = insightFacade.addDataset("_", smallSectionsContent, InsightDatasetKind.Sections);
					return expect(result).eventually.to.be.rejectedWith(InsightError);
				});

				it("invalid id (underscore 2) -> should reject with InsightError", function () {
					const result = insightFacade.addDataset("_a_", smallSectionsContent, InsightDatasetKind.Sections);
					return expect(result).eventually.to.be.rejectedWith(InsightError);
				});

				it("invalid id (underscore 3) -> should reject with InsightError", function () {
					const result = insightFacade.addDataset("validId._", smallSectionsContent,
						InsightDatasetKind.Sections);
					return expect(result).eventually.to.be.rejectedWith(InsightError);
				});

				it("invalid id (empty) -> should reject with InsightError", function () {
					const result = insightFacade.addDataset("", smallSectionsContent, InsightDatasetKind.Sections);
					return expect(result).eventually.to.be.rejectedWith(InsightError);
				});

				it("same id (consecutive) -> should reject with InsightError", async function () {
					const firstAdd = await insightFacade.addDataset(
						"same ID", smallSectionsContent, InsightDatasetKind.Sections);
					expect(firstAdd).to.have.length(1);
					expect(firstAdd).to.deep.equal(["same ID"]);

					try {
						await insightFacade.addDataset("same ID", smallSectionsContent, InsightDatasetKind.Sections);
						expect.fail("Should have not reached this line");
					} catch (err) {
						expect(err).to.be.instanceof(InsightError);
					}

					const list = await insightFacade.listDatasets();
					expect(list).to.have.length(1);
					expect(list).to.deep.equal([
						{
							id: "same ID",
							kind: InsightDatasetKind.Sections,
							numRows: 39
						}
					] as InsightDataset[]);
				});

				it("same id (non-consecutive) -> should reject with InsightError", async function () {
					const firstAdd = await insightFacade.addDataset(
						"same ID", smallSectionsContent, InsightDatasetKind.Sections);
					expect(firstAdd).to.have.length(1);
					expect(firstAdd).to.deep.equal(["same ID"]);

					const secondAdd = await insightFacade.addDataset(
						"different ID 1",
						smallSectionsContent,
						InsightDatasetKind.Sections
					);
					expect(secondAdd).to.have.length(2);
					expect(secondAdd).to.have.deep.members(["same ID", "different ID 1"]);

					try {
						await insightFacade.addDataset("same ID", smallSectionsContent, InsightDatasetKind.Sections);
						expect.fail("Should have not reached this line");
					} catch (err) {
						expect(err).to.be.instanceof(InsightError);
					}

					const fourthAdd = await insightFacade.addDataset(
						"different ID 2",
						smallSectionsContent,
						InsightDatasetKind.Sections
					);
					expect(fourthAdd).to.have.length(3);
					expect(fourthAdd).to.have.deep.members(["same ID", "different ID 1", "different ID 2"]);

					const list = await insightFacade.listDatasets();
					expect(list).to.have.length(3);
					expect(list).to.have.deep.members([
						{
							id: "same ID",
							kind: InsightDatasetKind.Sections,
							numRows: 39
						},
						{
							id: "different ID 1",
							kind: InsightDatasetKind.Sections,
							numRows: 39
						},
						{
							id: "different ID 2",
							kind: InsightDatasetKind.Sections,
							numRows: 39
						}
					] as InsightDataset[]);
				});

				it("invalid content (bad folder structure) -> should reject with InsightError", function () {
					const content = datasetContents.get("invalid_structure") ?? "";
					const result = insightFacade.addDataset("badZip", content, InsightDatasetKind.Sections);
					return expect(result).eventually.to.be.rejectedWith(InsightError);
				});

				it("invalid content (empty file) -> should reject with InsightError", function () {
					const content = datasetContents.get("invalid_empty") ?? "";
					const result = insightFacade.addDataset("badZip", content, InsightDatasetKind.Sections);
					return expect(result).eventually.to.be.rejectedWith(InsightError);
				});

				it("invalid content (wrong name) -> should reject with InsightError", function () {
					const content = datasetContents.get("invalid_name") ?? "";
					const result = insightFacade.addDataset("badZip", content, InsightDatasetKind.Sections);
					return expect(result).eventually.to.be.rejectedWith(InsightError);
				});

				it("invalid content (invalid JSON format) -> should reject with InsightError", function () {
					const content = datasetContents.get("invalid_course") ?? "";
					const result = insightFacade.addDataset("badZip", content, InsightDatasetKind.Sections);
					return expect(result).eventually.to.be.rejectedWith(InsightError);
				});

				it("invalid content (incomplete section data) -> should reject with InsightError", function () {
					const content = datasetContents.get("invalid_section") ?? "";
					const result = insightFacade.addDataset("badZip", content, InsightDatasetKind.Sections);
					return expect(result).eventually.to.be.rejectedWith(InsightError);
				});
			});
		});

		describe("removeDataset", function () {
			after(function () {
				console.info();
			});

			beforeEach(function () {
				fs.removeSync(persistDirectory);
				insightFacade = new InsightFacade();
			});

			describe("Min's", function () {
				it("successful removal", function () {
					return insightFacade.addDataset(
						"courses", smallSectionsContent, InsightDatasetKind.Sections
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
						"courses", smallSectionsContent, InsightDatasetKind.Sections
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
			});

			describe("Payam's", function () {
				it("simple valid remove -> should remove dataset", async function () {
					let list: InsightDataset[];
					const added = await insightFacade.addDataset(
						"courses2022", smallSectionsContent, InsightDatasetKind.Sections);
					expect(added).to.deep.equal(["courses2022"]);

					list = await insightFacade.listDatasets();
					expect(list).to.deep.equal([{
						id: "courses2022",
						kind: InsightDatasetKind.Sections,
						numRows: 39
					}] as InsightDataset[]);

					const removed = await insightFacade.removeDataset("courses2022");
					expect(removed).to.equals("courses2022");
					list = await insightFacade.listDatasets();
					expect(list).to.deep.equal([]);
				});

				it("multiple alternating add and remove -> should remove dataset", function () {
					let promiseList: Array<Promise<any>> = [];
					for (let i = 0; i < 5; i++) {
						promiseList.push(insightFacade.addDataset(
							"sameID", smallSectionsContent, InsightDatasetKind.Sections)
							.then(() => insightFacade.removeDataset("sameID"))
							.then(() => insightFacade.listDatasets())
							.catch(() => expect.fail("Should have not thrown an error."))
						);
					}
					const results = Promise.all(promiseList);
					return expect(results).to.eventually.deep.equal([[], [], [], [], []]);
				});

				it("multiple consecutive removes -> should remove dataset", async function () {
					let expectedList: any[] = [];
					let promiseList: Array<Promise<any>> = [];
					let resultsList: any[];

					for (let i = 1; i <= 5; i++) {
						promiseList.push(
							insightFacade.addDataset(i.toString(), smallSectionsContent, InsightDatasetKind.Sections));
						expectedList.push({
							id: i.toString(),
							kind: InsightDatasetKind.Sections,
							numRows: 39
						} as InsightDataset);
					}
					resultsList = await Promise.all(promiseList);
					expect(resultsList).to.deep.include(expectedList.map((item) => item.id));
					expect(resultsList).to.have.length(5);
					let list: InsightDataset[] = await insightFacade.listDatasets();
					expect(list).to.have.deep.members(expectedList as InsightDataset[]);
					expect(list).to.have.length(5);

					promiseList = [];
					expectedList = [];

					for (let i = 1; i <= 5; i++) {
						promiseList.push(insightFacade.removeDataset(i.toString()));
						expectedList.push(i.toString());
					}
					resultsList = await Promise.all(promiseList);
					expect(resultsList).to.deep.equals(expectedList);
					expect(resultsList).to.have.length(5);
					list = await insightFacade.listDatasets();
					expect(list).to.deep.equal([]);
				});

				it("remove invalid id (whitespace) -> should reject with InsightError", async function () {
					await insightFacade.addDataset("id", smallSectionsContent, InsightDatasetKind.Sections);
					const result = insightFacade.removeDataset("\n \t");
					return expect(result).eventually.to.be.rejectedWith(InsightError);
				});

				it("remove invalid id (underscore) -> should reject with InsightError", async function () {
					await insightFacade.addDataset("id", smallSectionsContent, InsightDatasetKind.Sections);
					const result = insightFacade.removeDataset("a_");
					return expect(result).eventually.to.be.rejectedWith(InsightError);
				});

				it("remove invalid id (empty) -> should reject with InsightError", async function () {
					await insightFacade.addDataset("id", smallSectionsContent, InsightDatasetKind.Sections);
					const result = insightFacade.removeDataset("");
					return expect(result).eventually.to.be.rejectedWith(InsightError);
				});

				it("remove invalid id (different) -> should reject with NotFoundError", async function () {
					await insightFacade.addDataset("id", smallSectionsContent, InsightDatasetKind.Sections);
					const result = insightFacade.removeDataset("iD");
					return expect(result).eventually.to.be.rejectedWith(NotFoundError);
				});

				it("remove from empty -> should reject with NotFoundError", function () {
					const result = insightFacade.removeDataset("1");
					return expect(result).eventually.to.be.rejectedWith(NotFoundError);
				});
			});
		});

		describe("listDatasets", function () {
			after(function () {
				console.info();
			});

			beforeEach(function () {
				fs.removeSync(persistDirectory);
				insightFacade = new InsightFacade();
			});

			describe("Min's", function () {
				it("should list no datasets", function () {
					return insightFacade.listDatasets().then((insightDatasets) => {
						expect(insightDatasets).to.deep.equal([]);
					});
				});

				it("should list one dataset", function () {
					// 1. add dataset

					return insightFacade.addDataset(
						"courses", smallSectionsContent, InsightDatasetKind.Sections
					)
						// 2. list dataset
						.then(() => insightFacade.listDatasets())
						.then((insightDatasets) => {
							expect(insightDatasets).to.deep.equal([{
								id: "courses",
								kind: InsightDatasetKind.Sections,
								numRows: 39,
							}]);
							expect(insightDatasets).to.be.an.instanceof(Array);
							expect(insightDatasets).to.have.length(1);
						});
				});

				it("should list multiple dataset", function () {
					return insightFacade.addDataset(
						"courses", smallSectionsContent, InsightDatasetKind.Sections
					)
						.then(() => {
							return insightFacade.addDataset(
								"courses-2", smallSectionsContent, InsightDatasetKind.Sections
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
									numRows: 39,
								},
								{
									id: "courses-2",
									kind: InsightDatasetKind.Sections,
									numRows: 39,
								}
							];
							expect(insightDatasets).to.be.an.instanceof(Array);
							expect(insightDatasets).to.have.deep.members(expectedDatasets);
							expect(insightDatasets).to.have.length(2);
						});
				});
			});

			describe("Payam's", function () {
				it("list before adding -> should return empty list", function () {
					const list = insightFacade.listDatasets();
					return expect(list).eventually.to.deep.equal([]);
				});

				it("[Modified] list multiple datasets -> should return list", async function () {
					let expectedList: InsightDataset[] = [];
					let promiseList: any[] = [];

					for (let i = 1; i <= 5; i++) {
						promiseList.push(
							insightFacade.addDataset(i.toString(), smallSectionsContent, InsightDatasetKind.Sections));
						expectedList.push({
							id: i.toString(),
							kind: InsightDatasetKind.Sections,
							numRows: 39
						} as InsightDataset);
					}
					await Promise.all(promiseList);
					const list = await insightFacade.listDatasets();
					expect(list).to.have.deep.members(expectedList as InsightDataset[]);
					expect(list).to.have.length(5);
				});
			});
		});

		describe("performQuery - special case", function () {
			before(function () {
				insightFacade = new InsightFacade();
			});

			after(function () {
				console.info();
				fs.removeSync(persistDirectory);
			});

			const simpleValidQuery: unknown = {
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
			};

			it("query before adding dataset -> should reject with InsightError", function () {
				const result = insightFacade.performQuery(simpleValidQuery);
				return expect(result).eventually.to.be.rejectedWith(InsightError);
			});
		});

		/*
		 * This test suite dynamically generates tests from the JSON files in test/resources/queries.
		 * You should not need to modify it; instead, add additional files to the queries directory.
		 * You can still make tests the normal way, this is just a convenient tool for a majority of queries.
		 */
		describe("performQuery", () => {
			before(function () {
				insightFacade = new InsightFacade();

				// Load the datasets specified in datasetsToQuery and add them to InsightFacade.
				// Will *fail* if there is a problem reading ANY dataset.
				const loadDatasetPromises = [
					insightFacade.addDataset(
						"sections",
						datasetContents.get("sections") ?? "",
						InsightDatasetKind.Sections
					),
					insightFacade.addDataset(
						"validSmall",
						datasetContents.get("valid_small") ?? "",
						InsightDatasetKind.Sections
					),
					insightFacade.addDataset(
						"boss",
						datasetContents.get("sections") ?? "",
						InsightDatasetKind.Sections
					),
					insightFacade.addDataset(
						"rooms",
						datasetContents.get("rooms") ?? "",
						InsightDatasetKind.Rooms
					)
				];

				return Promise.all(loadDatasetPromises);
			});

			after(function () {
				console.info();
				fs.removeSync(persistDirectory);
			});

			type PQErrorKind = "ResultTooLargeError" | "InsightError";
			type Output = any[];

			function assertResult(actual: any, expected: Output): void {
				expect(actual).to.have.deep.members(expected);
			}

			folderTest<unknown, Promise<InsightResult[]>, PQErrorKind>(
				"Dynamic InsightFacade PerformQuery tests",
				(input) => insightFacade.performQuery(input),
				"./test/resources/queries/courses",
				{
					assertOnResult: assertResult,
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

	describe("~~~~~Rooms Dataset~~~~~", function () {
		describe("addDataset", function () {
			after(function () {
				console.info();
			});

			beforeEach(function () {
				fs.removeSync(persistDirectory);
				insightFacade = new InsightFacade();
			});

			it("should add RoomsDataset successfully, 1", async function () {
				const insightDatasets = await insightFacade.addDataset(
					"rooms", datasetContents.get("rooms") ?? "", InsightDatasetKind.Rooms
				);
				expect(insightDatasets).to.be.instanceof(Array);
				expect(insightDatasets).to.deep.equal(["rooms"]);
				const [insightDataset] = insightDatasets;
				expect(insightDataset).to.be.a("string");
			});

			it("should add Rooms and Course Dataset successfully", async function () {
				await insightFacade.addDataset(
					"rooms", datasetContents.get("rooms") ?? "", InsightDatasetKind.Rooms
				);
				let insightDatasets = await insightFacade.addDataset(
					"sections", datasetContents.get("sections") ?? "", InsightDatasetKind.Sections
				);
				expect(insightDatasets).to.be.instanceof(Array);
				expect(insightDatasets).to.deep.equal(["rooms", "sections"]);
				expect(insightDatasets).to.have.length(2);
				return insightFacade.listDatasets()
					.then((result) => {
						expect(result).to.deep.equal(
							[
								{
									id: "rooms",
									kind: InsightDatasetKind.Rooms,
									numRows: 364
								},{
									id: "sections",
									kind: InsightDatasetKind.Sections,
									numRows: 39
								}
							]
						);
					});
			});

			it("valid id of symbols -> should add the room dataset", function () {
				const result = insightFacade.addDataset(
					"ABC abc 0123 @.,&^%$#@!-=+?<>:[]{}() ",
					datasetContents.get("rooms") ?? "",
					InsightDatasetKind.Rooms
				);
				return expect(result).eventually.to.deep.equal(["ABC abc 0123 @.,&^%$#@!-=+?<>:[]{}() "]);
			});

			it("invalid dataset type (room content) -> should reject",  function () {
				const result = insightFacade.addDataset(
					"wrongType",
					datasetContents.get("rooms") ?? "",
					InsightDatasetKind.Sections
				);
				// return expect(result).eventually.to.deep.equal(["wrongType"]);
				return expect(result).eventually.to.be.rejectedWith(InsightError);
			});

			it("invalid dataset type (section content) -> should reject", function () {
				const result = insightFacade.addDataset(
					"wrongType",
					smallSectionsContent,
					InsightDatasetKind.Rooms
				);
				return expect(result).eventually.to.be.rejectedWith(InsightError);
			});

			it("invalid no index file -> should reject", function () {
				const invalidDataset = insightFacade.addDataset(
					"rooms", datasetContents.get("rooms_invalid_noIndex") ?? "", InsightDatasetKind.Rooms
				);
				return expect(invalidDataset).eventually.to.be.rejectedWith(InsightError);
			});

			it("invalid folder structure -> should reject", function () {
				const invalidDataset = insightFacade.addDataset(
					"rooms", datasetContents.get("rooms_invalid_extraFolder") ?? "", InsightDatasetKind.Rooms
				);
				return expect(invalidDataset).eventually.to.be.rejectedWith(InsightError);
			});

			it("invalid no Room in buildings -> should reject", function () {
				const invalidDataset = insightFacade.addDataset(
					"rooms", datasetContents.get("rooms_invalid_noRoom") ?? "", InsightDatasetKind.Rooms
				);
				return expect(invalidDataset).eventually.to.be.rejectedWith(InsightError);
			});

			it("invalid no building file -> should reject", function () {
				const invalidDataset = insightFacade.addDataset(
					"rooms", datasetContents.get("rooms_invalid_noBuidling") ?? "", InsightDatasetKind.Rooms
				);
				return expect(invalidDataset).eventually.to.be.rejectedWith(InsightError);
			});

			it("invalid not in root -> should reject", function () {
				const invalidDataset = insightFacade.addDataset(
					"rooms", datasetContents.get("rooms_invalid_notRoot") ?? "", InsightDatasetKind.Rooms
				);
				return expect(invalidDataset).eventually.to.be.rejectedWith(InsightError);
			});

			// Payam: Asked a question about this on piazza @923. Not sure what the proper functionality should be
			// it("invalid wrong data classname -> should reject", function () {
			// 	const invalidDataset = insightFacade.addDataset(
			// 		"rooms", datasetContents.get("rooms_invalid_wrongClassName") ?? "", InsightDatasetKind.Rooms
			// 	);
			// 	return expect(invalidDataset).eventually.to.be.rejectedWith(InsightError);
			// });

			it("valid with only one room -> should add a dataset with one room", async function () {
				const validDataset = await insightFacade.addDataset(
					"singleRoom", datasetContents.get("rooms_valid_oneRoom") ?? "", InsightDatasetKind.Rooms
				);
				expect(validDataset).to.deep.equal(["singleRoom"]);
				const list = await insightFacade.listDatasets();
				expect(list).to.deep.equal([{
					id: "singleRoom",
					kind: InsightDatasetKind.Rooms,
					numRows: 1
				} as InsightDataset]);
			});

			// Payam: not sure how to deal with seats number that is negative or non-integer
			it("valid with bad room seat count -> rooms seat should default to 0", async function () {
				const validDataset = await insightFacade.addDataset(
					"rooms", datasetContents.get("rooms_valid_defaultSeat") ?? "", InsightDatasetKind.Rooms
				);
				expect(validDataset).to.deep.equal(["rooms"]);
				const list = await insightFacade.listDatasets();
				expect(list).to.deep.equal([{
					id: "rooms",
					kind: InsightDatasetKind.Rooms,
					numRows: 5
				} as InsightDataset]);
				const queryResults = await insightFacade.performQuery({
					WHERE: {},
					OPTIONS: {
						COLUMNS: [
							"rooms_name",
							"rooms_href",
							"rooms_seats"
						]
					}
				});
				// console.log(queryResults);
				for(let room of queryResults) {
					expect(typeof room.rooms_seats).to.equal("number");
				}
			});

			it("valid small index and building -> should add the small dataset", async function () {
				const validDataset = await insightFacade.addDataset(
					"small", datasetContents.get("rooms_valid_small") ?? "", InsightDatasetKind.Rooms
				);
				expect(validDataset).to.deep.equal(["small"]);
				const list = await insightFacade.listDatasets();
				expect(list).to.deep.equal([{
					id: "small",
					kind: InsightDatasetKind.Rooms,
					numRows: 6
				} as InsightDataset]);
			});
		});

		describe("removeDataset", function () {
			after(function () {
				console.info();
			});

			beforeEach(function () {
				fs.removeSync(persistDirectory);
				insightFacade = new InsightFacade();
			});

			it("should remove RoomsDataset successfully", async function () {
				await insightFacade.addDataset(
					"rooms", datasetContents.get("rooms_valid_small") ?? "", InsightDatasetKind.Rooms
				);
				await insightFacade.removeDataset("rooms");
				return insightFacade.listDatasets()
					.then((result) => {
						expect(result).to.deep.equal([]);
					});
			});
		});

		/*
		 * This test suite dynamically generates tests from the JSON files in test/resources/queries.
		 * You should not need to modify it; instead, add additional files to the queries directory.
		 * You can still make tests the normal way, this is just a convenient tool for a majority of queries.
		 */
		describe("performQuery", () => {
			before(function () {
				insightFacade = new InsightFacade();

				// Load the datasets specified in datasetsToQuery and add them to InsightFacade.
				// Will *fail* if there is a problem reading ANY dataset.
				const loadDatasetPromises = [
					insightFacade.addDataset(
						"sections",
						datasetContents.get("sections") ?? "",
						InsightDatasetKind.Sections
					),
					insightFacade.addDataset(
						"validSmall",
						datasetContents.get("valid_small") ?? "",
						InsightDatasetKind.Sections
					),
					insightFacade.addDataset(
						"boss",
						datasetContents.get("rooms") ?? "",
						InsightDatasetKind.Rooms
					),
					insightFacade.addDataset(
						"rooms",
						datasetContents.get("rooms") ?? "",
						InsightDatasetKind.Rooms
					)
				];
				return Promise.all(loadDatasetPromises);
			});

			after(function () {
				console.info();
				fs.removeSync(persistDirectory);
			});

			type PQErrorKind = "ResultTooLargeError" | "InsightError";
			type Output = any[];

			function assertResult(actual: any, expected: Output): void {
				expect(actual).to.deep.equal(expected);
			}

			folderTest<unknown, Promise<InsightResult[]>, PQErrorKind>(
				"Dynamic InsightFacade PerformQuery tests",
				(input) => insightFacade.performQuery(input),
				"./test/resources/queries/rooms",
				{
					assertOnResult: assertResult,
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
