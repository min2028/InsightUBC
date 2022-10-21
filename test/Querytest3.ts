//
// it("a complex complex query", function () {
// 	let insightFacade: InsightFacade = new InsightFacade();
// 	return insightFacade.addDataset("sections", datasetContents.get("sections") ?? "", InsightDatasetKind.Sections)
// 		.then(() => {
// 			return insightFacade.performQuery({
// 				WHERE: {
// 					AND: [
// 						{
// 							OR: [
// 								{
// 									GT: {
// 										sections_avg: 90
// 									}
// 								},
// 								{
// 									LT: {
// 										sections_fail: 1
// 									}
// 								}
// 							]
// 						},
// 						{
// 							AND: [
// 								{
// 									NOT: {
// 										IS: {
// 											sections_title: "* *"
// 										}
// 									}
// 								},
// 								{
// 									EQ: {
// 										sections_year: 2016
// 									}
// 								}
// 							]
// 						},
// 						{
// 							OR: [
// 								{
// 									GT: {
// 										sections_pass: 40
// 									}
// 								}
// 							]
// 						}
// 					]
// 				},
// 				OPTIONS: {
// 					COLUMNS: [
// 						"sections_uuid",
// 					]
// 				}
// 			});
// 		}).then((sectionlist) => {
// 			expect(sectionlist).to.have.length(9);
// 		});
// });
//
// it("testing AND", async function () {
// 	let sectionlist: ISection[];
// 	dataset = await Dataset.parseDataset(
// 		"sections", datasetContents.get("sections") ?? "", InsightDatasetKind.Sections);
// 	sectionlist = processFILTER({
// 		AND: [
// 			{
// 				GT: {
// 					sections_avg: 90
// 				}
// 			},
// 			{
// 				IS: {
// 					sections_dept: "adhe"
// 				}
// 			}
// 		]
// 	}, dataset);
// 	expect(sectionlist).to.have.length(15);
// });
//
// it("testing OR", async function () {
// 	let sectionlist: ISection[];
// 	dataset = await Dataset.parseDataset(
// 		"sections", datasetContents.get("sections") ?? "", InsightDatasetKind.Sections);
// 	sectionlist = processFILTER({
// 		OR: [
// 			{
// 				GT: {
// 					sections_avg: 90
// 				}
// 			},
// 			{
// 				IS: {
// 					sections_dept: "adhe"
// 				}
// 			}
// 		]
// 	}, dataset);
// 	expect(sectionlist).to.have.length(3344);
// });
//
// it("a complex query, testing EQ", function () {
// 	let insightFacade: InsightFacade = new InsightFacade();
// 	return insightFacade.addDataset("sections", datasetContents.get("sections") ?? "", InsightDatasetKind.Sections)
// 		.then(() => {
// 			return insightFacade.performQuery({
// 				WHERE: {
// 					EQ: {
// 						sections_avg: 95
// 					}
// 				},
// 				OPTIONS: {
// 					COLUMNS: [
// 						"sections_dept",
// 						"sections_id",
// 						"sections_avg"
// 					],
// 					ORDER: "sections_avg"
// 				}
// 			});
// 		}).then((sectionlist) => {
// 			console.log(sectionlist);
// 			expect(sectionlist).to.have.length(41);
// 		});
// });
//
// it("SCOMP test, cpsc", async function () {
// 	let sectionlist: ISection[];
// 	dataset = await Dataset.parseDataset(
// 		"sections", datasetContents.get("valid_small") ?? "", InsightDatasetKind.Sections);
// 	sectionlist = processFILTER({
// 		IS: {
// 			sections_dept: "cpsc"
// 		}
// 	}, dataset);
// 	console.log(sectionlist.length);
// });
//
// // Should processFILTER check id?
// it("SCOMP test, cpsc", async function () {
// 	let sectionlist: ISection[];
// 	dataset = await Dataset.parseDataset(
// 		"ubc", datasetContents.get("valid_small") ?? "", InsightDatasetKind.Sections);
// 	sectionlist = processFILTER({
// 		IS: {
// 			sections_dept: "cpsc"
// 		}
// 	}, dataset);
// 	console.log(sectionlist.length);
// });
//
// it("SCOMP test, *a, should return empty list", async function () {
// 	let sectionlist: ISection[];
// 	dataset = await Dataset.parseDataset(
// 		"sections", datasetContents.get("valid_small") ?? "", InsightDatasetKind.Sections);
// 	sectionlist = processFILTER({
// 		IS: {
// 			sections_dept: "*a"
// 		}
// 	}, dataset);
// 	console.log(sectionlist.length);
// });
//
// it("SCOMP test, cp*, should return length 39", async function () {
// 	let sectionlist: ISection[];
// 	dataset = await Dataset.parseDataset(
// 		"sections", datasetContents.get("valid_small") ?? "", InsightDatasetKind.Sections);
// 	sectionlist = processFILTER({
// 		IS: {
// 			sections_dept: "cp*"
// 		}
// 	}, dataset);
// 	console.log(sectionlist.length);
// });
//
// it("SCOMP test, a*, should return length 0", async function () {
// 	let sectionlist: ISection[];
// 	dataset = await Dataset.parseDataset(
// 		"sections", datasetContents.get("valid_small") ?? "", InsightDatasetKind.Sections);
// 	sectionlist = processFILTER({
// 		IS: {
// 			sections_dept: "a*"
// 		}
// 	}, dataset);
// 	console.log(sectionlist.length);
// });
//
// it("SCOMP test, *ps*, should return length 39", async function () {
// 	let sectionlist: ISection[];
// 	dataset = await Dataset.parseDataset(
// 		"sections", datasetContents.get("valid_small") ?? "", InsightDatasetKind.Sections);
// 	sectionlist = processFILTER({
// 		IS: {
// 			sections_dept: "*ps*"
// 		}
// 	}, dataset);
// 	console.log(sectionlist.length);
// });
//
// it("SCOMP test, *pa*, should return length 0", async function () {
// 	let sectionlist: ISection[];
// 	dataset = await Dataset.parseDataset(
// 		"sections", datasetContents.get("valid_small") ?? "", InsightDatasetKind.Sections);
// 	sectionlist = processFILTER({
// 		IS: {
// 			sections_dept: "*pa*"
// 		}
// 	}, dataset);
// 	console.log(sectionlist.length);
// });
//
// it("SCOMP test, *cpsc*, should return length 39", async function () {
// 	let sectionlist: ISection[];
// 	dataset = await Dataset.parseDataset(
// 		"sections", datasetContents.get("valid_small") ?? "", InsightDatasetKind.Sections);
// 	sectionlist = processFILTER({
// 		IS: {
// 			sections_dept: "*cpsc*"
// 		}
// 	}, dataset);
// 	console.log(sectionlist.length);
// });
//
// it("SCOMP test on pair, adhe, should return length 232", async function () {
// 	let sectionlist: ISection[];
// 	dataset = await Dataset.parseDataset(
// 		"sections", datasetContents.get("sections") ?? "", InsightDatasetKind.Sections);
// 	sectionlist = processFILTER({
// 		IS: {
// 			sections_dept: "adhe"
// 		}
// 	}, dataset);
// 	console.log(sectionlist.length);
// });
//
// it("SCOMP test on pair, a*, should return length 4652", async function () {
// 	let sectionlist: ISection[];
// 	dataset = await Dataset.parseDataset(
// 		"sections", datasetContents.get("sections") ?? "", InsightDatasetKind.Sections);
// 	sectionlist = processFILTER({
// 		IS: {
// 			sections_dept: "a*"
// 		}
// 	}, dataset);
// 	console.log(sectionlist.length);
// });
//
// it("SCOMP test on pair, *sc, should return length 4718", async function () {
// 	let sectionlist: ISection[];
// 	dataset = await Dataset.parseDataset(
// 		"sections", datasetContents.get("sections") ?? "", InsightDatasetKind.Sections);
// 	sectionlist = processFILTER({
// 		IS: {
// 			sections_dept: "*sc"
// 		}
// 	}, dataset);
// 	console.log(sectionlist.length);
// });
//
// it("SCOMP test on pair, *pa*, should return length 1170", async function () {
// 	let sectionlist: ISection[];
// 	dataset = await Dataset.parseDataset(
// 		"sections", datasetContents.get("sections") ?? "", InsightDatasetKind.Sections);
// 	sectionlist = processFILTER({
// 		IS: {
// 			sections_dept: "*pa*"
// 		}
// 	}, dataset);
// 	console.log(sectionlist.length);
// });
//
// it("SCOMP test on pair, abcd, should return length 0", async function () {
// 	let sectionlist: ISection[];
// 	dataset = await Dataset.parseDataset(
// 		"sections", datasetContents.get("sections") ?? "", InsightDatasetKind.Sections);
// 	sectionlist = processFILTER({
// 		IS: {
// 			sections_dept: "abcd"
// 		}
// 	}, dataset);
// 	console.log(sectionlist.length);
// });
