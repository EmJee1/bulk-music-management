const path = require('path')
const fs = require('fs')

const removeIllegalChars = str => {
	if (!str) return 'unknown'
	const parsed = str
		.toString()
		.replace(/[/\\?%*:|"<>]/g, '')
		.trim()
	if (!parsed) return 'unknown'
	return parsed
}

const parseNewFileName = (common, ext) => {
	let trackNumber = common.track.no ?? 0
	trackNumber = trackNumber < 10 ? `0${common.track.no}` : common.track.no

	return removeIllegalChars(
		`${removeIllegalChars(trackNumber)} - ${removeIllegalChars(
			common.title
		)} - ${removeIllegalChars(common.artist)}${ext}`
	)
}

const parseNewFileLocation = common => {
	const artist = removeIllegalChars(common.artist)
	const album = removeIllegalChars(common.album)
	return artist + ' - ' + album
}

const scanAllAudioFiles = rootDir => {
	const filesToRename = []

	const scanFileDir = dir => {
		if (!dir) {
			console.error('The path is empty or does not exist:', dir)
			return
		}
		fs.readdirSync(dir).forEach(file => {
			if (!fs.lstatSync(path.join(dir, file)).isDirectory()) {
				if (!['.wav', '.mp3'].includes(path.extname(file))) {
					console.error('We skipped files that were not .mp3 or .wav:', file)
					return
				}
				filesToRename.push(path.join(dir, file))
				// renameFile(path.join(dir, file))
			} else {
				scanFileDir(path.join(dir, file))
			}
		})
	}

	scanFileDir(rootDir)

	return filesToRename
}

module.exports = {
	removeIllegalChars,
	parseNewFileName,
	parseNewFileLocation,
	scanAllAudioFiles
}