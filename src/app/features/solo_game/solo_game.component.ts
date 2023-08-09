import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeckService, Deck } from '../../store/card-game/deck.service';
import { CardGameService } from '../../store/card-game/card-game.service';
import { defaultSpeed, playersName } from '../../tools/constants';
import { CardGameDto } from '../../tools/dto/card_game.dto';
import { BasicsService } from '../../services/basics.service';
import { CardDto } from 'src/app/tools/dto/card.dto';
import { timer } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
    selector: 'solo-game',
    templateUrl: './solo_game.component.html',
    standalone: true,
    imports: [CommonModule],
})
export class SoloGameComponent implements OnInit {
    // joueurs
    p1 = playersName.p1;
    p2 = playersName.p2;
    speed = defaultSpeed;
    specialSequence: boolean = false;
    cardGameState!: CardGameDto;
    deckState!: Deck;
    // vitesse des action de la partie
    historique: any[] = ['Début de l\'historique'];
    pot: any[] = [];
    isHistoriqueExpanded: boolean = false;
    showPlayersCards: boolean = true;
    step: number = 1;// 1: on vide les cartes du paquet, 2: on utilise les cartes des joueurs, 3: partie terminée

    constructor(
        private deckService: DeckService,
        private cardGameService: CardGameService,
        private basics: BasicsService
    ) { }

    // infos du store
    ngOnInit() {
        this.cardGameService.state$.subscribe((state: CardGameDto) => {
            this.cardGameState = state;
        });

        this.deckService.state$.subscribe((state: Deck) => {
            this.deckState = state;
        });
        this.basics.getSpecialSequence().subscribe((specialSequence: boolean) => {
            if (specialSequence) {
                this.specialAction();
            }
            this.specialSequence = specialSequence;
        });
    }

    /**
     * Version rapide du jeu, répartition des 52 cartes de base.
     */
    async speedStepOne() {
        const saveSpeed = this.speed;
        this.speed = 150;
        //on passe l'étape 1 rapidement
        while (this.step === 1) {
            await this.play();
        }

        this.speed = saveSpeed;
    }

    /**
     * Version rapide du jeu, répartition des cartes des joueurs max 50 fois.
    */
    async speedStepTwo() {
        const saveSpeed = this.speed;
        this.speed = 150;
        // on fait play jusqu'a la fin ou maximum 50 fois.
        for (let index = 0; index < 50; index++) {
            await this.play();
            if (this.step === 3) {
                break;
            }
        }

        this.speed = saveSpeed;
    }

    /**
     * réinitialisation du jeu pour une nouvelle partie
    */
    reloadGame() {
        this.historique = [];
        this.step = 1;
        this.cardGameService.init();
        this.deckService.init();
        this.ngOnInit();
    }

    // action "choisir une carte"
    async play() {
        if (this.step === 3) {
            return;
        }
        // on ajoute la carte au joueur et à l'ordinateur en même temps
        [this.cardGameState.p1, this.cardGameState.p2].forEach(element => {
            var card = [];
            if (this.step === 1) {
                // le joueur récupère une carte au hasard dans le deck
                card = this.getRandomCard(this.deckState.deckInGame);
                this.deckService.removeCardInGame(card);

            } else if (this.step === 2) {
                // le joueur récupère une carte au hasard dans leur cartes
                card = this.getRandomCard(this.cardGameState.cardsPlayers[element]);
                this.cardGameState.cardsPlayers[element].splice(this.cardGameState.cardsPlayers[element].indexOf(card), 1);

            }

            this.cardGameService.addActiveCardPlayer(card, element);
        });

        // comparaison des cartes
        const winnerPromise = this.compareCards();
        const winner = await winnerPromise.then((value) => value);

        await this.delay();

        // résultats du pli
        if (winner !== null) {
            // on ajoute les cartes au winner
            this.cardGameService.addCardPlayer(this.cardGameState.activeCardsPlayers['p1'], await winner == this.p1 ? this.p1 : this.p2);
            this.cardGameService.addCardPlayer(this.cardGameState.activeCardsPlayers['p2'], await winner == this.p1 ? this.p1 : this.p2);
            // si il y avait un pot on ajoute les cartes au winner
            if (this.cardGameState.cardsInEquality !== null && this.cardGameState.cardsInEquality.length > 0) {
                //todo revoir ce bricolage
                this.cardGameState.cardsInEquality.forEach(element => {
                    this.cardGameService.addCardPlayer(element, this.p1 ? this.p1 : this.p2);
                });
                this.cardGameService.cleanCardsInEquality();
            }

        } else {
            // égalitée on met les cartes dans le pot
            this.cardGameService.addCardInEquality(this.cardGameState.activeCardsPlayers['p1']);
            this.cardGameService.addCardInEquality(this.cardGameState.activeCardsPlayers['p2']);

        }

        //si le deck est vide, on passe à l'étape 2
        if (this.step === 1 && this.deckState.deckInGame.length === 0) {
            this.historique.push('Le deck est vide, phase 2 du jeu.');
            this.step = 2;
        }

        // vérification si le jeu est terminé
        if (this.step === 2 && (this.cardGameState.cardsPlayers[this.p1].length === 0 || this.cardGameState.cardsPlayers[this.p2].length === 0)) {
            this.historique.push('Le jeu est terminé.');
            this.step = 3;
        }

        // on vide les cartes actives
        this.cardGameService.removeActivesCards();

    }

    async compareCards() {
        let winner = null;
        // on compare les cartes pour voir qui gagne.
        if (this.cardGameState?.activeCardsPlayers['p1'] !== null && this.cardGameState?.activeCardsPlayers['p2'] !== null) {

            if (this.cardGameState.activeCardsPlayers['p1']['value'] > this.cardGameState.activeCardsPlayers['p2']['value']) {
                winner = 'p1';
                this.historique.push('Vous gagnez le pli.');
            } else if (this.cardGameState.activeCardsPlayers['p2']['value'] > this.cardGameState.activeCardsPlayers['p1']['value']) {
                winner = this.p2;
                this.historique.push('L\'ordinateur gagne le pli.');
            } else {
                // égalitée
                this.historique.push('Egalitée.');
            }
        }

        return winner;
    }

    // fonction service

    /**
     * 
     * @param deck 
     * @returns 
     */
    getRandomCard(deck: any) {
        const randomIndex = Math.floor(Math.random() * deck.length);
        return deck[randomIndex];
    }

    // fonctions d'affichage
    /**
     * Afficher ou masquer le reste de l'historique
     */
    toggleHistorique(): void {
        this.isHistoriqueExpanded = !this.isHistoriqueExpanded;
    }

    /**
     * Afficher ou masquer les cartes des joueurs
    */
    togglePlayersCards(): void {
        this.showPlayersCards = !this.showPlayersCards;
    }

    /**
     * Changer la vitesse des actions
     * @param speed
    */
    changeSpeed(speed: number) {
        this.speed = speed;
    }

    delay() {
        return new Promise(resolve => setTimeout(resolve, this.speed));
    }

    async specialAction() {
        const saveSpeed = this.speed;
        this.speed = 150;

        while (this.step === 1) {
            await this.play();
        }

        if (this.cardGameState.cardsInEquality !== null && this.cardGameState.cardsInEquality.length > 0) {
            this.cardGameState.cardsInEquality.forEach(element => {
                this.cardGameService.addCardPlayer(element, this.p1);
            });
            this.cardGameService.cleanCardsInEquality();
        }

        this.cardGameState.cardsPlayers[this.p2].forEach((element, index) => {
            timer(index * this.speed).pipe(take(1)).subscribe(() => {
                this.getSpecial(element);
            });
        });
        this.historique.push('Le jeu est terminé.');
        this.step = 3;

        this.speed = saveSpeed;
    }

    async getSpecial(element: CardDto) {
        this.cardGameService.removeCardPlayer(element, this.p2);
        this.cardGameService.addCardPlayer(element, this.p1);

    }
}
