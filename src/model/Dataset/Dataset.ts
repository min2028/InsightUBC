import {Course, ICourse} from "./Course";
import {InsightDatasetKind} from "../../controller/IInsightFacade";
import JSZip, {JSZipObject} from "jszip";
import {isValidId} from "../../Utility/General";

export interface IDataset {
	id: string,
	kind: InsightDatasetKind,
	courses: ICourse[],
	numRows: number
}

export class Dataset {
	public static parseDataset(id: string, content: string, kind: InsightDatasetKind): Promise<IDataset> {
		const dataset: IDataset = {id: "", kind: InsightDatasetKind.Sections, courses: [], numRows: 0};
		let skippedCoursesCount = 0;
		let promises: Array<Promise<any>> = [];
		let sectionsCount = 0;

		if (!isValidId(id)) {
			return Promise.reject("Invalid id");
		} else if (!content) {
			return Promise.reject("Empty content");
		}
		return getContent(content)
			.then(async function(folder) {
				folder.forEach((pathName: string, file: JSZipObject) => {
					promises.push(Course.parseCourse(file)
						.then((course) => {
							// populating the dataset.courses variable
							dataset.courses.push(course);
							sectionsCount += course.sections.length;
						}).catch((err) => {
							// console.log("Invalid Course: " + err);
							// skipping
							skippedCoursesCount++;
						})
					);
				});
				await Promise.all(promises);
				// console.log(`Skipped ${skippedCoursesCount} sections`);

				// Checking if the dataset.courses is empty
				if (dataset.courses.length === 0) {
					return Promise.reject("No valid sections in the dataset");
				}
				dataset.id = id;
				dataset.kind = kind;
				dataset.numRows = sectionsCount;
				return dataset;
			}).catch((err) => {
				// console.log("Invalid Dataset: " + err);
				return Promise.reject(err);
			});
	}
}

// ---------- helper functions -----------
function getContent(content: string) {
	const zip = new JSZip();
	return zip.loadAsync(content, {base64: true})
		.then(() => {
			const folders = zip.filter((pathName: string, file: JSZip.JSZipObject) => {
				return (file.name.startsWith("courses/"));
			});
			if (folders.length === 0) {
				// we are not having the courses root folder
				return Promise.reject("Zip file is missing the 'courses' folder");
			}
			const folder = zip.folder("courses");
			if (!folder) {
				return Promise.reject("Zip filed is missing the 'courses' folder");
			} else {
				return folder;
			}
		}).catch((err) => {
			return Promise.reject(err);
		});
}
