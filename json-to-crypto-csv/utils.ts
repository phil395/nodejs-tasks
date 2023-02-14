import path from "node:path";
import fs from "node:fs"


const colorMap = {
	green: 2,
	red: 1,
	blue: 4
} as const

const stain = (
	s: string, 
	color: keyof typeof colorMap
) => (
	`\x1b[3${colorMap[color]}m${s}\x1b[0m`
);


export const onEnd = (err: NodeJS.ErrnoException | null) => {
	if (err) {
		console.log(stain(err.message, 'red'))
		process.exit(1)
	}
	console.log(
		stain("The file conversion was successful\n", "green"), 
		"The result has been encrypted and gzipped\n",
	)
	process.exit(0)
}


export const treatPaths = (inputPath: unknown, outputName: unknown) => {
	if (typeof inputPath !== 'string') {
		onEnd(new Error('You must specify the input file. Use "--help" to view help.')) // process.exit(1)
	}
	
	try {
		fs.accessSync(inputPath as string, fs.constants.R_OK)
	} catch {
		onEnd(
			new Error('File "' + inputPath + '" does not exist. You must specify the input file')
		)
	}

	let resultOutputName = 'output.gz';
	
	if (typeof outputName === 'string') {
		resultOutputName = outputName.endsWith('.gz') ? outputName : outputName + '.gz'
	}

	return [inputPath as string, path.resolve(__dirname, resultOutputName)]
}
