import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
	ResultTooLargeError
} from "./IInsightFacade";
import {IDataset, Dataset} from "../model/Dataset/Dataset";
import {Disk} from "../Utility/Disk";
import {isIdInList, isValidId} from "../Utility/General";
import {Query} from "../model/Query/Query";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */

export default class InsightFacade implements IInsightFacade {
	protected cachedDataset: IDataset;
	protected insightDatasetList: InsightDataset[];

	constructor() {
		this.insightDatasetList = Disk.readDatasetMeta();
		this.cachedDataset = {} as IDataset;
	}

	public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		if (!(isValidId(id) && !isIdInList(id, this.insightDatasetList.map((item) => item.id)))){
			return Promise.reject(new InsightError("Id is already used"));
		}
		return Dataset.parseDataset(id, content, kind)
			.then((dataset) => {
				this.cachedDataset = dataset;
				this.insightDatasetList.push( {id: id, kind: kind, numRows: dataset.numRows} );
				Disk.writeDatasetMeta(this.insightDatasetList);
				Disk.writeDataset(this.cachedDataset);
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
		if (this.cachedDataset.id === id) {
			this.cachedDataset = {} as IDataset;
		}
		return Promise.resolve(id);
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		return Query.parseQuery(query)
			.then((queryProps) => {
				if (this.cachedDataset.id !== queryProps.datasetID) {
					if (!isIdInList(queryProps.datasetID, this.insightDatasetList.map((item) => item.id))) {
						return Promise.reject(new InsightError("The queried dataset does not exist"));
					}
					const diskDataset = Disk.readDataset(queryProps.datasetID);
					if (diskDataset === null) {
						return Promise.reject(new InsightError("Dataset is missing from the disk"));
					}
					this.cachedDataset = diskDataset;
				}
				return Query.processQuery(queryProps.query, this.cachedDataset);
			}).catch((err) => {
				return Promise.reject(err);
			});
	}

	public listDatasets(): Promise<InsightDataset[]> {
		return Promise.resolve(this.insightDatasetList);
	}
}
