import Server from "../../src/rest/Server";
import InsightFacade from "../../src/controller/InsightFacade";
import chai, {expect, use} from "chai";
import chaiHttp from "chai-http";
import * as fs from "fs-extra";
import {InsightDatasetKind} from "../../src/controller/IInsightFacade";

describe("Server", function () {
	const persistDirectory = "./data";
	const datasetContents = new Map<string, Buffer>();
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

	let facade: InsightFacade;
	let server: Server;

	use(chaiHttp);

	before(function () {
		facade = new InsightFacade();
		server = new Server(4321);
		for (const key of Object.keys(datasetsToLoad)) {
			const content = fs.readFileSync(datasetsToLoad[key]);
			datasetContents.set(key, content);
		}
		// TODO: start server here once and handle errors properly
		return server.start().then(() => {
			console.info("App::initServer() - started");
		}).catch((err: Error) => {
			console.error(`App::initServer() - ERROR: ${err.message}`);
		});
	});

	after(function () {
		// TODO: stop server here once!
		return server.stop().then(() => {
			console.info("Server Stopped");
		});
	});

	beforeEach(function () {
		// might want to add some process logging here to keep track of what"s going on
		console.info("B4/////////////////");
		fs.removeSync(persistDirectory);
	});

	afterEach(function () {
		// might want to add some process logging here to keep track of what"s going on
		console.info("After/////////////");
	});

	// Sample on how to format PUT requests

	it("DELETE test for rooms dataset", async function() {
		const insight = new InsightFacade();
		await insight.addDataset(
			"rooms",
			(datasetContents.get("rooms_valid_small") ?? "").toString("base64"),
			InsightDatasetKind.Rooms
		);
		const SERVER_URL = "http://localhost:4321";
		const ENDPOINT_URL = "/dataset/rooms";
		// const ZIP_FILE_DATA = "/abc";
		try {
			return chai.request(SERVER_URL)
				.delete(ENDPOINT_URL)
				// .send(ZIP_FILE_DATA)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: ChaiHttp.Response) {
					// some logging here please!
					console.info("successful request");
					expect(res.status).to.be.equal(200);
					expect(res.body).to.deep.equal({result: "rooms"});
				})
				.catch(function (err) {
					// some logging here please!
					console.error(`failed request ${err}`);
					expect.fail();
				});
		} catch (err) {
			console.info("Causing error");
			console.info(err);
			// and some more logging here!
		}
	});

	it("PUT test for rooms dataset - capital letter kind", function () {
		const SERVER_URL = "http://localhost:4321";
		const ENDPOINT_URL = "/dataset/myID/ROomS";
		const ZIP_FILE_DATA = datasetContents.get("rooms_valid_small");
		try {
			return chai.request(SERVER_URL)
				.put(ENDPOINT_URL)
				.send(ZIP_FILE_DATA)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: ChaiHttp.Response) {
					expect(res.status).to.be.equal(200);
					expect(res.body).to.deep.equal({result: ["myID"]});
				})
				.catch(function (err) {
					// some logging here please!
					console.error(`failed request ${err}`);
					expect.fail();
				});
		} catch (err) {
			console.info("Causing error");
			console.info(err);
			// and some more logging here!
		}
	});

	it("PUT test for rooms dataset - space in kind", function () {
		const SERVER_URL = "http://localhost:4321";
		const ENDPOINT_URL = "/dataset/myID/ rooms ";
		const ZIP_FILE_DATA = datasetContents.get("rooms_valid_small");
		try {
			return chai.request(SERVER_URL)
				.put(ENDPOINT_URL)
				.send(ZIP_FILE_DATA)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: ChaiHttp.Response) {
					expect(res.status).to.be.equal(200);
					expect(res.body).to.deep.equal({result: ["myID"]});
				})
				.catch(function (err) {
					// some logging here please!
					console.error(`failed request ${err}`);
					expect.fail();
				});
		} catch (err) {
			console.info("Causing error");
			console.info(err);
			// and some more logging here!
		}
	});

	it("PUT test for rooms dataset - missing kind", function () {
		const SERVER_URL = "http://localhost:4321";
		const ENDPOINT_URL = "/dataset/myID/";
		const ZIP_FILE_DATA = datasetContents.get("rooms_valid_small");
		try {
			return chai.request(SERVER_URL)
				.put(ENDPOINT_URL)
				.send(ZIP_FILE_DATA)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: ChaiHttp.Response) {
					expect(res.status).to.be.equal(400);
					expect("error" in res.body).to.be.true;
				})
				.catch(function (err) {
					// some logging here please!
					console.error(`failed request ${err}`);
					expect.fail();
				});
		} catch (err) {
			console.info("Causing error");
			console.info(err);
			// and some more logging here!
		}
	});

	it("PUT test for rooms dataset - invalid kind", function () {
		const SERVER_URL = "http://localhost:4321";
		const ENDPOINT_URL = "/dataset/myID/rrooms";
		const ZIP_FILE_DATA = datasetContents.get("rooms_valid_small");
		try {
			return chai.request(SERVER_URL)
				.put(ENDPOINT_URL)
				.send(ZIP_FILE_DATA)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: ChaiHttp.Response) {
					expect(res.status).to.be.equal(400);
					expect("error" in res.body).to.be.true;
				})
				.catch(function (err) {
					// some logging here please!
					console.error(`failed request ${err}`);
					expect.fail();
				});
		} catch (err) {
			console.info("Causing error");
			console.info(err);
			// and some more logging here!
		}
	});

	it("PUT test for rooms dataset - id of symbols valid for URI", function () {
		const SERVER_URL = "http://localhost:4321";
		const ENDPOINT_URL = "/dataset/ !@$^&*<>'\":;.,12aA []{}()|-+= /rooms";
		const ZIP_FILE_DATA = datasetContents.get("rooms_valid_small");
		try {
			return chai.request(SERVER_URL)
				.put(ENDPOINT_URL)
				.send(ZIP_FILE_DATA)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: ChaiHttp.Response) {
					expect(res.status).to.be.equal(200);
					expect(res.body).to.deep.equal({result: [" !@$^&*<>'\":;.,12aA []{}()|-+= "]});
				})
				.catch(function (err) {
					// some logging here please!
					console.error(`failed request ${err}`);
					expect.fail();
				});
		} catch (err) {
			console.info("Causing error");
			console.info(err);
			// and some more logging here!
		}
	});

	it("PUT test for rooms dataset - id of symbols containing slash", function () {
		const SERVER_URL = "http://localhost:4321";
		const ENDPOINT_URL = "/dataset//\\|/rooms";
		const ZIP_FILE_DATA = datasetContents.get("rooms_valid_small");
		try {
			return chai.request(SERVER_URL)
				.put(ENDPOINT_URL)
				.send(ZIP_FILE_DATA)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: ChaiHttp.Response) {
					expect(res.status).to.be.equal(400);
					expect("error" in res.body).to.be.true;
				})
				.catch(function (err) {
					// some logging here please!
					console.error(`failed request ${err}`);
					expect.fail();
				});
		} catch (err) {
			console.info("Causing error");
			console.info(err);
			// and some more logging here!
		}
	});

	it("PUT test for rooms dataset - id of symbols invalid for URI", function () {
		const SERVER_URL = "http://localhost:4321";
		const ENDPOINT_URL = "/dataset/ABC abc 0123 @.,&^%$#@!-=+?<>:[]{}() /rooms";
		const ZIP_FILE_DATA = datasetContents.get("rooms_valid_small");
		try {
			return chai.request(SERVER_URL)
				.put(ENDPOINT_URL)
				.send(ZIP_FILE_DATA)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: ChaiHttp.Response) {
					expect(res.status).to.be.equal(400);
					expect("error" in res.body).to.be.false; // NOTE checking if C0 also can't handle
				})
				.catch(function (err) {
					// some logging here please!
					console.error(`failed request ${err}`);
					expect.fail();
				});
		} catch (err) {
			console.info("Causing error");
			console.info(err);
			// and some more logging here!
		}
	});

	it("PUT test for rooms dataset - id case sensitivity", async function () {
		const insight = new InsightFacade();
		await insight.addDataset(
			"my sectioNs",
			(datasetContents.get("valid_small") ?? "").toString("base64"),
			InsightDatasetKind.Sections
		);
		const SERVER_URL = "http://localhost:4321";
		const ENDPOINT_URL = "/dataset/my sections/sections";
		const ZIP_FILE_DATA = datasetContents.get("valid_small");
		try {
			return chai.request(SERVER_URL)
				.put(ENDPOINT_URL)
				.send(ZIP_FILE_DATA)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: ChaiHttp.Response) {
					expect(res.status).to.be.equal(200);
					expect(res.body).to.deep.equal({result: ["my sectioNs", "my sections"]});
				})
				.catch(function (err) {
					// some logging here please!
					console.error(`failed request ${err}`);
					expect.fail();
				});
		} catch (err) {
			console.info("Causing error");
			console.info(err);
			// and some more logging here!
		}
	});

	it("PUT test with invalid URI - expecting error", function () {
		const SERVER_URL = "http://localhost:4321";
		const ENDPOINT_URL = "/dataset//rooms";
		const ZIP_FILE_DATA = datasetContents.get("rooms_valid_small");
		try {
			return chai.request(SERVER_URL)
				.put(ENDPOINT_URL)
				.send(ZIP_FILE_DATA)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: ChaiHttp.Response) {
					expect(res.status).to.be.equal(400);
					expect("error" in res.body).to.be.true;
				})
				.catch(function (err) {
					// some logging here please!
					console.error(`failed request ${err}`);
					expect.fail();
				});
		} catch (err) {
			console.info("Causing error");
			console.info(err);
			// and some more logging here!
		}
	});

	it("PUT test with invalid URI - not expecting error", function () {
		const SERVER_URL = "http://localhost:4321";
		const ENDPOINT_URL = "/dataset//rooms";
		const ZIP_FILE_DATA = datasetContents.get("rooms_valid_small");
		try {
			return chai.request(SERVER_URL)
				.put(ENDPOINT_URL)
				.send(ZIP_FILE_DATA)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: ChaiHttp.Response) {
					expect(res.status).to.be.equal(400);
					// expect("error" in res.body).to.be.false;	// NOTE: checking if C0 can handle this
				})
				.catch(function (err) {
					// some logging here please!
					console.error(`failed request ${err}`);
					expect.fail();
				});
		} catch (err) {
			console.info("Causing error");
			console.info(err);
			// and some more logging here!
		}
	});

	// The other endpoints work similarly. You should be able to find all instructions at the chai-http documentation
});
