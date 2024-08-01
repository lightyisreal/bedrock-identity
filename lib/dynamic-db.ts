import { Entity, ItemStack, World } from '@minecraft/server';
import * as encoding from 'text-encoding';

/**
 * @author Lighty & ExplosionHm
 * @description A class that allows you to store data in a database fashion using Bedrock's dynamic properties.
 */
export class DynamicDB {
    private _id: string;
    private _provider: World | Entity | ItemStack;
    private _data: {
        [key: string]: any;
    } | undefined;

    /**
     * @description Creates a new database or loads an existing one.
     * @param {string} id An identifier for the database
     * @param {World | Entity | ItemStack} provider The provider for the database. Can be a world or an entity.
     */
    constructor(id: string, provider: World | Entity | ItemStack) {
        this._id = id;
        this._provider = provider;
        const length = this._provider.getDynamicProperty(`dynamicdb:${id}_length`) as number;
        if (length === undefined) {
            this._data = {};
        } else {
            let mergedString = "";
            for (let i = 0; i < length; i++) {
                mergedString += this._provider.getDynamicProperty(
                    `dynamicdb:${id}_${i}`,
                );
            }
            this._data = JSON.parse(mergedString);
        }
    }

    /**
     * @description Deletes a database.
     * @param {string} id
     * @returns {boolean}
     */
    static delete(id: string, provider: World | Entity | ItemStack): boolean {
        const length = provider.getDynamicProperty(
            `dynamicdb:${id}_length`,
        ) as number;
        if (length === undefined) {
            return false;
        }
        for (let i = 0; i < length; i++) {
            provider.setDynamicProperty(`dynamicdb:${id}_${i}`, undefined);
        }
        provider.setDynamicProperty(`dynamicdb:${id}_length`, undefined);
        return true;
    }

    /**
     * @description Clears the database.
     */
    clear() {
        this._data = undefined;
        const length = this._provider.getDynamicProperty(
            `dynamicdb:${this._id}_length`,
        ) as number;
        for (let i = 0; i < length; i++) {
            this._provider.setDynamicProperty(
                `dynamicdb:${this._id}_${i}`,
                undefined,
            );
        }
        this._provider.setDynamicProperty(
            `dynamicdb:${this._id}_length`,
            undefined,
        );
    }

    /**
     *
     * @param {string} id
     * @returns {boolean}
     */
    static exists(id: string, provider: World | Entity | ItemStack): boolean {
        const length = provider.getDynamicProperty(
            `dynamicdb:${id}_length`,
        ) as number;
        if (length === undefined) {
            return false;
        }
        return true;
    }

    /**
     * @description Saves the database in the form of dynamic properties.
     * @returns {Promise<number>}
     */
    save(): Promise<number> {
        const time = Date.now();
        const oldLength = this._provider.getDynamicProperty(
            `dynamicdb:${this._id}_length`,
        ) as number;
        for (let i = 0; i < oldLength; i++) {
            this._provider.setDynamicProperty(
                `dynamicdb:${this._id}_${i}`,
                undefined,
            );
        }
        let data = this._data;
        if (data === undefined) data = {};
        const dataString = JSON.stringify(data);
        const splitString = [];
        for (const ch of this.chunk(dataString, 32767)) {
            splitString.push(ch);
        }
        for (let i = 0; i < splitString.length; i++) {
            this._provider.setDynamicProperty(`dynamicdb:${this._id}_${i}`, splitString[i]);
        }
        this._provider.setDynamicProperty(
            `dynamicdb:${this._id}_length`,
            splitString.length,
        );
        return Promise.resolve(Date.now() - time);
    }

    private *chunk(s: string, maxBytes: number) {
        const decoder = new encoding.TextDecoder("utf-8");
        let buf = new encoding.TextEncoder().encode(s);
        while (buf.length) {
            let i = maxBytes;
            while (i && (i < buf.length && (buf[i] & 0xC0) === 0x80)) i--;
            const chunk = buf.subarray(0, i);
            buf = buf.subarray(i);
            yield decoder.decode(chunk);
        }
    }

    /**
     * @description Gets all the keys in the database.
     * @returns {string[]}
     * @readonly
     */
    keys(): string[] {
        if (this._data === undefined) this._data = {};
        return Object.keys(this._data);
    }

    /**
     * @description Gets all the values in the database.
     * @returns {[string, any][]}
     * @readonly
     */
    entries(): [string, any][] {
        if (this._data === undefined) this._data = {};
        return Object.entries(this._data);
    }

    /**
     * @description Runs a function for each key in the database.
     * @param {function (value, index, array)} callbackfn The function to run for each key
     * @returns
     */
    forEach(callbackfn: (value: [string, any], index: number, array: [string, any][]) => any) {
        if (this._data === undefined) this._data = {};
        return Object.entries(this._data).forEach(callbackfn);
    }

    /**
     * @description Gets a value from the database.
     * @param {string} key The key to get
     * @returns {any}
     */
    get(key: string): any {
        if (this._data === undefined) this._data = {};
        return this._data[key];
    }

    /**
     * @description Checks if the database has a key.
     * @param {string} key The key to check
     * @returns {boolean} Whether the database has the key or not
     */
    has(key: string): boolean {
        if (this._data === undefined) this._data = {};
        return this._data[key] !== undefined;
    }

    /**
     * @description Gets the size of the database.
     * @returns {number} The size of the database
     */
    size(): number {
        if (this._data === undefined) this._data = {};
        return Object.keys(this._data).length;
    }

    /**
     * @description Gets the value of each key in the database.
     * @returns {any[]}
     */
    values(): any[] {
        if (this._data === undefined) this._data = {};
        return Object.values(this._data);
    }

    /**
     * @description Sets a value in the database. Don't forget to save!
     * @param {string} key The key to set
     * @param {any} value The value to set
     * @returns {void}
     */
    set(key: string, value: any): void {
        if (this._data === undefined) this._data = {};
        this._data[key] = value;
    }

    /**
     * @description Deletes a key from the database.
     * @param {string} key The key to delete
     * @returns {void}
     */
    delete(key: string): void {
        if (this._data === undefined) this._data = {};
        this._data[key] = undefined;
    }

    /**
     * @description Returns the database as a JSON string.
     * @returns {string}
     */
    toString(): string {
        let data = this._data;
        if (data === undefined) data = {};
        return JSON.stringify(data);
    }
}