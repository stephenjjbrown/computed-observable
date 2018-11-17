import { TrackedSubject } from "./tracked-subject";
import { TrackedComputedSubject } from "./tracked-computed-subject";
import { TrackedArray } from "./tracked-array";

export type Trackable<T> = TrackedSubject<T> | TrackedComputedSubject<T>;

export type TrackedTypeForValue<T> = T extends (infer K)[] ? TrackedArray<K> : TrackedSubject<T>