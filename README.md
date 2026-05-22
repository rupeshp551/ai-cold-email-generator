# AI Cold Mail Generator

An AI-powered full-stack web application that helps users generate personalized cold emails, LinkedIn messages, and follow-up messages for job opportunities in software engineering, AI/ML, data science, and related tech fields.

Built using React, Node.js, Express, MongoDB, Tailwind CSS, and the Groq API.

---

## Features

- AI-generated cold emails and LinkedIn outreach messages
- JWT-based authentication system
- Email OTP verification
- Secure password hashing using bcrypt
- Protected routes and authenticated access
- Email history tracking
- Responsive UI built with Tailwind CSS
- RESTful API integration

---

## Tech Stack

### Frontend
- React
- Tailwind CSS
- React Router
- Context API
- Axios
- React Toastify

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Bcrypt
- Nodemailer

### AI Integration
- Groq API

---

## Folder Structure

```bash
ai-cold-mail/
│
├── client/
│   ├── src/
│   └── ...
│
├── server/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middlewares/
│   ├── config/
│   └── ...
│
└── README.md
```

---

## Environment Variables

Create a `.env` file inside the `server` directory and add the following variables:

```env
PORT=3001
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
```

---

## Installation

### Clone the Repository

```bash
git clone https://github.com/rupeshp551/ai-cold-email-generator.git
cd ai-cold-mail
```

### Setup Backend

```bash
cd server
npm install
npm run dev
```

### Setup Frontend

```bash
cd client
npm install
npm run dev
```
