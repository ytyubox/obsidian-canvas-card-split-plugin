import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, ItemView, Menu } from 'obsidian';

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
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');
		// Register an event listener that runs whenever the layout changes
		this.registerEvent(this.app.workspace.on('layout-change', () => {
			this.addRightClickContextMenu();
		}));
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

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
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

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
	// Function to add right-click (context menu) event listener to canvas cards
	addRightClickContextMenu() {
		const activeLeaf = this.app.workspace.activeLeaf;

		// Check if the current view is a Canvas view
		if (activeLeaf && activeLeaf.view.getViewType() === 'canvas') {
			const canvas = (activeLeaf.view as any).canvas;

			// Iterate through all canvas nodes (cards)
			canvas.nodes.forEach((node: any) => {
				const cardElement = node.el;

				// Ensure the right-click event listener is not added multiple times
				if (!cardElement.dataset.hasContextMenu) {
					cardElement.dataset.hasContextMenu = "true";

					// Add the right-click event listener
					cardElement.addEventListener('contextmenu', (event: MouseEvent) => {
						event.preventDefault();  // Prevent the default browser context menu

						// Show the custom context menu
						this.showCustomContextMenu(event, node);
					});
				}
			});
		}
	}
	// Function to show a custom context menu at the position of the mouse click
	showCustomContextMenu(event: MouseEvent, node: any) {
		const menu = new Menu();

		// Add a custom action to the context menu
		menu.addItem((item) => {
			item.setTitle("Custom Action")
				.setIcon("checkmark")
				.onClick(() => {
					new Notice(`Custom action for card ID: ${node.id}`);
				});
		});

		// You can add more custom actions here if needed
		menu.addItem((item) => {
			item.setTitle("Another Action")
				.setIcon("star")
				.onClick(() => {
					new Notice(`Another action for card ID: ${node.id}`);
				});
		});

		// Show the custom menu at the mouse cursor's position
		menu.showAtPosition({ x: event.pageX, y: event.pageY });
	}
}

