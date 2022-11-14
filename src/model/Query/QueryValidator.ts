import {FieldT, Section} from "../CourseDataset/Section";
import {FILTER, IQuery, KeyValuePair, LOGICCOMPARISON} from "./Query";
import {Room} from "../RoomDataset/Room";

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
	if (Object.keys(json).length > 3) {
		return "Extra parameters other than Where and Options provided";
	}
	const query = json as IQuery;
	if (!checkOptions(query.OPTIONS, targetDatasetId)) {
		return "Invalid OPTIONS";
	}
	if (Object.keys(query.WHERE).length && !isFilter(query.WHERE, targetDatasetId)) {
		return "Invalid WHERE";
	}
	if ("TRANSFORMATION" in json) {
		if (!checkTransformations(query.TRANSFORMATION, query.OPTIONS.COLUMNS, targetDatasetId)) {
			return  "Invalid Transformations";
		}
	}
	return true;
}

export function checkTransformations(transforms: any, columns: any[], targerDatasetID: string): boolean {
	if (!(Object.keys(transforms).length !== 2 &&  "GROUP" in transforms
		&& Array.isArray(transforms.GROUP) && "APPLY" in transforms && Array.isArray(transforms.APPLY))) {
		return false;
	}
	if (!(transforms.APPLY && transforms.GROUP)) {
		return false;
	}
	if (!(columns.includes(transforms.GROUP) && columns.includes(Object.keys(transforms.APPLY)) )) {
		return false;
	}
	for (let apply of Object.keys(transforms.APPLY)) {
		if (apply.includes("_")) {
			return false;
		}
		let key = transforms.APPLY[apply];
		let token = Object.keys(key)[0];
		if (Object.values(key[token]).length > 1) {
			return false;
		}
		if (token === "MAX" || token === "MIN" || token === "AVG" || token === "SUM") {
			let applyRow = Object.values(key[token])[0];
			if (isValidQueryKey(applyRow as string, targerDatasetID, "n")) {
				return true;
			} else {
				return false;
			}
		} else if (token === "COUNT") {
			let applyRow = Object.values(key[token])[0];
			if (isValidQueryKey(applyRow as string, targerDatasetID)) {
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		};
	}
	return true;
}

export function checkOptions(options: any, targetDatasetId: string): boolean {
	if (!(options && typeof options === "object" && Object.keys(options).length <= 2
		&& "COLUMNS" in options && Array.isArray(options.COLUMNS) && options.COLUMNS.length)) {
		return false;
	}
	if (typeof options.ORDER === "string") {
		if (options.ORDER && !options.COLUMNS.includes(options.ORDER)) {
			return false;
		}
	} else {
		if (!(Object.keys(options).length === 2 && "dir" in options && "keys" in options
			&& (options["dir"] === "UP" || options["dir"] === "DOWN") && options.COLUMNS.includes(options["keys"]))) {
			return false;
		}
	}
	for (let col of options.COLUMNS) {
		if (col.includes("_")) {
			if (!isValidQueryKey(col, targetDatasetId)) {
				return false;
			}
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
			} else if (keyParts[1] in Room.fieldName) {
				// if (expectedFieldType && Room.fieldName[keyParts[1]][1] !== expectedFieldType) {
				// 	return false;
				// }
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
