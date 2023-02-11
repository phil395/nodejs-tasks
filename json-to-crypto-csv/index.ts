import fs from 'node:fs'
import path from 'node:path'
import { pipeline } from 'node:stream'

import { Converter } from './Converter'


const main = () => {
	const inputFilePath = path.resolve('data', 'comments.json');
	const inputStream= fs.createReadStream(inputFilePath)

	const csvStream = new Converter().getStream()

	pipeline(
		inputStream,
		csvStream,
		(err) => {
			if (err) return;
		}
	)

}


main()
