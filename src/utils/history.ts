import { Schema } from "mongoose";

/**
 * This function converts a mongo schema to a diff format
 * i.e. {a: String, b: Number} -> {a: [String], b: [Number]}
 *
 * Caution: This funciton is generated by copilot
 * Currently, this function only supports String, Number, Boolean and Date types for now,
 * you can add Construction types on your own below
 *
 * @param obj The schema object that you want to convert to a diff object
 * @returns the schema object with the innermost keys converted to a list of the same type
 */
export function schemaToDiff<T extends KeyValueMap>(
  obj: T
): NestedObjectToList<T> {
  return Object.keys(obj).reduce((acc, key) => {
    if (typeof obj[key] === "object") {
      return {
        ...acc,
        [key]: schemaToDiff(obj[key]),
      };
    }
    return {
      ...acc,
      [key]: [obj[key]],
    };
  }, {} as NestedObjectToList<T>);
}

interface KeyValueMap {
  [key: string]: any;
}

type NestedObjectToList<T> = {
  [K in keyof T]: T[K] extends
    | StringConstructor
    | NumberConstructor
    | BooleanConstructor
    | DateConstructor
    ? [T[K]]
    : T[K] extends object
    ? NestedObjectToList<T[K]>
    : T[K];
};

export function createHistorySchema<T extends KeyValueMap>(schemaObj: T, ref: string): Schema {
  return new Schema({
    _id: { type: Schema.Types.ObjectId, required: true },
    collectionName: String,
    collectionId: { type: Schema.Types.ObjectId, ref: ref },
    diff: schemaToDiff(schemaObj),
    version: Number,
    createdAt: Date,
    updatedAt: Date,
    __v: Number,
  });
}