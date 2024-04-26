-- SQLBook: Code
DROP TABLE IF EXISTS "stats", "deck_has_user", "flashcard", "deck", "user";


CREATE TABLE "user" (
    "id" INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, "pseudo" VARCHAR(64) NOT NULL UNIQUE, "email" VARCHAR NOT NULL UNIQUE, "password" VARCHAR NOT NULL, "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMPTZ
);

CREATE TABLE "deck" (
    "id" INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "title" VARCHAR(128) NOT NULL,
    "user_id" INTEGER NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "share_id" VARCHAR(64) NOT NULL,  
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ
);

CREATE TABLE "flashcard" (
    "id" INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "title_front" VARCHAR NOT NULL,
    "title_back" VARCHAR NOT NULL,
    "deck_id" INTEGER NOT NULL REFERENCES "deck"("id") ON DELETE CASCADE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ
);

CREATE TABLE "deck_has_user" (
    "id" INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "user_id" INTEGER NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE,
    "deck_id" INTEGER NOT NULL REFERENCES "deck" ("id") ON DELETE CASCADE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ
);

CREATE TABLE "stats" (
    "id" INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "date" DATE,
    "nb_card_consulted" INTEGER DEFAULT 0,
    "nb_card_success" INTEGER DEFAULT 0,
    "user_id" INTEGER NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE,
    "deck_id" INTEGER NOT NULL REFERENCES "deck" ("id") ON DELETE CASCADE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ
);

COMMIT;