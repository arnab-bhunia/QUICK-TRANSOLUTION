# Quick Transolution

A modern, responsive logistics website built with the **MERN stack** (MongoDB, Express.js, React, and Node.js). The project is designed with a configuration-driven architecture, allowing branding, company information, and theme colors to be updated without modifying application components.

---

## ✨ Features

* Modern, responsive user interface
* Configuration-based branding and theme system
* Interactive service and "Why Choose Us" sections
* Testimonial carousel
* Shipment tracking
* Contact and quotation forms
* Newsletter subscription
* Google reCAPTCHA support for form protection
* REST API powered by Express.js
* MongoDB integration with Mongoose
* Production-ready project structure

---

## 📁 Project Structure

```text
quick-transolution/
├── client/          # React + Vite frontend
├── server/          # Express + MongoDB backend
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

* Node.js (v18 or later recommended)
* MongoDB (Local or MongoDB Atlas)
* npm

---

## Frontend Setup

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

Production build:

```bash
npm run build
```

---

## Backend Setup

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

Production:

```bash
npm start
```

---

## 🔐 Environment Variables

Create a `.env` file inside the **server** directory.

Example:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
RECAPTCHA_SECRET_KEY=your_recaptcha_secret
```

Create a `.env` file inside the **client** directory if required by your frontend configuration.

**Important**

* Never commit `.env` files.
* Never expose database credentials or API keys.
* Keep all secrets in environment variables.

---

## 🎨 Branding & Theme Customization

The project separates branding from application logic.

### Company Configuration

```
client/src/config/site.js
```

Update:

* Company name
* Contact details
* Navigation
* Hero content
* Services
* Testimonials
* Footer information

### Theme Configuration

```
client/src/config/theme.js
```

Customize:

* Brand colors
* Typography
* Border radius
* Shadows
* Design tokens

This allows complete rebranding without editing React components.

---

## 📡 API Endpoints

| Method | Endpoint            | Description              |
| ------ | ------------------- | ------------------------ |
| GET    | `/api/health`       | Health check             |
| POST   | `/api/quotes`       | Submit quotation request |
| GET    | `/api/quotes`       | Retrieve quote requests  |
| POST   | `/api/newsletter`   | Subscribe to newsletter  |
| POST   | `/api/track/lookup` | Shipment tracking        |

---

## 🛠️ Tech Stack

### Frontend

* React
* Vite
* React Router
* Plain CSS

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose

---

## 📦 Deployment

The application can be deployed using platforms such as:

* Vercel (Frontend)
* Render (Backend)
* MongoDB Atlas (Database)

Environment variables should be configured through your hosting provider rather than committed to the repository.

---

## 🔒 Security

This repository is intended to be public.

To keep it secure:

* `.env` files are excluded from version control.
* Database credentials are never stored in the repository.
* API secrets should always be configured through deployment environment variables.
* Keep dependencies updated and periodically run:

```bash
npm audit
```

---

## 📄 License

This project is intended for educational and commercial use according to the applicable license terms.

---

## 👨‍💻 Author

Developed by **Arnab Bhunia**.
