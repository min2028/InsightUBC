import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
	ResultTooLargeError
} from "./IInsightFacade";
import {Dataset} from "../model/Dataset";
// import {Dataset} from "../model/Dataset";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	// const dataset: Dataset;
	// const persistDirectory = "./data";
	constructor() {
		console.log("InsightFacadeImpl::init()");
	}

	public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		// parse the content to the dataset
		// Dataset.parseDataset()
		//
		// create a directory and add the content to the file
		// dataset = the parsed dataset
		return Promise.reject("Not implemented.");
	}

	public removeDataset(id: string): Promise<string> {
		return Promise.reject("Not implemented.");
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		return Promise.reject("Not implemented.");
	}

	public listDatasets(): Promise<InsightDataset[]> {
		return Promise.reject("Not implemented.");
	}
	//
	// private parseDataset(content: string): Dataset {
	//
	// }
	//
	// private writeToDisk(content: string): any {
	//
	// }
	//
	// private readFromDisk(): Dataset {
	// }
}
