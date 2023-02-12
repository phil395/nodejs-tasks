import { Transform } from "node:stream";

export class TransformWrap {
	private data: string = '';

	protected stream = new Transform({
		defaultEncoding: 'utf8',
		transform: (chunk, _, next) => {
		  this.data += chunk
			next()
		},
		flush: (next) => {
		  const transformed = this.transform(this.data)
			next(null, transformed) // push data in readable stream
		},
	});

	protected transform(data: string): string {
		// will be overridden
		return data
	}
}
