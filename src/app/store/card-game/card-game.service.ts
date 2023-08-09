import { Injectable } from '@angular/core';
import { CardDto } from '../../tools/dto/card.dto';
import { CardGameDto } from '../../tools/dto/card_game.dto';
import { playersName } from '../../tools/constants';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs';

const initialState: CardGameDto = {
    // les joueurs
    p1: playersName.p1,
    p2: playersName.p2,
    // toutes les cartes gagné par les joueurs
    cardsPlayers: { 'p1': [], 'p2': [] },
    // la carte active des joueurs
    activeCardsPlayers: { 'p1': null, 'p2': null },
    // cartes mise en jeu dans une égalitée
    cardsInEquality: null,
};

@Injectable({
    providedIn: 'root'
})
export class CardGameService {
    private _state$!: BehaviorSubject<CardGameDto>;

    // Exposed observables
    get state$(): Observable<CardGameDto> {
        return this._state$.asObservable();
    }

    // State operations
    get state(): CardGameDto {
        return this._state$.getValue();
    }

    constructor() {
        this.initState();
    }

    private initState() {
        this._state$ = new BehaviorSubject<CardGameDto>(initialState);
    }

    // Setter
    setState(nextState: CardGameDto) {
        this._state$.next({
            ...this.state,
            ...nextState,
        });
    }

    /**
     * Ajouter une carte à un joueur
     * 
     * @param card 
     * @param player 
     */
    addCardPlayer(card: CardDto | null, player: string) {
        if (card === null) {
            return;
        }
        const currentState = this.state;
        const currentCardsPlayers = currentState.cardsPlayers;
        const playerCards = currentCardsPlayers[player];

        const updatedCardsPlayers = {
            ...currentCardsPlayers,
            [player]: [...playerCards, card]
        };

        const nextState = {
            ...currentState,
            cardsPlayers: updatedCardsPlayers
        };

        this.setState(nextState);
    }

    /**
     * Retirer une carte à un joueur
     * 
     * @param card 
     * @param player 
     */
    removeCardPlayer(card: CardDto, player: string) {
        const currentState = this.state;
        const currentCardsPlayers = currentState.cardsPlayers;
        const playerCards = currentCardsPlayers[player];

        const updatedCardsPlayers = {
            ...currentCardsPlayers,
            [player]: playerCards.filter((c: CardDto) => c !== card)
        };

        const nextState = {
            ...currentState,
            cardsPlayers: updatedCardsPlayers
        };

        this.setState(nextState);
    }

    /**
     * Ajouter une carte active à un joueur
     * 
     * @param card 
     * @param player 
     */
    addActiveCardPlayer(card: CardDto, player: string) {
        const currentState = this.state;
        const currentActiveCardsPlayers = currentState.activeCardsPlayers;
        const playerActiveCard = currentActiveCardsPlayers[player];

        if (playerActiveCard && playerActiveCard.value && playerActiveCard.symbol) {
            throw new Error(`Le joueur ${player} a déjà une carte active.`);
        }

        const updatedActiveCardsPlayers = {
            ...currentActiveCardsPlayers,
            [player]: card
        };

        const nextState = {
            ...currentState,
            activeCardsPlayers: updatedActiveCardsPlayers
        };

        this.setState(nextState);
    }

    /**
     * Retirer une carte active à un joueur
     * 
     * @param player 
     */
    removeActiveCardPlayer(player: string) {
        const currentState = this.state;
        const currentActiveCardsPlayers = currentState.activeCardsPlayers;
        const playerActiveCard = currentActiveCardsPlayers[player];

        if (!playerActiveCard) {
            throw new Error(`Le joueur ${player} n'a pas de carte active à retirer.`);
        }

        const updatedActiveCardsPlayers = {
            ...currentActiveCardsPlayers,
            [player]: null
        };

        const nextState = {
            ...currentState,
            activeCardsPlayers: updatedActiveCardsPlayers
        };

        this.setState(nextState);
    }

    /**
     * Retirer toutes les cartes actives des joueurs
     */
    removeActivesCards() {
        this.removeActiveCardPlayer(this.state.p1);
        this.removeActiveCardPlayer(this.state.p2);
    }

    /**
     * Ajoute une carte en égalitée
     * 
     * @param card 
     */
    addCardInEquality(card: CardDto | null) {
        if (card === null) {
            return;
        }

        const currentState = this.state;
        const currentCardsInEquality = currentState.cardsInEquality;

        const updatedCardsInEquality = currentCardsInEquality ? [...currentCardsInEquality, card] : [card];

        const nextState = {
            ...currentState,
            cardsInEquality: updatedCardsInEquality
        };

        this.setState(nextState);
    }

    /**
     * Retire toutes les cartes en égalitée
     */
    cleanCardsInEquality() {
        const currentState = this.state;
        const nextState = {
            ...currentState,
            cardsInEquality: null
        };

        this.setState(nextState);
    }

    init() {
        this.initState();
    }
}
