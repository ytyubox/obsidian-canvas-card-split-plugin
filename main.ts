import {
	App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, ItemView, Menu
} from 'obsidian';
import { text } from 'stream/consumers';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		// Register an event listener that runs whenever the layout changes
		console.log("Act");
		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'split-card',
			name: 'split select card into small cards',
			callback: () => {
				const canvasView = this.app.workspace.getActiveViewOfType(ItemView);
				if (canvasView?.getViewType() !== 'canvas') return new Notice('Did not detect canvas');
				const canvas = (canvasView as any).canvas;
				const selections: Array<any> = Array.from(canvas.selection);
				const target = selections.first();
				if (!target) return new Notice("No selected card");
				if (isMarkdownList(target.text) === true) {
					const tree = parseMarkdownListToTree(target.text);
					console.log(JSON.stringify(tree, null, 2));
				} else console.log("No Act");
			}
		});
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

function isMarkdownList(input: string): boolean {
	// Regex to match unordered markdown list (starting with -, *, + followed by a space)
	const unorderedListRegex = /^\s*([-*+])\s+/;

	// Regex to match ordered markdown list (starting with a number followed by a period and a space)
	const orderedListRegex = /^\s*\d+\.\s+/;

	// Check if the input matches either unordered or ordered list patterns
	return unorderedListRegex.test(input) || orderedListRegex.test(input);
}

interface TreeNode {
	text: string;
	children: TreeNode[];
}

function parseMarkdownListToTree(markdown: string): TreeNode[] {
	const lines = markdown.split("\n");
	const root: TreeNode[] = [];
	const stack: { level: number; nodes: TreeNode[] }[] = [{ level: -1, nodes: root }];

	lines.forEach(line => {
		// Ignore empty lines
		if (line.trim().length === 0) return;

		// Determine the current level (indentation level, 2 spaces or a tab)
		const trimmedLine = line.trim();
		const level = line.length - trimmedLine.length;

		// Create a new node
		const newNode: TreeNode = { text: trimmedLine.replace(/^[-*+]|\d+\.\s*/, '').trim(), children: [] };

		// Adjust the stack to the current level
		while (stack.length > 0 && stack[stack.length - 1].level >= level) {
			stack.pop();
		}

		// Add the new node as a child of the current level node
		const parentNode = stack[stack.length - 1].nodes;
		parentNode.push(newNode);

		// Push this node onto the stack as the most recent parent
		stack.push({ level, nodes: newNode.children });
	});

	return root;
}


export const createChildFileNode = (canvas: any, parentNode: any, file: TFile, path: string, y: number) => {
	const node = addNode(
		canvas, random(16),
		{
			x: parentNode.x + parentNode.width + 200,
			y: y,
			width: parentNode.width,
			height: parentNode.height * 0.6,

			type: 'file',
			content: file.path,
			subpath: path,
		}
	);

	addEdge(canvas, random(16), {
		fromOrTo: "from",
		side: "right",
		node: parentNode
	}, {
		fromOrTo: "to",
		side: "left",
		node: <CanvasNodeData>node
	});

	canvas.requestSave();

	return node;
};