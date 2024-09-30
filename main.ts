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
				console.log(target.text);
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
