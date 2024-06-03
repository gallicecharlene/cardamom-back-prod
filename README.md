# Cardamom Backend

This is the backend part of the Cardamom application, responsible for handling data management, authentication. The backend is built using Node.js, Express, and Sequelize for ORM.

## Installation

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [PostgreSQL](https://www.postgresql.org/)

### Steps

1. Clone the repository:

    ```bash
    git clone git@github.com:gallicecharlene/cardamom-back-prod.git
    cd cardamom-back-prod/
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Set up environment variables:

    Create a `.env` file in the `cardamom-backend` directory and configure the required environment variables as per the `.env.example` provided.

4. Set up the database:

    Create a new PostgreSQL database and update the `.env` file with your database credentials.

    create the database :

    ```bash
    psql -U cardamom -d cardamom -f data/create_tables.sql
    ```

5. Run the backend server:

    ```bash
    npm start
    ```

    The backend server will be running on `http://localhost:3003`.

## Features

- **User Authentication:** Secure login and registration with JWT-based authentication.
- **Deck Management:** APIs for creating, editing, deleting, and retrieving decks and flashcards.

## Technologies

- **Node.js:** JavaScript runtime for building the server-side application.
- **Express:** Web framework for Node.js.
- **Sequelize:** ORM for managing PostgreSQL databases.
- **JWT:** For authentication and authorization.

## API Endpoints

### Authentication

- **POST /auth/login:** User login.
- **POST /auth/signup:** User registration.

### Decks

- **GET /decks:** Retrieve all decks.
- **POST /decks:** Create a new deck.
- **PUT /decks/:id:** Update a deck.
- **DELETE /decks/:id:** Delete a deck.

## Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature-branch`).
6. Open a pull request.
