import { User } from './app/models/index.js';

const pretty = (obj) => JSON.stringify(obj, null, 2);
const cpretty = (obj) => console.log(pretty(obj));

const run = async () => {
    const flashcard = await User.findAll({
        include: [{
            association: 'decks',
            where: {
                share_id: '123456abcdef',
            },
        }],
    });
    cpretty(flashcard);
};

run();
