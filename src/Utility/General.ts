export const isValidId = ((id: string): boolean => !/(_+)|(^\s*$)/.test(id));
export const isIdInList = ((id: string, idList: string[]) => idList.includes(id));
