import {ISection, Section} from "./Section";
import JSZip from "jszip";
import {InsightError} from "../controller/IInsightFacade";

export interface ICourse {
	// dept: string,
	// code: string,
	sections: ISection[]
}

export class Course {
	public static async parseCourse(file: JSZip.JSZipObject): Promise<ICourse> {
		const course: ICourse = {} as ICourse;
		let countSkip: number;

		// Checking validity of the file
		// const content =
		// // At this point, content is a valid course
		// (content.results as any[]).forEach((item) => {
		// 	Section.parseSection(item)
		// 		.then((section) => {
		// 			course.sections.push(section);
		// 		})
		// 		.catch(()=> {
		// 			// skipping
		// 			countSkip++;
		// 			return;
		// 		});
		// });

		// TODO: loop through each item of result and pass them to parseSection
		// TODO: if the parseSection gave an error, just skip it and don't throw the error
		// TODO: populate the course.sections variable with the result
		// TODO: check if sections[] was empty, throw an error
		// console.log(`file ${file}`);
		// console.log("content:");
		// console.log(content);

		return course;
	}

	private getContent(file: JSZip.JSZipObject) {
		return new Promise ((resolve, reject) => {
			resolve(null);
		}).then(()=> {
			return file.async("string");
		}).then((cont)=> {
			return JSON.parse(cont);
		}).then((json) => {
			if (!(json && "result" in json && Array.isArray(json.result) && "rank" in json)) {
				return Promise.reject();
			}
			return;
		}).catch((error) => {
			return Promise.reject("Invalid or empty course");
		});
	}
}

function readData(file: JSZip.JSZipObject): Promise<Course> {
	return new Promise ((resolve, reject) => {
		// do nothing
	}).then(()=> {
		return file.async("string");
	}).then((cont)=> {
		return JSON.parse(cont);
	}).catch((error) => {
		return (new InsightError());
	});
}
