import {ICourse, Course} from "./Course";
import {InsightDatasetKind, InsightError} from "../controller/IInsightFacade";
import JSZip, {JSZipObject} from "jszip";
import {fdatasync} from "fs";

export interface IDataset {
	id: string,
	kind: InsightDatasetKind,
	courses: ICourse[]
}

export class Dataset {
	public static async parseDataset(id: string, content: string, kind: InsightDatasetKind): Promise<Dataset> {

		const dataset: IDataset = {} as IDataset;
		const zip = new JSZip();
		await zip.loadAsync(content, {base64: true});
		let countSkip: number;
		const folders = zip.filter((pathName: string, file: JSZip.JSZipObject) => {
			return (file.name.startsWith("courses/"));
		});
		if (folders.length === 0) {
			// we are not having the courses root folder
			return Promise.reject(new InsightError());
		}
		// Loop through each file and pass them to parseCourse
		zip.folder("courses")?.forEach((pathName: string, file: JSZip.JSZipObject) => {
			// console.log(pathName);
			return Course.parseCourse(file)
				.then((course) => {
					// else, populate the dataset.courses variable
					dataset.courses.push(course);
				})
				.catch(() => {
					// If the parseCourse gave an error, don't throw it, just skip it
					countSkip++;
					console.log("Number of files skipped: " + countSkip);
				});
		});
		// Check if the dataset.courses is empty => throw an error
		if (dataset.courses.length === 0) {
			return Promise.reject(new InsightError());
		}
		dataset.courses.forEach((course) => {
			console.log(course);
		});
		dataset.id = id;
		dataset.kind = kind;
		return dataset;
	}
}
