//
// it("testing SCOMP * *, should return 47 ", function () {
// 	let insightFacade: InsightFacade = new InsightFacade();
// 	return insightFacade.addDataset("sections", datasetContents.get("sections") ?? "", InsightDatasetKind.Sections)
// 		.then(() => {
// 			return insightFacade.performQuery({
// 				WHERE: {
// 					AND: [
// 						{
// 							IS: {
// 								sections_title: "* *"
// 							}
// 						},
// 						{
// 							GT: {
// 								sections_avg: 97
// 							}
// 						}
// 					]
// 				},
// 				OPTIONS: {
// 					COLUMNS: [
// 						"sections_dept",
// 						"sections_id"
// 					]
// 				}
// 			});
// 		}).then((sectionlist) => {
// 			expect(sectionlist).to.have.length(47);
// 		});
// });
//
// it("testing SCOMP *computer*, should return 80 ", function () {
// 	let insightFacade: InsightFacade = new InsightFacade();
// 	return insightFacade.addDataset("sections", datasetContents.get("sections") ?? "", InsightDatasetKind.Sections)
// 		.then(() => {
// 			return insightFacade.performQuery({
// 				WHERE: {
// 					IS: {
// 						sections_title: "*computer*"
// 					}
// 				},
// 				OPTIONS: {
// 					COLUMNS: [
// 						"sections_title",
// 					]
// 				}
// 			});
// 		}).then((sectionlist) => {
// 			expect(sectionlist).to.have.length(80);
// 		});
// });
//
// it("testing AND with one item in the list", async function () {
// 	let sectionlist: ISection[];
// 	dataset = await Dataset.parseDataset(
// 		"sections", datasetContents.get("sections") ?? "", InsightDatasetKind.Sections);
// 	sectionlist = processFILTER({
// 		AND: [
// 			{
// 				IS: {
// 					sections_dept: "adhe"
// 				}
// 			}
// 		]
// 	}, dataset);
// 	expect(sectionlist).to.have.length(232);
// });
//
// it("testing OR with one item in the list", async function () {
// 	let sectionlist: ISection[];
// 	dataset = await Dataset.parseDataset(
// 		"sections", datasetContents.get("sections") ?? "", InsightDatasetKind.Sections);
// 	sectionlist = processFILTER({
// 		OR: [
// 			{
// 				IS: {
// 					sections_dept: "adhe"
// 				}
// 			}
// 		]
// 	}, dataset);
// 	expect(sectionlist).to.have.length(232);
// });
//
// it("testing AND with three item in the list", async function () {
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
// 			},
// 			{
// 				LT: {
// 					sections_avg: 96
// 				}
// 			}
// 		]
// 	}, dataset);
// 	expect(sectionlist).to.have.length(14);
// });
//
// it("testing NOT with one item in the list", async function () {
// 	let sectionlist: ISection[];
// 	dataset = await Dataset.parseDataset(
// 		"sections", datasetContents.get("sections") ?? "", InsightDatasetKind.Sections);
// 	sectionlist = processFILTER({
// 		AND: [
// 			{
// 				NOT: {
// 					GT: {
// 						sections_avg: 40
// 					}
// 				}
// 			}
// 		]
// 	}, dataset);
// 	expect(sectionlist).to.have.length(12);
// });
//
// it("test checkWildcard, ***", function () {
// 	const result: boolean = checkWildCard("***");
// 	return expect(result).to.be.false;
// });
//
// it("test checkWildcard, *abc*d", function () {
// 	const result: boolean = checkWildCard("*abc*d");
// 	return expect(result).to.be.false;
// });
//
// it("test checkWildcard, d**", function () {
// 	const result: boolean = checkWildCard("***");
// 	return expect(result).to.be.false;
// });
//
// it("test checkWildcard, abcd", function () {
// 	const result: boolean = checkWildCard("abcd");
// 	return expect(result).to.be.true;
// });
//
// it("test checkWildcard, *", function () {
// 	const result: boolean = checkWildCard("*");
// 	return expect(result).to.be.true;
// });
//
// it("test checkWildcard, **", function () {
// 	const result: boolean = checkWildCard("**");
// 	return expect(result).to.be.true;
// });
//
