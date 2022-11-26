import Server from "../../src/rest/Server";
import InsightFacade from "../../src/controller/InsightFacade";
import chai, {expect, use} from "chai";
import chaiHttp from "chai-http";

describe("Server", function () {

	let facade: InsightFacade;
	let server: Server;

	use(chaiHttp);

	before(function () {
		facade = new InsightFacade();
		server = new Server(4321);
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
	});

	afterEach(function () {
		// might want to add some process logging here to keep track of what"s going on
		console.info("After/////////////");
	});

	// Sample on how to format PUT requests

	it("DELETE test for courses dataset", function () {
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
					expect(res.body).to.deep.equal({results: "rooms"});
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
