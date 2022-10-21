//
// it("valid complex query -> Should pass the validation", function () {
// 	const result = validateQuery(
// 		{
// 			WHERE: {
// 				OR: [
// 					{
// 						AND: [
// 							{
// 								GT: {
// 									sections_avg: 90
// 								}
// 							},
// 							{
// 								IS: {
// 									sections_dept: "adhe"
// 								}
// 							}
// 						]
// 					},
// 					{
// 						EQ: {
// 							sections_avg: 95
// 						}
// 					}
// 				]
// 			},
// 			OPTIONS: {
// 				COLUMNS: [
// 					"sections_dept",
// 					"sections_id",
// 					"sections_avg"
// 				],
// 				ORDER: "sections_avg"
// 			}
// 		}, "sections");
// 	return expect(result).to.be.true;
// });
//
// it("valid query key -> Should pass the validation", function () {
// 	const result = isValidQueryKey("section_dept", "section");
// 	return expect(result).to.be.true;
// });
//
// it("valid keyValuePair string -> Should pass the validation", function () {
// 	const result = isValidKeyValuePair({sections_dept: "cpsc"}, "sections", "s");
// 	return expect(result).to.be.true;
// });
//
// it("valid keyValuePair numeric -> Should pass the validation", function () {
// 	const result = isValidKeyValuePair({sections_avg: 97.4}, "sections", "n");
// 	return expect(result).to.be.true;
// });
//
// it("a simple query, should reject with ResultTooLargeError", async function () {
// 	let insightFacade: InsightFacade = new InsightFacade();
// 	return insightFacade.addDataset("sections", datasetContents.get("sections") ?? "", InsightDatasetKind.Sections)
// 		.then(() => {
// 			return insightFacade.performQuery({
//
// 				WHERE: {
//
// 					GT: {
//
// 						sections_avg: 70
//
// 					}
//
// 				},
//
// 				OPTIONS: {
//
// 					COLUMNS: [
//
// 						"sections_dept",
//
// 						"sections_avg"
//
// 					],
//
// 					ORDER: "sections_avg"
//
// 				}
//
// 			});
// 		}).catch((err) => {
// 			expect(err).to.be.instanceOf(ResultTooLargeError);
// 		});
// });
//
// it("a simple query, but with different ids", function () {
// 	let insightFacade: InsightFacade = new InsightFacade();
// 	return insightFacade.addDataset("ubc", datasetContents.get("sections") ?? "", InsightDatasetKind.Sections)
// 		.then(() => {
// 			return insightFacade.performQuery({
// 				WHERE: {
// 					GT: {
// 						sections_avg: 70
// 					}
// 				},
// 				OPTIONS: {
// 					COLUMNS: [
// 						"sections_dept",
// 						"sections_avg"
// 					],
// 					ORDER: "sections_avg"
// 				}
// 			});
// 		}).catch((err) => {
// 			expect(err).to.be.instanceOf(InsightError);
// 		});
// });
//
//
// it("SCOMP test, *sc, should return length 39", async function () {
// 	let sectionlist: ISection[];
// 	dataset = await Dataset.parseDataset(
// 		"sections", datasetContents.get("valid_small") ?? "", InsightDatasetKind.Sections);
// 	sectionlist = processFILTER({
// 		IS: {
// 			sections_dept: "*sc"
// 		}
// 	}, dataset);
// 	console.log(sectionlist.length);
// });
//
// it("SCOMP test, adhe, should return empty list", async function () {
// 	let sectionlist: ISection[];
// 	dataset = await Dataset.parseDataset(
// 		"sections", datasetContents.get("valid_small") ?? "", InsightDatasetKind.Sections);
// 	sectionlist = processFILTER({
// 		IS: {
// 			sections_dept: "adhe"
// 		}
// 	}, dataset);
// 	console.log(sectionlist.length);
// });
//
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
