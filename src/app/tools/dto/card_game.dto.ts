import { CardDto } from './card.dto';
export interface CardGameDto {
    // les joueurs
    p1: string;
    p2: string;
    // toutes les cartes gagné par les joueurs
    cardsPlayers: { [key: string]: CardDto[] } //cimetiere
    // la carte active des joueurs 
    activeCardsPlayers: { [key: string]: CardDto | null };// carte en jeu
    // cartes mise en jeu dans une égalitée
    cardsInEquality: CardDto[] | null;
}