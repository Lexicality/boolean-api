/*
   Copyright 2020 Lex Robinson

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
import "jest";
import createBoolean, {
	createToken,
	ReadOnlyBool,
	ReadWriteBool,
} from "./index";

describe("createToken", () => {
	it("should create a token", async () => {
		let token = await createToken();
		expect(typeof token).toBe("string");
	});

	it("creates a new token each time", async () => {
		let token1 = await createToken();
		let token2 = await createToken();
		expect(token1).not.toEqual(token2);
	});
});

describe("createBoolean", () => {
	let token: string;

	beforeEach(async () => {
		token = await createToken();
	});

	it("creates booleans", async () => {
		let bool = await createBoolean(token);
		expect(bool).toBeInstanceOf(ReadWriteBool);
	});

	it("accepts default values", async () => {
		let bool = await createBoolean(token, { value: true, label: "hello!" });
		expect(bool.value).toBe(true);
		expect(bool.label).toBe("hello!");
	});
});

describe("ReadWriteBool", () => {
	let token: string;

	beforeEach(async () => {
		token = await createToken();
	});

	it("works", async () => {
		let createdBool = await createBoolean(token, {
			value: true,
			label: "before",
		});

		let bool = new ReadWriteBool(createdBool.id, token);
		await bool.fetch();
		expect(bool.value).toEqual(createdBool.value);
		expect(bool.label).toEqual(createdBool.label);
		expect(bool.created_at).toEqual(createdBool.created_at);
	});

	it("is lazy", async () => {
		let createdBool = await createBoolean(token, {
			value: true,
			label: "before",
		});

		let bool = new ReadWriteBool(createdBool.id, token);
		expect(() => bool.value).toThrow();
		await bool.fetch();
		expect(bool.value).toEqual(createdBool.value);
		await createdBool.toggle();
		expect(bool.value).not.toEqual(createdBool.value);
	});

	it("doesn't validate IDs immediately", async () => {
		let bool = new ReadWriteBool("banana", token);

		await expect(bool.fetch()).rejects.toBeDefined();
	});

	it("can be given starting data", async () => {
		let bool = new ReadWriteBool("banana", token, {
			created_at: "foo",
			updated_at: "bar",
			value: true,
			label: "FILE_NOT_FOUND",
			id: "banana",
		});

		expect(bool.label).toEqual("FILE_NOT_FOUND");
	});

	it("vaguely checks its starting data", async () => {
		expect(
			() =>
				new ReadWriteBool("banana", token, {
					created_at: "foo",
					updated_at: "bar",
					value: true,
					label: "FILE_NOT_FOUND",
					id: "fish",
				}),
		).toThrow();
	});

	it("can be modified", async () => {
		let bool = await createBoolean(token, { value: true, label: "before" });

		expect(bool.value).toBe(true);
		expect(bool.label).toBe("before");

		let created = bool.created_at;
		let updated = bool.updated_at;

		await bool.update({ value: false, label: "after" });

		expect(bool.value).toBe(false);
		expect(bool.label).toBe("after");
		expect(bool.created_at).toBe(created);
		expect(bool.updated_at).not.toBe(updated);
	});

	it("can be toggled", async () => {
		let bool = await createBoolean(token, { value: true });

		expect(bool.value).toBe(true);

		await bool.toggle();

		expect(bool.value).toBe(false);
	});

	it("can be destroyed", async () => {
		let bool = await createBoolean(token, { value: true });
		let id = bool.id;

		expect(bool.value).toBe(true);

		await bool.destroy();

		expect(() => bool.value).toThrow();
		await expect(bool.fetch()).rejects.toBeDefined();

		let bool2 = new ReadWriteBool(id, token);
		await expect(bool2.fetch()).rejects.toBeDefined();
	});
});

describe("ReadOnlyBoolean", () => {
	let token: string;
	let boolrw: ReadWriteBool;

	beforeEach(async () => {
		token = await createToken();
		boolrw = await createBoolean(token, { value: true, label: "hello!" });
	});

	it("works", async () => {
		let bool = new ReadOnlyBool(boolrw.id);
		await bool.fetch();
		expect(bool.value).toEqual(boolrw.value);
		expect(bool.label).toEqual(boolrw.label);
		expect(bool.created_at).toEqual(boolrw.created_at);
	});

	it("is lazy", async () => {
		let bool = new ReadOnlyBool(boolrw.id);
		expect(() => bool.value).toThrow();
		await bool.fetch();
		expect(bool.value).toEqual(boolrw.value);
		await boolrw.toggle();
		expect(bool.value).not.toEqual(boolrw.value);
	});

	it("doesn't validate IDs immediately", async () => {
		let bool = new ReadOnlyBool("banana");

		await expect(bool.fetch()).rejects.toBeDefined();
	});

	it("can be given starting data", async () => {
		let bool = new ReadOnlyBool("banana", {
			created_at: "foo",
			updated_at: "bar",
			value: true,
			label: "FILE_NOT_FOUND",
			id: "banana",
		});

		expect(bool.label).toEqual("FILE_NOT_FOUND");
	});

	it("vaguely checks its starting data", async () => {
		expect(
			() =>
				new ReadOnlyBool("banana", {
					created_at: "foo",
					updated_at: "bar",
					value: true,
					label: "FILE_NOT_FOUND",
					id: "fish",
				}),
		).toThrow();
	});
});
