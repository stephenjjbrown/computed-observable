import { BehaviorSubject, Observable } from "rxjs";
import { distinctUntilChanged, skip } from "rxjs/operators";
import { trackableManager } from "./trackable-manager";
import { Trackable } from "./trackable";

export class TrackedComputedSubject<T> {
    private getter: () => T;

    private subject: BehaviorSubject<T>;

    private evaluateValue() {
        trackableManager.trackableAccessed(this);
        trackableManager.startListening(this);
        const val = this.getter();
        const dependencies = trackableManager.stopListening();
        this.updateSubscriptions(dependencies);
        return val;
    }

    get value() {
        trackableManager.trackableAccessed(this);
        return this.subject.value;
    }

    private _dependencies: Trackable<any>[] = [];

    private updateSubscriptions(dependencies: Trackable<any>[]) {
        for (const subscribable of dependencies) {
            if (subscribable !== this && this._dependencies.indexOf(subscribable) === -1) {

                subscribable.subscribe(() => {
                    this.subject.next(this.evaluateValue());
                })
 
                this._dependencies.push(subscribable);
            }
        }
    }

    observable: Observable<T>;

    constructor(getter: () => T) {
        
        this.getter = getter;
        this.subject = new BehaviorSubject(this.evaluateValue());
        this.observable = this.subject
            .pipe(distinctUntilChanged())
            .pipe(skip(1));
    }
    

    subscribe(observer: (value: T) => void) {
        return this.observable
            .subscribe(observer);
    }
}