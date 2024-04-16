// associations des tables

import User from './User.js';
import Deck from './Deck.js';
import Flashcard from './Flashcard.js';
import Stats from './Stats.js';
import sequelize from '../db/client.js';

User.hasMany(Deck, {
    foreignKey: 'user_id',
    as: 'decks', // car User.findAll({ include: 'decks'})
});

Deck.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user',
});

Deck.hasMany(Flashcard, {
    foreignKey: 'deck_id',
    as: 'flashcards',
});

Flashcard.belongsTo(Deck, {
    foreignKey: 'deck_id',
    as: 'deck',
});

Deck.belongsToMany(User, {
    through: 'deck_has_user',
    foreignKey: 'deck_id',
    otherKey: 'user_id',
    as: 'users',
});

User.belongsToMany(Deck, {
    through: 'deck_has_user',
    foreignKey: 'user_id',
    otherKey: 'deck_id',
    as: 'importedDecks',
});

Stats.belongsTo(Deck, {
    foreignKey: 'deck_id',
    as: 'stats_deck',
});

Deck.hasMany(Stats, {
    foreignKey: 'deck_id',
    as: 'stats_deck',
});

Stats.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'stats_user',
});

User.hasMany(Stats, {
    foreignKey: 'user_id',
    as: 'stats_user',
});

export {
    User,
    Deck,
    Flashcard,
    Stats,
    sequelize,
};
