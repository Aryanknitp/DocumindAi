# Documind Ai Backend

A professional backend for the Documind Ai application built with:

- Node.js + Express.js
- MongoDB + Mongoose
- Python AI microservice for document intelligence
- JWT auth, file upload, chat, summaries, and document management flows

## Features

- User auth and profile onboarding
- File upload and document indexing
- Document text extraction
- AI summary generation requests
- Chat with Document context
- Flashcards, notes, collections, favorites, and activity tracking
- Secure API with rate limiting and CORS
- MongoDB persistence

## Quick start

1. Install dependencies:
   npm install
2. Copy env file:
   cp .env.example .env
3. Start MongoDB locally or update MONGODB_URI
4. Start the Express API:
   npm run dev
5. Start Python AI service:
   cd ai-service
   python -m venv venv
   pip install -r requirements.txt
   python app.py

## API base URL

http://localhost:5000/api

## Main routes

- /auth
- /users
- /documents
- /chat
- /ai
- /dashboard
- /health

## Notes

This backend is designed to connect with the frontend screens already present in the app and expose stable APIs for all main flows.
