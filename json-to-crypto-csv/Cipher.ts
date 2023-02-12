import crypto from 'node:crypto'
import { Transform } from 'node:stream'
import { TransformWrap } from './Duplexable'


interface ICipher {
	getStream(): Transform;
}

export class Cipher extends TransformWrap implements ICipher {

	constructor(
		private algo: "aes-192-cbc",
		private password: string,
		private salt: string,
		private iv: string
	) {
		super()
	}

	getStream(): Transform {
	  return this.stream
	}

	private getIv(): Uint8Array {
		const nums = this.iv.split(' ').map(Number)
		return new Uint8Array(nums);
	}

	private createCipher(): crypto.Cipher {
		const key = crypto.scryptSync(this.password, this.salt, 24)
		const cipher = crypto.createCipheriv(this.algo, key, this.getIv())
		return cipher
	}

	private encryptData(data: string): string {
		const cipher = this.createCipher()
		const result = cipher.update(data, 'utf8', 'utf8')
		cipher.final()
		console.log('encryptedData. Leng', result.length)
		return result;
	}

	protected override transform(data: string): string {
		const encryptedData = this.encryptData(data)
		return encryptedData
	}
}
