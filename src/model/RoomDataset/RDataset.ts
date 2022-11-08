import {InsightDatasetKind, InsightError} from "../../controller/IInsightFacade";
import JSZip, {JSZipObject} from "jszip";
import {isValidId} from "../../Utility/General";
import {parse} from "parse5";
import {IRoom, Room} from "./Room";

export interface IRDataset {
	id: string,
	kind: InsightDatasetKind,
	rooms: IRoom[],
	numRows: number
}

export interface IBuilding {
	fullname: string;      // Full building name (e.g., "Hugh Dempster Pavilion").
	shortname: string;     // Short building name (e.g., "DMP").
	address: string;       // The building address. (e.g., "6245 Agronomy Road V6T 1Z4").
	href: string;		   // The link to the building
}

export class RDataset {
	public static async parseRDataset(id: string, content: string, kind: InsightDatasetKind): Promise<IRDataset> {
		const dataset: IRDataset = {id: "", kind: InsightDatasetKind.Sections, rooms: [], numRows: 0};
		let promises: Array<Promise<any>> = [];
		let room: Room = new Room(content);
		let file: string;
		// try {
		// 	file = await getContent(content);
		// } catch (err) {
		// 	return Promise.reject(err);
		// }
		// Parse5.parse(file: string) -> json: any
		// const document = parse(file);
		// returns a list of BuildingAndRooms
		// let buildings: IBuilding[] = traverseIndex(document);
		// for()
		// let rooms: IRoom[] = await room.parseRoom(buildings);
		try {
			await Promise.all(promises);
		} catch (err) {
			return Promise.reject(err);
		}
		dataset.id = id;
		dataset.kind = kind;
		// dataset.numRows = rooms.length;
		return dataset;
	}
}

// ---------- helper functions -----------
// function getContent(content: string): Promise<string>{
// 	const zip = new JSZip();
// 	return zip.loadAsync(content, {base64: true})
// 		.then(() =>  {
// 			// console.log(zip.file("index.htm"));
// 			// console.log(zip.folder("rooms")!.file("index.htm"));
// 			return  zip.file("index.htm")!.async("string");
// 		}).catch((err) => {
// 			return Promise.reject(err);
// 		});
// }

// export function traverseIndex(table: any): IBuilding {
// 	const name = "class";
// 	// const value = "views-field views-field-field-building-address";
// 	if (!(table || table.childNodes)) {
// 		return [];
// 	}
// 	// TODO: if found a tr with the appropriate td's, extract data from those td's and pass them to Room.ParseRoom along with the address
// 	console.log(table.childNodes);
// 	let totalChild: number = table.childNodes.length
//
// 	for ()
// 	if (table.nodeName === "tr" && table.tagName === "tr" && checkNodeAttributes(table.attrs, name, "views-field views-field-field-building-code")) {
// 		Room.parseRoom()
// 	}
// 	if (table.nodeName === "td" && table.tagName === "td" && checkNodeAttributes(table.attrs, name, "views-field views-field-field-building-address")) {
// 		readBuildingCode(table.childNodes, Build);
// 	}
// 	if (table.nodeName === "td" && table.tagName === "td" && checkNodeAttributes(table.attrs, name, "views-field views-field-field-title")) {
// 		readBuildingCode(table.childNodes, title);
// 	}
// 	let rooms : IRoom[] = [];
// 	for (let i: number = 0; i < totalChild; i++) {
// 		rooms = [...rooms, traverseIndexHelper(table.childNodes[i], result)];
// 	}
// 	return result;
// }

// Read Building short name, long name and address
export function readBuildingCode(childNodes: any[], result: string[]): void {
	childNodes.forEach((childNode) => {
		if (childNode.nodeName === "#text") {
			console.log(result);
			return childNode.value;
		}
	});
}

export function checkNodeAttributes(attributes: any[], name: string, value: string): boolean {
	const arrayResult = attributes.filter((attribute) => attribute.name === name && attribute.value === value);
	return arrayResult.length >= 1;
}

// function traverseBuildingCodeHelper(searchkey: string, jsontree: any, result: string[]): string[] {
// 	if (!jsontree) {
// 		return [];
// 	} else if (jsontree.nodeName === searchkey && jsontree.tagName === searchkey) {
// 		result.concat(searchTable(jsontree, result));
// 	} else {
// 		traverseBuildingCodeHelper(searchkey, jsontree.childNodes, result);
// 	}
// 	return result;
// }
