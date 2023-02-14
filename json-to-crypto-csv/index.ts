import fs from 'node:fs'
import { pipeline } from 'node:stream'
import { createGzip } from 'node:zlib'

import { Converter } from './Converter'
import { Cipher } from './Cipher'
import { Inquirer, IQuestion } from './Inquirer'
import { ArgsParser } from './ArgsParser'
import { onEnd, printHelp, treatPaths } from './utils'


const questions: IQuestion[] = [
	{ key: 'password', question: 'Input password' },
	{ key: 'salt', question: 'Input salt' },
	{ key: 'iv', question: 'Input iv' }
]


const main = async () => {
	const args = new ArgsParser().getArgs()

	if (args.h || args.help) {
		printHelp()
		return;
	}

	const [inputPath, outputPath] = treatPaths(args.i, args.n) 

	const answers = await new Inquirer<['password', 'salt', 'iv']>(questions).getAnswers()

	const cipherStream = new Cipher(
		"aes-192-cbc", 
		answers.password,
		answers.salt, 
		answers.iv // 16 digits, like: "1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16"
	).getStream()

	const converterStream = new Converter().getStream()

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
