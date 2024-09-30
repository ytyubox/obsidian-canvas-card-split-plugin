import {
	App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, ItemView, Menu
} from 'obsidian';

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
				const selection: Array<any> = Array.from(canvas.selection);
				console.log(selection);
			}
		});

		this.registerEvent(this.app.workspace.on("canvas-style-menu:patched-canvas", () => {
			refreshAllCanvasView(this.app);
		}));
		this.registerEvent(this.app.workspace.on("canvas-style-menu:patch-canvas-node", () => {
			this.patchCanvasNode();
			refreshAllCanvasView(this.app);
		}));
		this.registerEvent(this.app.workspace.on("canvas:selection-menu", (menu, canvas) => {
			handleSelectionContextMenu(this, menu, canvas, menuConfig, subMenuConfig, toggleMenu);
		}));
		this.registerEvent(this.app.workspace.on("canvas:node-menu", (menu, node) => {
			handleNodeContextMenu(this, menu, node, menuConfig, subMenuConfig, toggleMenu);
		}));
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
