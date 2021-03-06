import { createTracked } from "../factories";
import { TrackedTypeForValue } from "../trackable";
import { Subscription, merge } from "rxjs";
import { getTrackedPropertyDefinitionList } from "./tracked-property-definition";
import { getComputedProperty } from "./computed-property";

interface TrackedProperty<T> {
    subject: TrackedTypeForValue<T>;
}

type TrackedPropertyList<T> = {
    [K in keyof T]: TrackedProperty<T[K]>;
}

const TrackedPropertyListKey = "_trackedProperties";

const getTrackedPropertyList = <T>(obj: T) => ((obj as any)[TrackedPropertyListKey] = (obj as any)[TrackedPropertyListKey] || {}) as TrackedPropertyList<T>;

export const getTrackedProperty = <T, K extends keyof T>(obj: T, name: K, notFound?: (list: TrackedPropertyList<T>, name: K) => TrackedTypeForValue<T[K]>) => {
    const list = getTrackedPropertyList(obj);
    const existing = list[name];

    if (!existing) {
        if (notFound)
            return notFound(list, name)
        else
            throw new Error("Property accessed before initialized or property doesn't exist: " +  name);
    }

    return existing.subject;
}










export const getAllTrackedProperties = <T>(obj: T) => {
    const list = getTrackedPropertyDefinitionList(obj)

    return Object.keys(list)
        .map(key => ({
            key, 
            definition: list[key as keyof T]
        }))
        .map(({key, definition}) => {
            return definition.computed ?
                getComputedProperty(obj, key as keyof T) :
                getTrackedProperty(obj, key as keyof T)
        })
}

export const getAllObservables = <T>(obj: T) => {
    return getAllTrackedProperties(obj)
        .map(tracked => tracked.observable);
}

export const subscribeAll = <T>(obj: T, observer: (values: any) => void): Subscription => {
    return merge(...getAllObservables(obj))
        .subscribe(observer);
}