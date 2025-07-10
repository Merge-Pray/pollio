# 🗳️ Quick Poll Web App - Project Workflow (One-Time Voting Links)

**Frontend:** React (Vite) + React Router  
**Backend:** Express + MongoDB (via Mongoose)

---

## ✅ Project Summary

- Users can create a poll with a custom number of options.
- A shareable **one-time-use voting link** is generated for each voter.
- Each voting link is valid only once.
- Poll results are always accessible from a standard results link.
- (Future) Poll creator can end/delete poll after creating an account.

---

## 🔧 Step-by-Step Workflow

### 1. Project Setup

#### Backend

```bash
npm init
npm install express mongoose cors dotenv uuid
```

Structure:

```
backend/
├── models/
├── routes/
├── controllers/
├── middleware/
└── server.js
```

#### Frontend

```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install react-router-dom
```

---

### 2. Database Design (Mongoose)

#### Poll Schema

```js
{
  title: String,
  pollId: String,
  question: String,
  options: [
    { text: String, votes: Number }
  ],
  createdAt: Date,
  expired: Boolean,
  creatorId: String | null
}
```

#### Vote Token Schema

```js
{
  token: String,
  pollId: String,
  used: Boolean,
  createdAt: Date
}
```

---

### 3. Backend API Routes

| Method | Route                             | Description                    |
| ------ | --------------------------------- | ------------------------------ |
| POST   | /api/polls                        | Create a new poll              |
| GET    | /api/polls/:pollId                | Get poll data                  |
| POST   | /api/polls/:pollId/generate-links | Generate one-time voting links |
| POST   | /api/vote/:token                  | Submit a vote using a token    |
| GET    | /api/polls/:pollId/results        | View poll results              |

---

### 4. One-Time Voting Link Logic

- When a poll is created, a set number of unique voting links are generated.
- Each link contains a token and is stored in the DB as unused.
- When a user votes via the link:
  - Token is validated.
  - Vote is counted.
  - Token is marked as used.

---

### 5. Frontend Routing (React Router)

| Route                   | Component      | Description               |
| ----------------------- | -------------- | ------------------------- |
| `/`                     | Home           | Create a poll             |
| `/poll-created/:id`     | CreatedSuccess | View and share vote links |
| `/vote/:token`          | VoteView       | Vote using one-time link  |
| `/poll/:pollId/results` | ResultsView    | View poll results         |

---

### 6. Frontend Flow

#### Create Poll

- Form: question + options
- POST `/api/polls`
- Redirect to `/poll-created/:id`

#### Generate Vote Links

- Call `/api/polls/:id/generate-links` (e.g., 10 links)
- Display or allow download/share of links

#### Vote Page

- Route: `/vote/:token`
- Fetch poll using token
- Submit vote
- Redirect to `/poll/:pollId/results`

#### Results Page

- Show real-time or refreshed results

---

### 7. Backend Logic

#### POST `/polls`

- Generate `pollId`
- Save question and options

#### POST `/polls/:id/generate-links`

- Generate N tokens linked to pollId
- Save each with `used: false`

#### POST `/vote/:token`

- Validate token
- If unused, register vote and mark as used

#### GET `/polls/:id/results`

- Return poll + vote counts

---

### 8. Future Features

#### Poll Management

- Auth (JWT + bcrypt)
- Creator ID stored with poll
- Dashboard to:
  - End poll
  - Delete poll
  - Set expiration

#### Admin Tools

- Track votes
- Analytics dashboard

---
