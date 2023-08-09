import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs';
import { deck } from '../../tools/constants';
import { CardDto } from '../../tools/dto/card.dto';

export interface Deck {
    deckInGame: CardDto[];
    deck: CardDto[];
}

const initialState: Deck = {
    deckInGame: [...deck],
    deck: [...deck],
};

@Injectable({
    providedIn: 'root'
})

export class DeckService {
    private _state$!: BehaviorSubject<Deck>;

    get state$(): Observable<Deck> {
        return this._state$.asObservable();
    }

    get state(): Deck {
        return this._state$.getValue();
    }

    constructor() {
        this.initState();
    }

    private initState() {
        this._state$ = new BehaviorSubject<Deck>(initialState);
    }

    /**
     * 
     * 
     * @param nextState 
     */
    setState(nextState: Deck) {
        this._state$.next({
            ...this.state,
            ...nextState
        });
    }

    /**
     * Retirer une carte du deck
     * 
     * @param card 
     */
    removeCardInGame(card: CardDto) {
        const currentState = this.state;
        const currentDeckInGame = currentState.deckInGame;
        const index = currentDeckInGame.findIndex(
            current => current.value === card.value &&
                current.label === card.label &&
                current.symbol === card.symbol
        );

        if (index === -1) {
            throw new Error('La carte spécifiée n\'existe pas dans le deck en cours de jeu.');
        }

        const updatedDeckInGame = [
            ...currentDeckInGame.slice(0, index),
            ...currentDeckInGame.slice(index + 1)];

        const nextState: Deck = {
            ...currentState,
            deckInGame: updatedDeckInGame
        };

        this.setState(nextState);
    }

    init() {
        this.setState(initialState);
    }
}