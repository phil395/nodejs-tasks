import { randomUUID } from "crypto";
import { IUser } from ".";

interface IPersistUser extends IUser {
	id: string;
}

export class DB {
	private users = new Map<string, IPersistUser>();

	addUser(user: IUser) {
		const id = randomUUID();
		this.users.set(id, { id, ...user });
		return id;
	}

	getUserById(id: string) {
		return this.users.get(id);
	}
}