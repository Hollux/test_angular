import { Injectable } from '@angular/core';
import { fromEvent, Observable } from 'rxjs';
import { map, scan } from 'rxjs/operators';

const specialAction = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyQ'];


@Injectable({
    providedIn: 'root'
})
export class BasicsService {
    private specialSequence$: Observable<boolean>;

    constructor() {
        this.specialSequence$ = this.initSpecialSequence();
    }

    private initSpecialSequence(): Observable<boolean> {
        return fromEvent<KeyboardEvent>(document, 'keydown').pipe(
            map(event => event.code),
            scan((sequence, key) => sequence.slice(-9).concat(key), [] as string[]),
            map(sequence => this.checkForSpecialSequence(sequence))
        );
    }

    private checkForSpecialSequence(sequence: string[]): boolean {
        for (let i = 0; i < specialAction.length; i++) {
            if (specialAction[i] !== sequence[i]) {
                return false;
            }
        }
        return true;
    }

    getSpecialSequence(): Observable<boolean> {
        return this.specialSequence$;
    }
}
