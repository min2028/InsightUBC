export function isValidId(id: string, idList?: string[]) {
	if (/(_+) | (^\s*$)/.test(id)) {
		return false;
	} else if (idList) {
		return !idList.includes(id);
	}
	return true;
}
