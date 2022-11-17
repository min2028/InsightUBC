import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
	ResultTooLargeError
} from "./IInsightFacade";
import {CDataset} from "../model/Dataset/CourseDataset/CDataset";
import {Disk} from "../Utility/Disk";
import {isIdInList, isValidId} from "../Utility/General";
import {Query} from "../model/Query/Query";
import {RDataset} from "../model/Dataset/RoomDataset/RDataset";
import {IDataset, IDatasetParser} from "../model/Dataset/IDataset";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */

export default class InsightFacade implements IInsightFacade {
	private cachedDataset: IDataset;
	private insightDatasetList: InsightDataset[];

	constructor() {
		this.insightDatasetList = Disk.readDatasetMeta();
		this.cachedDataset = {} as IDataset;
	}

	public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		if (!isValidId(id)){
			return Promise.reject(new InsightError("Invalid Id"));
		} else if (isIdInList(id, this.insightDatasetList.map((item) => item.id))){
			return Promise.reject(new InsightError("Id is already used"));
		}
		const parser: IDatasetParser = (kind === InsightDatasetKind.Sections) ? new CDataset() : new RDataset();
		return parser.parseDataset(id, content)
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
				const filteredDataset = this.insightDatasetList.filter(
					(item) => item.id === queryProps.datasetID && item.kind === queryProps.datasetKind
				);
				if (filteredDataset.length !== 1) {
					return Promise.reject(new InsightError("The corresponding dataset is not added"));
				}

				if (this.cachedDataset.id !== queryProps.datasetID) {
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
