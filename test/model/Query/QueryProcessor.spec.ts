import {CDataset} from "../../../src/model/Dataset/CourseDataset/CDataset";
import * as fs from "fs-extra";
import chai, {expect} from "chai";
import chaiAsPromised from "chai-as-promised";
import {InsightDatasetKind, InsightResult, ResultTooLargeError,} from "../../../src/controller/IInsightFacade";
import InsightFacade from "../../../src/controller/InsightFacade";
import {processFILTER, processOptions} from "../../../src/model/Query/QueryProcessor";
import {IQuery, Query, QueryProps} from "../../../src/model/Query/Query";
import {IData, IDataset} from "../../../src/model/Dataset/IDataset";

chai.use(chaiAsPromised);

describe("[ QueryProcessor.spec.ts ]", function () {
	let dataset: IDataset;
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

	describe("process OPTIONS", function () {
		it("testing sort by number", async function () {
			let insightresultlist: InsightResult[];
			let dataList: IData[];
			dataset = await new CDataset().parseDataset("sections", datasetContents.get("valid_small") ?? "");
			dataList = processFILTER({
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
				}, dataList
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
			let dataList: IData[];
			dataset = await new CDataset().parseDataset("sections", datasetContents.get("valid_small") ?? "");
			dataList = processFILTER({
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
				}, dataList
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
			return insightFacade
				.addDataset("sections", datasetContents.get("sections") ?? "", InsightDatasetKind.Sections)
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
			return insightFacade
				.addDataset("sections", datasetContents.get("sections") ?? "", InsightDatasetKind.Sections)
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
	});

	describe("process individual FILTER", function () {
		it("testing processFILTER valid_small -> should return empty results", async function () {
			let dataList: IData[];
			dataset = await new CDataset().parseDataset(
				"sections", datasetContents.get("valid_small") ?? "");
			dataList = processFILTER({
				GT: {sections_avg: 97}
			}, dataset);
			expect(dataList).to.have.length(0);
		});

		it("testing AND with one item in the list", async function () {
			let dataList: IData[];
			dataset = await new CDataset().parseDataset(
				"sections", datasetContents.get("sections") ?? "");
			dataList = processFILTER({
				AND: [
					{
						IS: {sections_dept: "adhe"}
					}
				]
			}, dataset);
			expect(dataList).to.have.length(232);
		});

		it("testing OR with one item in the list", async function () {
			let dataList: IData[];
			dataset = await new CDataset().parseDataset(
				"sections", datasetContents.get("sections") ?? "");
			dataList = processFILTER({
				OR: [
					{
						IS: {sections_dept: "adhe"}
					}
				]
			}, dataset);
			expect(dataList).to.have.length(232);
		});

		it("testing AND with three item in the list", async function () {
			let dataList: IData[];
			dataset = await new CDataset().parseDataset(
				"sections", datasetContents.get("sections") ?? "");
			dataList = processFILTER({
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
			expect(dataList).to.have.length(14);
		});

		it("testing NOT with one item in the list", async function () {
			let dataList: IData[];
			dataset = await new CDataset().parseDataset(
				"sections", datasetContents.get("sections") ?? "");
			dataList = processFILTER({
				AND: [
					{
						NOT: {GT: {sections_avg: 40}}
					}
				]
			}, dataset);
			expect(dataList).to.have.length(12);
		});

		it("testing AND", async function () {
			let dataList: IData[];
			dataset = await new CDataset().parseDataset(
				"sections", datasetContents.get("sections") ?? "");
			dataList = processFILTER({
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
			expect(dataList).to.have.length(15);
		});

		it("testing OR", async function () {
			let dataList: IData[];
			dataset = await new CDataset().parseDataset(
				"sections", datasetContents.get("sections") ?? "");
			dataList = processFILTER({
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
			expect(dataList).to.have.length(3344);
		});

		it("SCOMP test, cpsc", async function () {
			let dataList: IData[];
			dataset = await new CDataset().parseDataset(
				"sections", datasetContents.get("valid_small") ?? "");
			dataList = processFILTER({
				IS: {
					sections_dept: "cpsc"
				}
			}, dataset);
			for (let filteredSection of dataList) {
				if (filteredSection.dept !== "cpsc") {
					expect.fail("filtering failed");
				}
			}
			expect(dataList).to.have.length(39);
		});

		it("SCOMP test, *cpsc*, should return length 39", async function () {
			let dataList: IData[];
			dataset = await new CDataset().parseDataset(
				"sections", datasetContents.get("valid_small") ?? "");
			dataList = processFILTER({
				IS: {
					sections_dept: "*cpsc*"
				}
			}, dataset);
			for (let filteredSection of dataList) {
				if (filteredSection.dept !== "cpsc") {
					expect.fail("filtering failed");
				}
			}
			expect(dataList).to.have.length(39);
		});

		it("SCOMP test on pair, adhe, should return length 232", async function () {
			let dataList: IData[];
			dataset = await new CDataset().parseDataset(
				"sections", datasetContents.get("sections") ?? "");
			dataList = processFILTER({
				IS: {
					sections_dept: "adhe"
				}
			}, dataset);
			for (let filteredSection of dataList) {
				if (filteredSection.dept !== "adhe") {
					expect.fail("filtering failed");
				}
			}
			expect(dataList).to.have.length(232);
		});

		it("SCOMP test on pair, abcd, should return length 0", async function () {
			let dataList: IData[];
			dataset = await new CDataset().parseDataset(
				"sections", datasetContents.get("sections") ?? "");
			dataList = processFILTER({
				IS: {
					sections_dept: "abcd"
				}
			}, dataset);
			expect(dataList).to.have.length(0);
		});

		it("SCOMP test on pair, a*, should return length 4652", async function () {
			let dataList: IData[];
			dataset = await new CDataset().parseDataset(
				"sections", datasetContents.get("sections") ?? "");
			dataList = processFILTER({
				IS: {
					sections_dept: "a*"
				}
			}, dataset);
			for (let filteredSection of dataList) {
				if (!(filteredSection.dept as string).startsWith("a")) {
					expect.fail("filtering failed");
				}
			}
			expect(dataList).to.have.length(4652);
		});

		it("SCOMP test, *a, should return length 1996", async function () {
			let dataList: IData[];
			dataset = await new CDataset().parseDataset(
				"sections", datasetContents.get("sections") ?? "");
			dataList = processFILTER({
				IS: {
					sections_dept: "*a"
				}
			}, dataset);
			for (let filteredSection of dataList) {
				if (!(filteredSection.dept as string).endsWith("a")) {
					expect.fail("filtering failed");
				}
			}
			expect(dataList).to.have.length(1996);
		});

		it("SCOMP test, *ps*, should return length 226", async function () {
			let dataList: IData[];
			dataset = await new CDataset().parseDataset(
				"sections", datasetContents.get("sections") ?? "");
			dataList = processFILTER({
				IS: {
					sections_instructor: "*ps*"
				}
			}, dataset);
			for (let filteredSection of dataList) {
				if (!(filteredSection.instructor as string).includes("ps")) {
					expect.fail("filtering failed");
				}
			}
			expect(dataList).to.have.length(226);
		});

		it("testing SCOMP *computer*, should return 80", function () {
			let insightFacade: InsightFacade = new InsightFacade();
			return insightFacade
				.addDataset("sections", datasetContents.get("sections") ?? "", InsightDatasetKind.Sections)
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
			return insightFacade
				.addDataset("sections", datasetContents.get("sections") ?? "", InsightDatasetKind.Sections)
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

		it("testing SCOMP *, should return 49", function () {
			let insightFacade: InsightFacade = new InsightFacade();
			return insightFacade
				.addDataset("sections", datasetContents.get("sections") ?? "", InsightDatasetKind.Sections)
				.then(() => {
					return insightFacade.performQuery({
						WHERE: {
							AND: [
								{GT: {sections_avg: 97}},
								{IS: {sections_title: "*"}}
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

		it("testing SCOMP empty string, should return length 0", function () {
			let insightFacade: InsightFacade = new InsightFacade();
			return insightFacade
				.addDataset("sections", datasetContents.get("sections") ?? "", InsightDatasetKind.Sections)
				.then(() => {
					return insightFacade.performQuery({
						WHERE: {
							AND: [
								{GT: {sections_avg: 97}},
								{IS: {sections_title: ""}}
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
					expect(sectionlist).to.have.length(0);
				});
		});
	});

	describe("process complete Query", function () {
		it("a very complex query", function () {
			let insightFacade: InsightFacade = new InsightFacade();
			return insightFacade
				.addDataset("sections", datasetContents.get("sections") ?? "", InsightDatasetKind.Sections)
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
			return insightFacade
				.addDataset("sections", datasetContents.get("sections") ?? "", InsightDatasetKind.Sections)
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
			return insightFacade
				.addDataset("sections", datasetContents.get("sections") ?? "", InsightDatasetKind.Sections)
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
					// console.log(sectionlist);
					expect(sectionlist).to.have.length(3344);
				});
		});

		it("a complex query, testing EQ", function () {
			let insightFacade: InsightFacade = new InsightFacade();
			return insightFacade
				.addDataset("sections", datasetContents.get("sections") ?? "", InsightDatasetKind.Sections)
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
					// console.log(sectionlist);
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
			dataset = await new CDataset().parseDataset(
				"sections", datasetContents.get("sections") ?? "");
			sectionlist = await Query.processQuery(query, dataset);
			expect(sectionlist).to.have.length(3);
		});

		it("a complex query, testing integration", function () {
			let insightFacade: InsightFacade = new InsightFacade();
			return insightFacade
				.addDataset("sections", datasetContents.get("sections") ?? "", InsightDatasetKind.Sections)
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
					// console.log(sectionlist);
					expect(sectionlist).to.have.length(56);
				}).catch((err) => expect.fail(`Should've not thrown this error: ${err}`));
		});
	});
});
