import fs from 'node:fs'
import path from 'node:path'
import { pipeline } from 'node:stream'
import { createGzip } from 'node:zlib'

import { Converter } from './Converter'
import { Cipher } from './Cipher'
import { Inquirer, IQuestion } from './Inquirer'
import { stain } from './utils'

const questions: IQuestion[] = [
	{ key: 'password', question: 'Input password' },
	{ key: 'salt', question: 'Input salt' },
	{ key: 'iv', question: 'Input iv' }
]

const main = async () => {
	const inputPath = path.resolve(__dirname, 'data', 'comments.json');
	const outputPath = path.resolve(__dirname, 'data', 'output.txt.gz')

	const answers = await new Inquirer<['password', 'salt', 'iv']>(questions).getAnswers()

	const cipherStream = new Cipher(
		"aes-192-cbc", 
		answers.password,
		answers.salt, 
		answers.iv // "1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16"
	).getStream()

	const converterStream = new Converter().getStream()

	const onEnd = (err: NodeJS.ErrnoException | null) => {
		if (err) {
			console.log(err)
			process.exit(1)
		}
		console.log(
			stain("The file conversion was successful\n", "green"), 
			"The result has been encrypted and gzipped\n",
			"Output path: ", outputPath
		)
		process.exit(0)
	}

	pipeline(
		fs.createReadStream(inputPath),
		converterStream,	
		cipherStream,
		createGzip(),
		fs.createWriteStream(outputPath),
		onEnd
	)
}

main()

