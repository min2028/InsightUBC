// import {Building} from "./RDataset";

export interface IRoom {
	fullname: string;      // Full building name (e.g., "Hugh Dempster Pavilion").
	shortname: string;     // Short building name (e.g., "DMP").
	number: string;        // The room number (e.g., "201").
	name: string; 		   // The room id; should be rooms_shortname+"_"+rooms_number.
	address: string;       // The building address. (e.g., "6245 Agronomy Road V6T 1Z4").
	lat: number;		   // The latitude of the building, as received via HTTP request.
	lon: number;		   // The longitude of the building, as received via HTTP request.
	seats: number;		   // The number of seats in the room. The default value for this field is 0.
	type: string;		   // The room type (e.g., "Small Group").
	furniture: string;     // The room furniture (e.g., "Classroom-Movable Tables & Chairs").
	href: string           // The link to full rooms
}

export class Room {
	private content: string;

	constructor(content: string) {
		this.content = content;
	}

	public static fieldName = {
		fullname: "s",
		shortname: "s",
		number: "s",
		name: "s",
		address: "s",
		lat: "n",
		lon: "n",
		seats: "n",
		type: "s",
		furniture: "s",
		href: "s"
	};


	// Takes in the childNodes of tr which is a list of [td and #text]
	// public async parseRoom(buildingsInfo: Building[]): Promise<IRoom[]> {
	// 	const room: any = {};
	// 	getContent(buildingInfo.href, content);
	// 	room.fullname = buildingInfo.fullname;
	// 	room.shortname = buildingInfo.shortname;
	// 	room.address = buildingInfo.address;
	// 	return Promise.resolve(room as IRoom);
	// }

	// private static getContent(href: string) {
	//
	// }
	//
	// public static parseRow(json: any[]) {
	//
	// }
	//
	// public static async parseLink(link: string) {
	//
	// }
}

