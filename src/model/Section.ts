import JSZip from "jszip";
import {Course} from "./Course";
import {InsightError} from "../controller/IInsightFacade";

export interface ISection {
	section: string, // Not necessary (if section is 'overall', change the year to 1900)
	dept: string,   // i.e. CPSC,BIOL
	id: string, 	// Course Code
	avg: number,	//  Course Avg
	instructor: string,		// Course Instructor
	title: string, 	// Course title
	pass: number,
	fail: number,
	audit: number,
	uuid: string,	// Course unique key
	year: number
}

export class Section {
	public static async parseSection(json: any): Promise<ISection> {
		const section: ISection = {} as ISection;
		// {
		// 	"Title": "adv plnt comm",
		// 	"id": 24495,
		// 	"Professor": "",
		// 	"Audit": 1,
		// 	"Year": "2008",
		// 	"Course": "526",
		// 	"Pass": 6,
		// 	"Fail": 0,
		// 	"Avg": 83.83,
		// 	"Subject": "bota"
		// }
		// Validate that the json parameter is of type object (null check)
		console.log("Testing");
		console.log(json.has("Title") ? "true" : "false");
		console.log("Title" in json ? "true" : "false");
		console.log(json.title ? "true" : "false");
		if (json === null) {
			return Promise.reject("Null Check Failed");
		}
		if (json.has("Title") &&
			json.has("id") &&
			json.has("Professor") &&
			json.has("Audit") &&
			json.has("Year") &&
			json.has("Course") &&
			json.has("Pass") &&
			json.has("Fail") &&
			json.has("Avg") &&
			json.has("Subject")
		) {
			section.dept = json.Subject;
			section.id = json.Course;
			section.avg = json.Avg;
			section.instructor = json.Professor;
			section.title = json.Title;
			section.pass = json.Pass;
			section.fail = json.Fail;
			section.audit = json.Audit;
			section.uuid = json.id;
			if (json.has("Section") && json.Section === "overall") {
				section.year = 1900;
			} else {
				section.year = json.Year;
			}
		}
			// TODO: validate that the json parameter contains all the 11 fields except "section" (if any field is missing, it should fail)
			// if (json.dept && section.)
			// TODO: populate the fields in the section variable (this and previous todo may be done in 1 go)

		{
			return section;
		}
	}
}
