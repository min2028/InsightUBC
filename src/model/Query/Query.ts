import {IDataset} from "../Dataset/Dataset";
import {InsightError, InsightResult, ResultTooLargeError} from "../../controller/IInsightFacade";
import {ISection} from "../Dataset/Section";
import {processFILTER, processOptions} from "./QueryProcessor";
import {getDatasetId, validateQuery} from "./QueryValidator";
import {isValidId} from "../../Utility/General";

const tooLargeThreshold = 5000;

export interface QueryProps {
	query: IQuery,
	datasetID: string
}

export interface IQuery {
	WHERE: FILTER,
	OPTIONS: {
		COLUMNS: string[],
		ORDER?: string
	}
}

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
		const validationResults = validateQuery(json, targetDatasetId);
		if (validationResults === true) {
			const jsonObj: any = JSON.parse(JSON.stringify(json));
			return Promise.resolve({query: jsonObj as IQuery, datasetID: targetDatasetId});
		} else {
			return Promise.reject(new InsightError("Invalid Query: " + validationResults));
		}
	}

	public static processQuery(query: IQuery, dataset: IDataset): Promise<InsightResult[]> {
		let filteredResults: ISection[] = [];
		let results: InsightResult[];
		if (Object.keys(query.WHERE).length) {
			filteredResults = processFILTER(query.WHERE, dataset);
		} else {
			dataset.courses.forEach((course) =>
				course.sections.forEach((section) =>  {
					filteredResults.push(section);
				})
			);
		}
		if (filteredResults.length > tooLargeThreshold) {
			return Promise.reject(new ResultTooLargeError(`results > ${tooLargeThreshold}`));
		}
		results = processOptions(query.OPTIONS, filteredResults);
		return Promise.resolve(results);
	}
}
