const mm = require('music-metadata')
const path = require('path')
const fs = require('fs')

const { parseNewFileName } = require('../utils/utils.js')

const renameFile = async filePath => {
	if (!['.wav', '.mp3'].includes(path.extname(filePath))) {
		console.error(
			`We currently only support .mp3 and .wav files, we skipped ${path.basename(
				filePath
			)}`
		)
		return
	}

	try {
		const common = (await mm.parseFile(filePath)).common

		const newPath = path.join(
			path.dirname(filePath),
			parseNewFileName(common, path.extname(filePath))
		)

		fs.renameSync(filePath, newPath)
	} catch (err) {
		console.error(err)
	}
}

module.exports = scanAllAudioFiles