import {IDataset} from "../Dataset/Dataset";
import {FieldT, ISection, Section} from "../Dataset/Section";
import {InsightResult} from "../../controller/IInsightFacade";
import {FILTER, KeyValuePair} from "./Query";
import {extractField} from "./QueryValidator";

export function processFILTER(filter: any, dataset: IDataset): ISection[]{
	const child = Object.keys(filter)[0];
	switch (child) {
		case "AND":
			return processAND(filter[child] as FILTER[], dataset);
		case "OR":
			return processOR(filter[child] as FILTER[], dataset);
		case "NOT":
			return processNOT(filter[child] as FILTER, dataset);
		case "IS":
			return processSCOMP(filter[child] as KeyValuePair, dataset);
		case "LT":
		case "GT":
		case "EQ":
			return processMComp(filter[child] as KeyValuePair, dataset, child);
		default:
			return [];
	}
}

export function processSCOMP(key: KeyValuePair, dataset: IDataset): ISection[] {
	let field: string = extractField(key);
	let sections: ISection[] = [];
	let value: string = String(Object.values(key)[0]);
	dataset.courses.forEach((course) =>
		course.sections.forEach((section) => {
			if (value.startsWith("*") && value.endsWith("*") && value.length >= 2) {
				let substring: string = value.substring(1, value.length - 1);
				if (String(section[field as FieldT]).includes(substring)) {
					sections.push(section);
				}
			} else if (value.startsWith("*")) {
				let substring: string = value.substring(1);
				if (String(section[field as FieldT]).endsWith(substring)) {
					sections.push(section);
				}
			} else if (value.endsWith("*")) {
				let substring: string = value.substring(0, value.length - 1);
				if (String(section[field as FieldT]).startsWith(substring)) {
					sections.push(section);
				}
			} else if (section[field as FieldT] === value) {
				sections.push(section);
			}
		})
	);
	return sections;
}

export function processMComp(key: KeyValuePair, dataset: IDataset, operator: "LT" | "GT" | "EQ" ): ISection[] {
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

export function processNOT(notQuery: FILTER, dataset: IDataset): ISection[] {
	let results: ISection[] = [];
	let temp = processFILTER(notQuery, dataset);
	dataset.courses.forEach((course) => results = [...results, ...course.sections]);
	results = results.filter((section) => !temp.includes(section));
	return results;
}

export function processOR(orQuery: FILTER[], dataset: IDataset): ISection[] {
	let results: ISection[] = [];
	orQuery.forEach((filter) => {
		let temp = processFILTER(filter, dataset);
		results = [...new Set([...results, ...temp])];
	});
	return results;
}

export function processAND(andQuery: FILTER[], dataset: IDataset): ISection[] {
	let results: ISection[] = [];
	let temp: ISection[];
	andQuery.forEach((filter, index) => {
		temp = processFILTER(filter, dataset);
		if (index === 0) {
			results = temp;
		} else {
			results = results.filter((section) => temp.includes(section));
		}
	});
	return results;
}

export function processOptions(options: {COLUMNS: string[], ORDER?: string}, sections: ISection[]): InsightResult[] {
	let results: InsightResult[] = processCOLUMNS(options.COLUMNS, sections);
	results = processORDER(results, options.ORDER);
	return results;
}

export function processCOLUMNS(columns: string[], sections: ISection[]): InsightResult[] {
	let results: InsightResult[] = [];
	let field: string;
	sections.forEach((section) => {
		let result: InsightResult = {} as InsightResult;
		columns.forEach((key) => {
			field = extractField(key);
			result[key] = section[field as FieldT];
		});
		results.push(result);
	});
	return results;
}

export function processORDER(results: InsightResult[], order?: string) {
	if (order) {
		const field = extractField(order);
		if (Section.fieldName[field as FieldT][1] === "s") {
			results.sort((a, b) => {
				return (a[order] as string) < (b[order] as string) ? -1 : 1;
			});
		} else {
			results.sort((a, b) => Number(a[order]) - Number(b[order]));
		}
	}
	return results;
}
