import { Transform } from "stream";
import { IUser } from ".";

const ENCODED_FIELDS: readonly [...(keyof IUser)[]] = ['email', 'password'];

const encodeEntriesByFields = <T>({ entries, encodedFields, encoding = 'hex' }: {
	entries: [T, unknown][];
	encodedFields: readonly [...T[]];
	encoding?: 'hex' | 'base64';
}) => {
	return entries.map(([field, value]) => {
		if (encodedFields.includes(field) && typeof value === 'string') {
			const encodedValue = Buffer.from(value).toString(encoding);
			return [field, encodedValue];
		}
		return [field, value];
	});
};


export const guardian = new Transform({
	objectMode: true,
	transform(user: IUser, encoding, next) {
		const userEntries = Object.entries(user) as [keyof IUser, string][];

		const encodedEntries = encodeEntriesByFields({
			entries: userEntries,
			encodedFields: ENCODED_FIELDS
		});

		const encodedUser = Object.fromEntries(encodedEntries) as IUser;

		this.push(encodedUser);
		next();
	}
});