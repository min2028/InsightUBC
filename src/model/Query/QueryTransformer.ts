import {InsightResult} from "../../controller/IInsightFacade";
import Decimal from "decimal.js";
import {extractField} from "./QueryValidator";
import {IData} from "../Dataset/IDataset";

export function QueryTransformer(filteredResults: IData[], keys: string[]) {
	let results: IData[][] = [];
	for (let section of filteredResults) {
		let location = findLocation(section, results, keys);
		if (location === -1) {
			results.push([]);
			// results[results.length] = [];
			results[results.length - 1].push(section);
		} else {
			results[location].push(section);
		}
	}
	return results;
}

export function findLocation(section: any, results: any[][], keys: string[]): number {
	// let count = 0;
	for (let result of results) {
		let count = 0;
		for (let key of keys) {
			let realkey = extractField(key);
			if (section[realkey] === result[0][realkey]) {
				count += 1;
			}
		}
		if (count === keys.length) {
			return results.indexOf(result);
		};
	}
	return -1;
}
// second argument should be query[Transform], query[Columns], keys should be query[Transform]
export function applyResults(results: any[][], columns: string[], keys: any): InsightResult[] {
	let result: InsightResult[] = [];
	for (let element of results) {
		let insightResult: InsightResult = {};
		for (let column of columns) {
			if (column.includes("_")) {
				insightResult[column] = element[0][extractField(column)];
			} else {
				// let int = keys.indexOf(column);
				for (let applykey of keys) {
					if (column === Object.keys(applykey)[0]) {
						insightResult[column] = applyrules(element, applykey);
					}
				}
				// insightResult[column] = applyrules(element, keys[int]);
			}
		}
		result.push(insightResult);
	}
	return result;
}

export function applyrules(results: any[], keys: any) {
	let keyName: string = Object.keys(keys)[0];
	let field: string = Object.values(keys[keyName])[0] as string;
	let fieldName = extractField(field);
	let max = results[0][fieldName], min = results[0][fieldName], sums = 0, sum = 0, count = 0, con: any[] = [];
	let total = new Decimal (0), avg = 0;
	switch (Object.keys(keys[keyName])[0]) {
		case "MAX":
			results.forEach((result) => {
				if (result[fieldName] > max) {
					max = result[fieldName];
				}
			});
			return max;
		case "MIN":
			results.forEach((result) => {
				if (result[fieldName] < min) {
					min = result[fieldName];
				}
			});
			return max;
		case "AVG":
			results.forEach((result) => {
				let value = new Decimal(result[fieldName]);
				total.add(value);
			});
			avg = total.toNumber() / results.length;
			return Number(avg.toFixed(2));
		case "COUNT":
			results.forEach((result) => {
				if (!con.includes(result[fieldName])) {
					con.push(result[fieldName]);
					count++;
				}
			});
			return count;
		case "SUM":
			results.forEach((result) => {
				sums += result[fieldName];
			});
			return Number(sum.toFixed(2));
	}
}
