import {FieldT, Section} from "../CourseDataset/Section";
import {FILTER, IQuery, KeyValuePair, LOGICCOMPARISON} from "./Query";

export function getDatasetId(json: any): string | false {
	if ("OPTIONS" in json && "COLUMNS" in json.OPTIONS
		&& Array.isArray(json.OPTIONS.COLUMNS) && json.OPTIONS.COLUMNS.length
	) {
		const key: string = json.OPTIONS.COLUMNS[0];
		const keyParts = key.split("_");
		if (keyParts.length === 2) {
			return keyParts[0];
		}
	}
	return false;
}

export function validateQuery(json: any, targetDatasetId: string): string | true {
	try {
		const queryString: string  = JSON.stringify(json);
		JSON.parse(queryString);
	} catch (err) {
		return "Invalid query format";
	}
	if (!("WHERE" in json && "OPTIONS" in json)) {
		return "Missing Where|Options clause";
	}
	if (Object.keys(json).length > 2) {
		return "Extra parameters other than Where and Options provided";
	}
	const query = json as IQuery;
	if (!checkOptions(query.OPTIONS, targetDatasetId)) {
		return "Invalid OPTIONS";
	}
	if (Object.keys(query.WHERE).length && !isFilter(query.WHERE, targetDatasetId)) {
		return "Invalid WHERE";
	}
	return true;
}

export function checkOptions(options: any, targetDatasetId: string): boolean {
	if (!(
		options && typeof options === "object" && Object.keys(options).length <= 2
		&& "COLUMNS" in options && Array.isArray(options.COLUMNS) && options.COLUMNS.length
	)) {
		return false;
	}
	if (options.ORDER && !options.COLUMNS.includes(options.ORDER)) {
		return false;
	}
	for (let col of options.COLUMNS) {
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
	const operator = Object.keys(filter)[0];
	switch (operator) {
		case "AND":
		case "OR":
			return isLogicComparison(filter[operator], targetDatasetId);
		case "NOT":
			return isFilter(filter[operator], targetDatasetId);
		case "IS":
			return isValidKeyValuePair(filter[operator], targetDatasetId, "s");
		case "LT":
		case "GT":
		case "EQ":
			return isValidKeyValuePair(filter[operator], targetDatasetId, "n");
		default:
			return false;
	}
};

const isLogicComparison = (logic: any, targetDatasetId: string): logic is LOGICCOMPARISON => {
	if (!(logic && Array.isArray(logic) && logic.length >= 1)) {
		return false;
	}
	for (let filter of logic) {
		if (!isFilter(filter, targetDatasetId)) {
			return false;
		}
	}
	return true;
};

export function isValidKeyValuePair(pair: any, targetDatasetId: string, expectedFieldType?: string) {
	const keys = Object.keys(pair);
	if (!(pair && typeof pair === "object" && keys.length === 1)) {
		return false;
	}
	if (!isValidQueryKey(keys[0], targetDatasetId, expectedFieldType)) {
		return false;
	}

	const value = pair[keys[0]];
	if (expectedFieldType === "s") {
		return typeof value === "string" && checkWildCard(value);
	} else if (expectedFieldType === "n") {
		return typeof value === "number";
	}
	return false;
}

export function checkWildCard(value: string): boolean {
	return !/.+\*.+/.test(value);
}

export function isValidQueryKey(key: string, targetDatasetID: string, expectedFieldType?: string): boolean {
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

export function extractField (key: KeyValuePair | string){
	if (typeof key !== "string") {
		key = Object.keys(key)[0];
	}
	const split = key.split("_");
	return split.length === 2 ? split[1] : "";
}
