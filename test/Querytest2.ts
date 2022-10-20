// it("a complex query, testing integration", function () {
// 	let insightFacade: InsightFacade = new InsightFacade();
// 	return insightFacade.addDataset("sections", datasetContents.get("sections") ?? "", InsightDatasetKind.Sections)
// 		.then(() => {
// 			return insightFacade.performQuery({
// 				WHERE: {
// 					OR: [
// 						{
// 							AND: [
// 								{
// 									GT: {
// 										sections_avg: 90
// 									}
// 								},
// 								{
// 									IS: {
// 										sections_dept: "adhe"
// 									}
// 								}
// 							]
// 						},
// 						{
// 							EQ: {
// 								sections_avg: 95
// 							}
// 						}
// 					]
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
// 			expect(sectionlist).to.have.length(56);
// 		});
// });
//
// it("a complex query, testing OR", function () {
// 	let insightFacade: InsightFacade = new InsightFacade();
// 	return insightFacade.addDataset("sections", datasetContents.get("sections") ?? "", InsightDatasetKind.Sections)
// 		.then(() => {
// 			return insightFacade.performQuery({
// 				WHERE: {
// 					OR: [
// 						{
// 							GT: {
// 								sections_avg: 90
// 							}
// 						},
// 						{
// 							IS: {
// 								sections_dept: "adhe"
// 							}
// 						}
// 					]
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
// 			expect(sectionlist).to.have.length(3344);
// 		});
// });
//
// it("a complex query, testing OPTIONS", function () {
// 	let insightFacade: InsightFacade = new InsightFacade();
// 	return insightFacade.addDataset("sections", datasetContents.get("sections") ?? "", InsightDatasetKind.Sections)
// 		.then(() => {
// 			return insightFacade.performQuery({
// 				WHERE: {
// 					AND: [
// 						{
// 							GT: {
// 								sections_avg: 90
// 							}
// 						},
// 						{
// 							IS: {
// 								sections_dept: "adhe"
// 							}
// 						}
// 					]
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
// 			expect(sectionlist).to.have.length(15);
// 		});
// });
//
// it("a simple query, testing OPTIONS", function () {
// 	let insightFacade: InsightFacade = new InsightFacade();
// 	return insightFacade.addDataset("sections", datasetContents.get("sections") ?? "", InsightDatasetKind.Sections)
// 		.then(() => {
// 			return insightFacade.performQuery({
// 				WHERE: {
// 					AND: [
// 						{
// 							GT: {
// 								sections_avg: 90
// 							}
// 						},
// 						{
// 							IS: {
// 								sections_dept: "adhe"
// 							}
// 						}
// 					]
// 				},
// 				OPTIONS: {
// 					COLUMNS: [
// 						"sections_dept",
// 						"sections_id",
// 						"sections_avg"
// 					]
// 				}
// 			});
// 		}).then((sectionlist) => {
// 			console.log(sectionlist);
// 			expect(sectionlist).to.have.length(15);
// 		});
// });
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
