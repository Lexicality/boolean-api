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
import "isomorphic-fetch";
import { URL } from "url";
import type { IBoolean, IBooleanInit, ITokenResult } from "./types";

const API_URL = "https://api.booleans.io/";

async function apifetch<RT = unknown>(
	path: string,
	init: RequestInit = {},
	token?: string,
): Promise<RT> {
	let url = new URL(API_URL);
	url.pathname = path;
	let headers = new Headers(init.headers);
	if (token) {
		headers.set("Authorization", `Token ${token}`);
	}
	if (!headers.has("Content-Type") && init.body) {
		headers.set("Content-Type", "application/json");
	}
	init.headers = headers;
	let res = await fetch(url.toString(), init);
	if (!res.ok) {
		console.error(await res.text());
		throw new Error(`Unexpected HTTP ${res.status}: ${res.statusText}`);
	} else if (res.status == 204) {
		return undefined;
	}
	return (await res.json()) as RT;
}

export async function createToken(): Promise<string> {
	let res = await apifetch<ITokenResult>("tokens", { method: "POST" });
	return res.token;
}

export class ReadOnlyBool {
	private _id: string;
	protected data: null | IBoolean;

	constructor(id: string, data?: IBoolean) {
		this._id = id;
		if (data) {
			if (data.id != id) {
				throw new Error("Invalid initial data!");
			}
			this.data = data;
		}
	}

	get id(): string {
		return this._id;
	}

	protected _getField<K extends keyof IBoolean>(key: K): IBoolean[K] {
		if (this.data == null) {
			throw new Error("Must call fetch() first!");
		}
		return this.data[key];
	}

	get value() {
		return this._getField("value");
	}

	get label() {
		return this._getField("label");
	}

	get created_at() {
		return this._getField("created_at");
	}
	get updated_at() {
		return this._getField("updated_at");
	}

	async fetch(): Promise<void> {
		this.data = await apifetch<IBoolean>(this.id);
	}
}

export class ReadWriteBool extends ReadOnlyBool {
	private token: string;
	constructor(id: string, token: string, data?: IBoolean) {
		super(id, data);

		this.token = token;
	}

	async update(data: IBooleanInit): Promise<void> {
		this.data = await apifetch<IBoolean>(
			this.id,
			{
				method: "PATCH",
				body: JSON.stringify(data),
			},
			this.token,
		);
	}

	async destroy(): Promise<void> {
		await apifetch<void>(this.id, { method: "DELETE" }, this.token);
		this.data = null;
	}

	async toggle(): Promise<void> {
		await this.update({ value: !this.value });
	}
}

export async function createBoolean(
	token: string,
	initialData?: IBooleanInit,
): Promise<ReadWriteBool> {
	let res = await apifetch<IBoolean>(
		"/",
		{
			method: "POST",
			body: JSON.stringify(initialData ?? {}),
		},
		token,
	);
	return new ReadWriteBool(res.id, token, res);
}

export default createBoolean;
