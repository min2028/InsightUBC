import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
	ResultTooLargeError
} from "./IInsightFacade";
import {IDataset, Dataset} from "../model/Dataset";
import {isValidId, readDatasetIDs, removeFromDatasetIDs} from "../model/Utility";
// import {Dataset} from "../model/Dataset";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export const persistDirectory = "../data";

export default class InsightFacade implements IInsightFacade {
	protected datasets: IDataset[];
	protected datasetIDs: string[];

	constructor() {
		// TODO: read the list of ids from the file in .data
		this.datasetIDs = readDatasetIDs();
		this.datasets = [];
		console.log("InsightFacadeImpl::init()");
	}

	public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		if (!isValidId(id, this.datasetIDs)) {
			return Promise.reject(new InsightError("Id is already used"));
		}
		return Dataset.parseDataset(id, content, kind)
			.then((dataset) => {
				this.datasets.push(dataset);
				this.datasetIDs.push(id);
				// TODO: Add the newly added dataset to disk
				// createDirAndWriteIDs(id);
				return this.datasetIDs;
			}).catch((err) => {
				return Promise.reject(new InsightError(err));
			});
	}

	public removeDataset(id: string): Promise<string> {
		// TODO: remove it from
		if (!isValidId(id)) {
			return Promise.reject(new InsightError("Invalid id"));
		}
		if (!this.datasetIDs.includes(id)) {
			return Promise.reject(new NotFoundError());
		}
		const index = this.datasets.findIndex((item) => item.id);
		if (index === -1) {
			return Promise.reject(new NotFoundError());
		}
		this.datasets.splice(index, 1);
		this.datasetIDs.splice(this.datasetIDs.indexOf(id), 1);
		removeFromDatasetIDs(id);
		// At this point, dataset includes

		return Promise.resolve(id);
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
