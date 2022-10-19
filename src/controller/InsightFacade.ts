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
import {Disk} from "../Utility/Disk";
import {isValidId} from "../Utility/General";
import {Query} from "../model/Query";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */

export default class InsightFacade implements IInsightFacade {
	protected latestDataset: IDataset;
	protected insightDatasetList: InsightDataset[];

	constructor() {
		// ead the list of metadata from the file in .data
		this.insightDatasetList = Disk.readDatasetMeta();
		this.latestDataset = {} as IDataset;
	}

	public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		if (!isValidId(id, this.insightDatasetList.map((item) => item.id))) {
			return Promise.reject(new InsightError("Id is already used"));
		}
		return Dataset.parseDataset(id, content, kind)
			.then((dataset) => {
				this.latestDataset = dataset;
				this.insightDatasetList.push( {id: id, kind: kind, numRows: dataset.numRows} );
				Disk.writeDatasetMeta(this.insightDatasetList);
				Disk.writeDataset(this.latestDataset);
				return this.insightDatasetList.map((item) => item.id);
			}).catch((err) => {
				return Promise.reject(new InsightError(err));
			});
	}

	public removeDataset(id: string): Promise<string> {
		if (!isValidId(id)) {
			return Promise.reject(new InsightError("Invalid id"));
		}
		const index = this.insightDatasetList.findIndex((item) => item.id === id);
		if (index === -1) {
			return Promise.reject(new NotFoundError());
		}
		this.insightDatasetList.splice(index, 1);
		Disk.writeDatasetMeta(this.insightDatasetList);
		Disk.removeDataset(id);
		if (this.latestDataset.id === id) {
			this.latestDataset = {} as IDataset;
		}
		return Promise.resolve(id);
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		return Query.parseQuery(query)
			.then((queryProps) => {
				if (this.latestDataset.id !== queryProps.datasetID) {
					if (!isValidId(queryProps.datasetID, this.insightDatasetList.map((item) => item.id))) {
						return Promise.reject(new InsightError("Dataset is not added"));
					}
					const diskDataset = Disk.readDataset(queryProps.datasetID);
					if (diskDataset === null) {
						return Promise.reject("Dataset is missing from the disk");
					}
					this.latestDataset = diskDataset;
				}
				return Query.processQuery(queryProps.query, this.latestDataset)
					.catch((err) => {
						return Promise.reject(new ResultTooLargeError());
					});
			}).catch((err) => {
				return Promise.reject(new InsightError(err));
			});
	}

	public listDatasets(): Promise<InsightDataset[]> {
		return Promise.resolve(this.insightDatasetList);
	}
}
