-- DONNEES SEEDING --

--USER --

INSERT INTO "user" ( "pseudo", "email", "password")

VALUES
( 'hamsterx3', 'user.hamster@cardamom.com', '123456' ),
( 'rat2d2', 'user.rat@cardamom.com', 'abcdef');

--DECK --
------ pour le deck de test, on ne peut pas seed un deck sans lui affecter un user.
------ Donc quelle serait la bonne méthode ?
------ enlever "not null" chez user_id de deck?
------ ou bien ajouter un id "Default" à la création de table deck pour user_id?
------ ou bien attribuer un id à notre seed?
------ attribuer un user_id à notre seed crée des problèmes car 
------ il faut modifier la foreign key de user mais aussi de deck
------ alors que celles-ci sont déterminées comme GENERATED ALWAYS AS IDENTITY PRIMARY KEY
------ on a pas de "droit" de modification de celles-ci
------ on test alors le retrait de la contrainte "not null" de user_id chez deck
INSERT INTO "deck" ( "title", "share_id", "user_id")

VALUES
('[TEST]vocab portugais', '123456abcdef', 1 );

--FLASHCARD --

INSERT INTO "flashcard" ("title_front", "title_back", "deck_id")

VALUES
('mémoire', 'memória', 1),
('jouer', 'jogar', 1),
('épice', 'apimentado', 1),
('carte', 'carta', 1),
('maman', 'mãe', 1),
('moment', 'momento', 1),
('boire', 'tomar', 1),
('merci', 'obrigado', 1),
('vague', 'aceno', 1),
('embrun/mousse', 'espuma', 1),
('coder', 'codificar', 1),
('katsudon', 'katsudon', 1),
('voiture', 'carro', 1),
('pamplemousse', 'toranja', 1),
('frontière', 'fronteira', 1),
('se reposer', 'descansar', 1);

-- DECK HAS USER ou consulte --
INSERT INTO "deck_has_user" ("user_id", "deck_id")

VALUES
(1, 1);

-- stats ou progresse Pas de Seed pour l'instant, nécessite de vrais utilisateurs et fonctionnalité overview--

COMMIT;