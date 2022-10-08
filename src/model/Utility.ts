import * as fs from "fs-extra";
import {persistDirectory} from "../controller/InsightFacade";
import path from "path";

const idsPath = "/_IDLIST.json";

export function isValidId(id: string, idList?: string[]) {
	if (/(_+) | (^\s*$)/.test(id)) {
		return false;
	} else if (idList) {
		return !idList.includes(id);
	}
	return true;
}

export function readDatasetIDs(): string[] {
	if (!fs.existsSync(persistDirectory + idsPath)) {
		return [];
	}
	const idsFileContent = fs.readJSONSync(persistDirectory + idsPath);
	return idsFileContent ? idsFileContent.IDs : [];
}


// export function createDirAndWriteIDs(id: string): void {
// 	let prevIds: string[] = [];
// 	if (!fs.existsSync(persistDirectory)) {
// 		fs.mkdirSync(path.join(persistDirectory + idsPath), {recursive: true});
// 	} else {
// 		prevIds = fs.readJSONSync(persistDirectory + idsPath).IDs as string[];
// 	}
// 	prevIds.push(id);
// 	fs.writeJSONSync(persistDirectory + idsPath, prevIds);
// }

export function removeFromDatasetIDs(id: string) {
	let IDs = readDatasetIDs();
	if (!IDs.length || !IDs.includes(id)) {
		return IDs;
	}
	IDs.splice(IDs.indexOf(id), 1);
	return;
}

