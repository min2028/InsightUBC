import {InsightDatasetKind, InsightError} from "../../../controller/IInsightFacade";
import JSZip from "jszip";
import {parse} from "parse5";
import {IRoomAndBuilding, Room} from "./Room";
import {HTMLParser} from "./HTMLParser";
import {isValidId} from "../../../Utility/General";
import {IDataset, IDatasetParser} from "../IDataset";
import * as http from "http";

export interface IBuildingData {
	fullname?: string;      // Full building name (e.g., "Hugh Dempster Pavilion").
	shortname?: string;     // Short building name (e.g., "DMP").
	address?: string;       // The building address. (e.g., "6245 Agronomy Road V6T 1Z4").
	href?: string;		    // The link to the building
}

export interface IGeoLocation {
	lat: number;		   // The latitude of the building, as received via HTTP request.
	lon: number;		   // The longitude of the building, as received via HTTP request.
}

export class RDataset extends HTMLParser implements IDatasetParser{
	public parseDataset(id: string, content: string): Promise<IDataset> {
		if (!isValidId(id)) {
			return Promise.reject("Invalid id");
		} else if (!content) {
			return Promise.reject("Empty content");
		}
		let dataset: IDataset = {id: id, kind: InsightDatasetKind.Rooms, dataList: [], numRows: 0};
		return this.getRooms(content)
			.then((rooms) => {
				dataset.dataList = rooms;
				dataset.numRows = rooms.length;
				return dataset;
			}).catch((err) => {
				return Promise.reject(err);
			});
	}

	// ---------- helper functions -----------
	private async getRooms(content: string): Promise<IRoomAndBuilding[]> {
		let rooms: IRoomAndBuilding[] = [];
		let promises: Array<Promise<any>> = [];
		let skippedBuildingsCount = 0;
		let zip: JSZip;
		let indexFile: string;
		let indexJson;
		try {
			zip = await this.validateAndGetZip(content);
			indexFile = await zip.file("index.htm")?.async("string") ?? "";
		} catch (err) {
			return Promise.reject("Invalid zip file");
		}
		try {
			indexJson = parse(indexFile); // return JSON of HTML
		} catch (err) {
			return Promise.reject("Invalid index html file");
		}
		let buildings = this.traverseJsonOfHTML(indexJson) as IBuildingData[];
		for(const buildingInfo of buildings) {
			let buildingFile: string;
			promises.push(this.findBuildingFile(zip, buildingInfo.href ?? "")
				.then((file) => {
					buildingFile = file;
					return this.getGeoLocation(buildingInfo.address ?? "");
				}).then((location) => {
					return Room.parseRoom(buildingFile, buildingInfo, location);
				}).then((buildingRooms) => {
					rooms.push(...buildingRooms);
				}).catch((err) => {
					skippedBuildingsCount++;
					// console.log("Invalid Building: " + err);
					// skipping
				}));
		}
		try {
			await Promise.all(promises);
		} catch (err) {
			return Promise.reject(err);
		}
		// console.log(`Skipped ${skippedBuildingsCount} buildings`);
		if (rooms.length === 0) {
			return Promise.reject("No valid buildings in the dataset");
		}
		return rooms;
	}

	private validateAndGetZip(content: string): Promise<JSZip>{
		const zip = new JSZip();
		return zip.loadAsync(content, {base64: true})
			.then(() =>  {
				const folders = zip.filter((pathName: string, file: JSZip.JSZipObject) => {
					return (file.name.startsWith("campus/discover/buildings-and-classrooms/"));
				});
				if (folders.length === 0) {
					return Promise.reject("Zip file is missing the 'buildings-and-rooms' folder.");
				} else if (!zip.file("index.htm")) {
					return Promise.reject("Zip file is missing the 'index' file.");
				} else {
					return zip;
				}
			}).catch((err) => {
				return Promise.reject(err);
			});
	}

	private findBuildingFile(zip: JSZip, buildingPath: string): Promise<string> {
		const buildingFiles = zip.filter((pathName: string, file: JSZip.JSZipObject) => {
			return pathName.endsWith(buildingPath.substring(2));
		});
		if (buildingFiles.length === 0) {
			return Promise.reject("The building file is not in the folder");
		}
		return buildingFiles[0].async("string");
	}

// {
// 	hostname: "http://cs310.students.cs.ubc.ca:11316/api/v1/project_team149",
// 	port: 80,
// 	path: `/${urlEncodedAddress}`,
// 	agent: false
// },
	public async getGeoLocation(address: string): Promise<IGeoLocation> {
		let geoLocation: IGeoLocation = {lat: 0, lon: 0};
		const urlEncodedAddress: string = encodeURIComponent(address);
		const url: string = `http://cs310.students.cs.ubc.ca:11316/api/v1/project_team149/${urlEncodedAddress}`;
		// console.log(url);
		return new Promise((resolve, reject) => {
			http.get(url, (res) => {
					// console.log(res);
				let contents = "";
				res.on("data", function (content) {
					contents += content;
				});
				// console.log(contents);
				res.on("end", function () {
					try {
						let result = JSON.parse(contents);
						// console.log(result);
						geoLocation.lat = result.lat;
						geoLocation.lon = result.lon;
						// if (!result.error) {
						// 	geoLocation.lat = result.lat;
						// 	geoLocation.lon = result.lon;
						// } // else {
						// throw Error(result.error);
						// }
						return resolve((geoLocation as IGeoLocation));
					} catch (e) {
						reject("Invalid JSON geolocation");
					}
				});
			}).on("error", function () {
				reject(new InsightError("parsing error"));
			});
		}
		);
	}

	public extractDataInRow(trChildNodes: any[]): IBuildingData {
		let buildingInfo: IBuildingData = {};
		trChildNodes.forEach((child: any) => {
			if (child.nodeName === "td" && child.tagName === "td") {
				if (this.checkNodeAttributes(
					child.attrs,
					"class",
					"views-field views-field-field-building-code"
				)) {
					buildingInfo.shortname = this.readTextData(child.childNodes);
				} else if (this.checkNodeAttributes(
					child.attrs,
					"class",
					"views-field views-field-title"
				)) {
					buildingInfo.fullname = this.readLinkAndTextData(child.childNodes).text;
				} else if (this.checkNodeAttributes(
					child.attrs,
					"class",
					"views-field views-field-field-building-address"
				)) {
					buildingInfo.address = this.readTextData(child.childNodes);
				} else if (this.checkNodeAttributes(
					child.attrs,
					"class",
					"views-field views-field-nothing"
				)){
					buildingInfo.href = this.readLinkAndTextData(child.childNodes).link;
				}
			}
		});
		if (Object.keys(buildingInfo).length === 4 && this.isValidRoomData(buildingInfo)) {
			return buildingInfo;
		}
		throw Error("Building info is not complete.");
	};
}
