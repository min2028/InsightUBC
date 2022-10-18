// import {FILTER, IQuery, KeyValuePair, LOGICCOMPARISON, MCOMPARISON} from "./Query";
//
// export default class Tree<T> {
// 	protected root: TreeNode<T> | null;
//
// 	constructor() {
// 		this.root = null;
// 	}
//
// 	protected createNewNode(value: T): TreeNode<T>{
// 		return {data: value, children : []};
// 	}
//
// 	public insert (value: T): TreeNode<T> {
// 		if (this.root) {
// 			this.root.children.push(this.createNewNode(value));
// 		}
// 		const curr = this.createNewNode(value);
// 		this.root = curr;
// 		console.log(this.root.children);
// 		return this.root;
// 	};
// }
//
// export function buildTree(filter: FILTER): Tree<FILTER> {
// 	let tree: Tree<FILTER> = new Tree<FILTER>();
// 	let treeNode: TreeNode<FILTER> = {} as TreeNode<FILTER>;
// 	return buildTreeHelper(tree, filter, treeNode);
// }
//
// export function buildTreeHelper
// (tree: Tree<FILTER>, filter: FILTER | KeyValuePair, treeNode?: TreeNode<FILTER>): Tree<FILTER> {
// 	if (filter.type === "MCOMPARISON" || filter.type === "SCOMPARISON") {
// 		console.log(filter);
// 		tree.insert(filter);
// 	}
// 	if (filter.type === "NEGATION") {
// 		tree.insert(filter);
// 		buildTreeHelper(tree, filter.NOT);
// 	}
// 	if (filter.type === "LOGICCOMPARISON") {
// 		tree.insert(filter);
// 		if (filter.AND) {
// 			console.log("AND");
// 			// filter.AND.forEach((filt) => buildTreeHelper(tree, filt, treeNode));   // filt =  filter
// 			filter.AND.forEach((filt: FILTER | KeyValuePair) => {
// 				// console.log(filt);
// 				buildTreeHelper(tree, filt);
// 			});
// 		}
// 		if (filter.OR) {
// 			console.log("OR");
// 			tree.insert(filter);
// 			// console.log(treeNode.data);
// 			// console.log(treeNode.children);
// 			// filter.AND.forEach((filt) => buildTreeHelper(tree, filt, treeNode));   // filt =  filter
// 			filter.OR.forEach((filt: FILTER | KeyValuePair) => {
// 				// console.log(filt);
// 				buildTreeHelper(tree, filt);
// 				// treeNode.children.forEach((tNode) => buildTreeHelper(tree, filter, tNode)); // tNode = treeNode
// 				// filter.OR.forEach((filt) => buildTreeHelper(tree, filt, treeNode));   // filt =  filter
// 			});
// 		}
// 	}
// 	return tree;
// }
//
// interface TreeNode<T> {
// 	data: T;
// 	children: Array<TreeNode<T>>;
// }
