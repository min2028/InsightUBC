import {FieldT, ISection} from "../CourseDataset/Section";
import {FILTER, IQuery} from "./Query";
import {processAND} from "./QueryProcessor";
import {query} from "express";
import {InsightResult} from "../../controller/IInsightFacade";
import Decimal from "decimal.js";

export function QueryTransformer(filteredResults: any[], keys: string[]) {
	let results: any[][] = [];
	for (let section of filteredResults) {
		let location = findLocation(section, results, keys);
		if (location === -1) {
			results[results.length] = [];
			results[results.length].push(section);
		} else {
			results[location].push(section);
		}
	}
	return results;
}

export function findLocation(section: any, results: any[][], keys: string[]): number {
	let count = 0;
	for (let result of results) {
		for (let key of keys) {
			let realkey = key.split("_")[1];
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
				insightResult[column] = element[0][column.split("_")[1]];
			} else {
				insightResult[column] = applyrules(element, keys[column]);
			}
		}
		result.push(insightResult);
	}
	return result;
}

export function applyrules(results: any[], keys: any) {
	let field: string = Object.values(keys)[0] as string;
	let fieldName = field.split("_")[1];
	let max = results[0][fieldName], min = results[0][fieldName], sums = 0, sum = 0, count = 0, con: any[] = [];
	let total = new Decimal (0), avg = 0;
	switch (Object.keys(keys)[0]) {
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
