import {InsightError, InsightResult, ResultTooLargeError} from "../../controller/IInsightFacade";
import {processFILTER, processOptions, processOptionsWithTransformation} from "./QueryProcessor";
import {getDatasetId, getDatasetType, validateQuery} from "./QueryValidator";
import {isValidId} from "../../Utility/General";
import {IData, IDataset} from "../Dataset/IDataset";

const tooLargeThreshold = 5000;

export interface QueryProps {
	query: IQuery,
	datasetID: string
}

export interface OPTIONS {
	COLUMNS: string[],
	ORDER?: string | DIRECTION
}

export interface IQuery {
	WHERE: FILTER,
	OPTIONS: OPTIONS,
	TRANSFORMATIONS?: {
		GROUP: string[],
		APPLY: APPLYRULE[];
	}
}

export interface DIRECTION {
	dir: "DOWN" | "UP";
	keys: string[];
}

export interface APPLYRULE {
	[applyKey: string]: APPLYTOKEN;
}

export type APPLYTOKEN = {
	[applyToken in "MAX" | "MIN" | "AVG" | "COUNT" | "SUM"]: string[];
};

export interface KeyValuePair {[key: string]: string | number};
export type FILTER = {
	[filterType in "AND" | "OR" | "NOT" | "LT" | "GT" | "EQ" | "IS"]: FILTER[] | FILTER | KeyValuePair
};
export type LOGICCOMPARISON = {[logic in "AND" | "OR"]: FILTER[]};

export class Query {
	protected result: InsightResult[] = [];

	public static parseQuery(json: any): Promise<QueryProps> {
		const targetDatasetId = getDatasetId(json);
		if (targetDatasetId === false || !isValidId(targetDatasetId)) {
			return Promise.reject(new InsightError("Invalid Query: invalid Dataset ID"));
		}
		const targetDatasetType = getDatasetType(json);
		if (targetDatasetType === false) {
			return Promise.reject(new InsightError("Invalid Query: invalid Dataset key"));
		}
		const validationResults = validateQuery(json, targetDatasetId, targetDatasetType);
		if (validationResults === true) {
			const jsonObj: any = JSON.parse(JSON.stringify(json));
			return Promise.resolve({query: jsonObj as IQuery, datasetID: targetDatasetId});
		} else {
			return Promise.reject(new InsightError("Invalid Query: " + validationResults));
		}
	}

	public static processQuery(query: IQuery, dataset: IDataset): Promise<InsightResult[]> {
		let filteredResults: IData[] = [];
		let results: InsightResult[];
		if (Object.keys(query.WHERE).length) {
			filteredResults = processFILTER(query.WHERE, dataset);
		} else {
			dataset.dataList.forEach((data) => filteredResults.push(data));
		}
		if (query.TRANSFORMATIONS) {
			results = processOptionsWithTransformation(query.OPTIONS, query.TRANSFORMATIONS, filteredResults);
		} else {
			results = processOptions(query.OPTIONS, filteredResults);
		}
		if (results.length > tooLargeThreshold) {
			return Promise.reject(new ResultTooLargeError(`results > ${tooLargeThreshold}`));
		}
		return Promise.resolve(results);
	}
}
