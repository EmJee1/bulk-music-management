const { app, BrowserWindow, dialog, ipcMain } = require('electron')
const { scanAllAudioFiles, removeIllegalChars } = require('./utils/utils.js')
const mm = require('music-metadata')
const path = require('path')
const fs = require('fs')

const createWindow = () => {
	let win = new BrowserWindow({
		width: 1000,
		height: 800,
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

	ipcMain.on('TASK_RUN_RENAME', (e, store) => {
		console.log(store)
		let namingStructure = [['track', 'no'], 'title', 'artist']
		let namingSeparator = ' - '
		if (!store.files || !store.files.length) {
			// handle fatal error -> error message on client
			console.error('no files')
			return
		}
		if (!store.namingStructure || !Array.isArray(store.namingStructure)) {
			// handle error -> switch to default naming structure
			console.error('no naming structure')
			return
		} else namingStructure = store.namingStructure
		store.files.forEach(async file => {
			console.log(file)
			if (!['.mp3', '.wav'].includes(path.extname(file))) {
				// handle error -> log to console
				console.error('no valid music file')
				return
			}

			try {
				const common = (await mm.parseFile(file)).common

				let newFileName = ''

				namingStructure.map((i, interations) => {
					if (interations !== 0) newFileName += namingSeparator
					if (Array.isArray(i)) {
						let current = common[i[0]]
						i.map((i2, index) => {
							if (index !== 0) current = current[i2]
						})
						newFileName += current
					} else newFileName += common[i]
				})

				newFileName += path.extname(file)
				newFileName = removeIllegalChars(newFileName)

				const newPathName = path.join(path.dirname(file), newFileName)

				console.log(newPathName)

				fs.renameSync(file, newPathName)
			} catch (err) {
				console.error(err)
			}
		})
	})
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => app.quit())

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) createWindow()
})