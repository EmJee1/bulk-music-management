const { ipcRenderer } = require('electron')

process.once('loaded', () => {
	window.addEventListener('message', evt => {
		if (evt.data.type === 'TASK_FOLDER_SELECT')
			ipcRenderer.send('TASK_FOLDER_SELECT')

		if (evt.data.type === 'TASK_RUN_SCAN_FILES')
			ipcRenderer.send('TASK_RUN_SCAN_FILES', { path: evt.data.path })

		if (evt.data.type === 'TASK_RUN_RENAME')
			ipcRenderer.send('TASK_RUN_RENAME', {
				files: evt.data.files,
				namingStructure: evt.data.namingStructure,
			})
	})

	ipcRenderer.on('DATA_FOLDER_SELECT_CANCELED', (e, store) =>
		window.postMessage({ type: 'DATA_FOLDER_SELECT_CANCELED' })
	)

	ipcRenderer.on('DATA_FOLDER_SELECT', (e, store) =>
		window.postMessage({ type: 'DATA_FOLDER_SELECT', path: store })
	)

	ipcRenderer.on('DATA_FILE_SCAN', (e, store) =>
		window.postMessage({ type: 'DATA_FILE_SCAN', files: store })
	)
})