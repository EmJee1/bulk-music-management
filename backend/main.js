const { app, BrowserWindow, dialog, ipcMain } = require('electron')
const { scanAllAudioFiles } = require('./utils/utils.js')
const path = require('path')

const createWindow = () => {
	let win = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			preload: path.join(__dirname, '..', 'frontend/eventHandler.js'),
			contextIsolation: true,
			sandbox: true,
		},
	})

	win.loadFile(path.join(__dirname, '..', 'frontend/views/index.html'))

	ipcMain.on('TASK_FOLDER_SELECT', async () => {
		const res = await dialog.showOpenDialog(win, {
			properties: ['openDirectory'],
		})

		if (!res || res.canceled) {
			win.webContents.send('DATA_FOLDER_SELECT_CANCELED')
			return
		}

		win.webContents.send('DATA_FOLDER_SELECT', res.filePaths[0])
	})

	ipcMain.on('TASK_RUN_SCAN_FILES', (e, store) => {
		const files = scanAllAudioFiles(store.path)
		win.webContents.send('DATA_FILE_SCAN', files)
	})

	ipcMain.on('TASK_RUN_RENAME', async (e, store) => {
		console.log(store)
	})
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => app.quit())

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) createWindow()
})