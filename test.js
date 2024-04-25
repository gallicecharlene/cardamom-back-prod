import { Deck } from './app/models/index.js';

const pretty = (obj) => JSON.stringify(obj, null, 2);
const cpretty = (obj) => console.log(pretty(obj));

const run = async () => {
    const flashcard = await Deck.findByPk(1);
    /*    include: [{
            association: 'decks',
            where: {
                id: 1,
            },
        }], */

    cpretty(flashcard);
};

run();
