import * as fs from "fs-extra";
import path from "path";
import {InsightDataset} from "../controller/IInsightFacade";
import {IDataset} from "../model/Dataset/IDataset";

const persistDirectory = "./data";
const idsPath = "/_METADATA.json";
const contentPath = "/content";

export class Disk {
	/**
	 * @EFFECT if the file containing ids already exists on the disk, updates the file with the idList
	 * @EFFECT if the file containing dataset ids does not exist on the disk, creates a new one containing the ids
	 */
	public static writeDatasetMeta(insDatasetList: InsightDataset[]): void {
		if (!fs.existsSync(	persistDirectory + idsPath)) {
			fs.mkdirSync(path.join(persistDirectory + contentPath), {recursive: true});
			fs.createFileSync(persistDirectory + idsPath);
		}
		fs.writeJSONSync(persistDirectory + idsPath, insDatasetList);
	}

	public static writeDataset(dataset: IDataset): void {
		const fileName = Buffer.from(dataset.id).toString("hex");
		if (!fs.existsSync(	persistDirectory + contentPath)) {
			fs.mkdirSync(path.join(persistDirectory + contentPath), {recursive: true});
		}
		fs.createFileSync(persistDirectory + contentPath + `/${fileName}.json`);
		fs.writeJSONSync(persistDirectory + contentPath + `/${fileName}.json`, dataset);
	}

	public static readDatasetMeta(): InsightDataset[] {
		if (!fs.existsSync(persistDirectory + idsPath)) {
			return [];
		}
		const idsFileContent = fs.readJSONSync(persistDirectory + idsPath);
		return idsFileContent ? idsFileContent : [];
	}

	public static readDataset(id: string): IDataset | null {
		const fileName = Buffer.from(id).toString("hex");
		if (!fs.existsSync(persistDirectory + contentPath + `/${fileName}.json`)) {
			return null;
		}
		return fs.readJSONSync(persistDirectory + contentPath + `/${fileName}.json`);
	}

	public static removeDataset(id: string): void {
		const fileName = Buffer.from(id).toString("hex");
		// console.log(fileName);
		if (!fs.existsSync(persistDirectory + contentPath + `/${fileName}.json`)) {
			return;
		}
		return fs.removeSync(persistDirectory + contentPath + `/${fileName}.json`);
	}
}
