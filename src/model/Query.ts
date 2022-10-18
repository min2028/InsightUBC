import {isKeyObject} from "util/types";
import {IDataset} from "./Dataset";
import {InsightDataset, InsightResult, ResultTooLargeError} from "../controller/IInsightFacade";
import {FieldT, ISection, Section} from "./Section";
// import {buildTree} from "./Tree";
import {Key} from "readline";

export interface QueryProps {
	query: IQuery,
	datasetID: string
}

interface IQuery {
	WHERE: FILTER,
	OPTIONS: {
		COLUMNS: string[],
		ORDER?: string
	}
}

interface KeyValuePair {[key: string]: string | number}
type FILTER = {[filterType in "AND" | "OR" | "NOT" | "LT" | "GT" | "EQ" | "IS"]: FILTER[] | FILTER | KeyValuePair};
interface NEGATION {NOT: FILTER}
type LOGICCOMPARISON = {[logic in "AND" | "OR"]: FILTER[]};
type MCOMPARISON = {[comparison in "LT" | "GT" | "EQ"]: KeyValuePair};
type SCOMPARISON = {[comparison in "IS"]: KeyValuePair};

// TREE INTERFACE
interface TreeNode<T> {
	children?: Array<TreeNode<T>>;
	filter: T;
}

export class Query {
	protected result: InsightResult[] = [];

	public static parseQuery(json: any): Promise<QueryProps> {
		const targetDatasetId = getDatasetId(json);
		if (targetDatasetId === false) {
			return Promise.reject("Invalid Query: invalid Dataset ID");
		}
		const validationResults = validateQuery(json, targetDatasetId);
		if (validationResults === true) {
			return Promise.resolve({query: json as IQuery, datasetID: targetDatasetId});
		} else {
			return Promise.reject("Invalid Query: " + validationResults);
		}
	}

	public static processQuery(query: IQuery, dataset: IDataset): Promise<InsightResult[]> {
		let filteredResults: ISection[];
		let results: InsightResult[];
		filteredResults = this.processFILTER(query.WHERE, dataset);
		results = this.processOptions(query.OPTIONS, filteredResults);
		if (results.length > 5000) {
			return Promise.reject("Results greater than 5000");
		}
		return Promise.resolve(results);
	}

	public static processFILTER(filter: FILTER, dataset: IDataset): ISection[]{
		// let filterTree = buildTree(filter);
		const child = Object.keys(filter)[0];
		switch (child) {
			case "AND":
				return this.processAND(filter[child] as FILTER[], dataset);
			case "OR":
				return this.processOR(filter[child] as FILTER[], dataset);
			case "NOT":
				return this.processNOT(filter[child] as FILTER, dataset);
			case "IS":
			case "LT":
			case "GT":
			case "EQ":
				return this.processSMComp(filter[child] as KeyValuePair, dataset, child);
			default:
				return [];
		}
	}

	public static processSMComp(key: KeyValuePair, dataset: IDataset, operator: "LT" | "GT" | "EQ" | "IS"): ISection[] {
		let field: string = extractField(key);
		let sections: ISection[] = [];
		dataset.courses.forEach((course) =>
			 course.sections.forEach((section) => {
				 switch (operator) {
					 case "LT":
						 if (section[field as FieldT] < Object.values(key)[0]) {
							 sections.push(section);
						 }
						 break;
					 case "GT":
						 if (section[field as FieldT] > Object.values(key)[0]) {
							 sections.push(section);
						 }
						 break;
					 case "IS":
					 case "EQ":
						 if (section[field as FieldT] === Object.values(key)[0]) {
							 sections.push(section);
						 }
						 break;
				 }
			})
		);
		return sections;
	}

	public static processNOT(notQuery: FILTER, dataset: IDataset): ISection[] {
		let results: ISection[] = [];
		let temp = this.processFILTER(notQuery, dataset);
		let emptyList: ISection[] = [];
		dataset.courses.forEach((course) => results = emptyList.concat(course.sections));
		results = results.filter((section) => !temp.includes(section));
		return results;
	}

	public static processOR(orQuery: FILTER[], dataset: IDataset): ISection[] {
		let overallResult: ISection[] = [];
		orQuery.forEach((filter) => {
			let branchResult = this.processFILTER(filter, dataset);
			overallResult = [...new Set([...overallResult, ...branchResult])];
		});
		return overallResult;
	}

	public static processAND(andQuery: FILTER[], dataset: IDataset): ISection[] {
		let results: ISection[] = [];
		andQuery.forEach((filter) => {
			let temp = this.processFILTER(filter, dataset);
			results = results.filter((section) => temp.includes(section));
		});
		return results;
	}

	public static processOptions(options: {COLUMNS: string[], ORDER?: string}, sections: ISection[]): InsightResult[] {
		let results: InsightResult[] = [];
		let field: string;
		sections.forEach((section) => {
			let result: InsightResult = {} as InsightResult;
			options.COLUMNS.forEach((key) => {
				field = extractField(key);
				result[key] = section[field as FieldT];
			});
			results.push(result);
		});
		if (options.ORDER) {
			field = options.ORDER;
			if (typeof results[0][field] === "string") {
				results.sort((a, b) => {
					if (a[field] > b[field]) {
						return -1;
					}
					if (a[field] < b[field]) {
						return 1;
					}
					return 0;
				});
			}
			if (typeof results[0][field] === "number") {
				results.sort((a, b) => Number(a[field]) - Number(b[field]));
			}
		}
		return results;
	}
}

function getDatasetId(json: any): string | false {
	if ("OPTIONS" in json
		&& "COLUMNS" in json.OPTIONS
		&& Array.isArray(json.OPTIONS.COLUMNS)
		&& json.OPTIONS.COLUMNS.length
	) {
		const key: string = json.OPTIONS.COLUMNS[0];
		const keyParts = key.split("_");
		if (keyParts.length === 2) {
			return keyParts[0];
		}
	}
	return false;
}

function validateQuery(json: any, targetDatasetId: string): string | true {
	try {
		JSON.parse(json);
	} catch (err) {
		return "Invalid query format";
	}
	if (!("WHERE" in json && "OPTIONS" in json)) {
		return "Missing Where|Options clause";
	}
	let query = json as IQuery;

	if (!checkOptions(query.OPTIONS, targetDatasetId)) {
		return "Invalid OPTIONS";
	}
	if (!isFilter(query.WHERE, targetDatasetId)) {
		return "Invalid WHERE";
	}
	return true;
}

function checkOptions(options: any, targetDatasetId: string): boolean {
	if (!(
		options
		&& typeof options === "object"
		&& Object.keys(options).length <= 2
		&& "COLUMNS" in options
		&& Array.isArray(options.COLUMNS)
		&& options.COLUMNS.length
	)) {
		return false;
	}
	if (options.ORDER && !options.COLUMNS.includes(options.ORDER)) {
		return false;
	}
	for (let col in options.COLUMNS) {
		if (!isValidQueryKey(col, targetDatasetId)) {
			return false;
		}
	}
	return true;
}

const isFilter = (filter: any, targetDatasetId: string): filter is FILTER => {
	if (!(filter && typeof filter === "object" && Object.keys(filter).length === 1)) {
		return false;
	}
	const child = Object.keys(filter)[0];
	switch (child) {
		case "AND":
		case "OR":
			return isLogicComparison(filter[child], targetDatasetId);
		case "NOT":
			return isFilter(filter[child], targetDatasetId);
		case "IS":
			return isValidKeyValuePair(filter[child], targetDatasetId, "s");
		case "LT":
		case "GT":
		case "EQ":
			return isValidKeyValuePair(filter[child], targetDatasetId, "n");
		default:
			return false;
	}
};

const isLogicComparison = (logic: any, targetDatasetId: string): logic is LOGICCOMPARISON => {
	if (!(logic && Array.isArray(logic) && logic.length >= 2)) {
		return false;
	}
	for (let filter in logic) {
		if (!isFilter(filter, targetDatasetId)) {
			return false;
		}
	}
	return true;
};

function isValidKeyValuePair(pair: any, targetDatasetId: string, expectedFieldType?: string) {
	if (!(pair && typeof pair === "object" && Object.keys(pair).length === 1)) {
		return false;
	}
	const key = extractField(pair);
	if (!isValidQueryKey(key,targetDatasetId, expectedFieldType)) {
		return false;
	}
	switch (expectedFieldType) {
		case "n":
			return typeof pair[key] === "number";
		case "s":
			return typeof pair[key] === "string";
		default:
			return true;
	}
}

function isValidQueryKey(key: string, targetDatasetID: string, expectedFieldType?: string): boolean {
	const keyParts = key.split("_");
	if (keyParts.length === 2 && keyParts[0].length && keyParts[1].length) {
		if (keyParts[0] === targetDatasetID) {
			if (keyParts[1] in Section.fieldName) {
				if (expectedFieldType && Section.fieldName[keyParts[1] as FieldT][1] !== expectedFieldType) {
					return false;
				}
				return true;
			}
		}
	}
	return false;
}

function extractField (key: KeyValuePair | string){
	if (typeof key !== "string") {
		key = Object.keys(key)[0];
	}
	const split = key.split("_");
	return split.length === 2 ? split[1] : "";
}
