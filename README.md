# 🛡️ SentinelAI

## AI-Powered Cybersecurity Incident Response Platform

SentinelAI is a full-stack cybersecurity incident response platform designed to help security analysts **detect, investigate, analyze, and manage security incidents** from a centralized security operations dashboard.

The platform combines **AI-powered incident investigation**, **IOC extraction**, **threat intelligence analysis**, **risk scoring**, and **incident management** into a single application.

---

## 🚀 Features

### 🔐 Incident Management

* Create security incidents
* View and manage incidents
* Update incident status and severity
* Track affected systems and indicators
* View detailed incident information

### 🤖 AI-Powered Investigation

* Investigate security incidents using Google Gemini
* Generate AI-based incident analysis
* Determine potential threat types
* Generate risk scores
* Provide investigation summaries and recommendations

### 🛡️ Threat Intelligence

* Automatically extract Indicators of Compromise (IOCs)
* Analyze:

  * IP addresses
  * URLs
  * Domains
  * Email addresses
  * File hashes
* Integrate VirusTotal threat intelligence
* Classify indicators as:

  * Malicious
  * Suspicious
  * Clean
  * Unknown

### 📊 Security Dashboard

* Real-time security overview
* AI Risk Score
* Active Threats
* AI Investigated Incidents
* Total Incidents
* Threat activity visualization
* Threat severity distribution
* Recent incidents
* Live threat feed

### 📈 Security Analytics

* Incident statistics
* Severity distribution
* Incident status analysis
* Threat intelligence statistics
* IOC statistics
* AI investigation metrics

### 🔑 Authentication

* User registration
* Secure login
* JWT-based authentication
* Protected application routes

---

## 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │      User / SOC     │
                    │      Analyst        │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   React Frontend    │
                    │                     │
                    │ Dashboard           │
                    │ Incidents           │
                    │ AI Investigation    │
                    │ Threat Intelligence │
                    │ Analytics           │
                    └──────────┬──────────┘
                               │
                         REST API / Axios
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Node.js Backend   │
                    │     Express.js      │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
      ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
      │   MongoDB    │ │ Google Gemini│ │  VirusTotal  │
      │   Database   │ │      AI      │ │ Threat Intel │
      └──────────────┘ └──────────────┘ └──────────────┘
```

---

## 🔄 Incident Investigation Workflow

```text
Security Incident
       │
       ▼
IOC Extraction
       │
       ▼
Threat Intelligence Analysis
       │
       ▼
VirusTotal Investigation
       │
       ▼
IOC Results
       │
       ▼
Gemini AI Investigation
       │
       ▼
Threat Classification
       │
       ▼
Risk Score Generation
       │
       ▼
Incident Dashboard
```

---

## 🧰 Tech Stack

### Frontend

* React
* Vite
* Tailwind CSS
* Framer Motion
* React Router
* Axios
* Recharts
* Lucide React

### Backend

* Node.js
* Express.js
* REST API
* JWT Authentication
* bcryptjs

### Database

* MongoDB
* Mongoose

### Artificial Intelligence

* Google Gemini API

### Threat Intelligence

* VirusTotal API

### Development Tools

* Git
* GitHub
* VS Code
* npm

---

## 📁 Project Structure

```text
SentinelAI/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── services/
│   │
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── context/
│   │   ├── features/
│   │   ├── services/
│   │   ├── shared/
│   │   └── styles/
│   │
│   ├── public/
│   ├── package.json
│   └── .env.example
│
├── .gitignore
├── LICENSE
└── README.md
```

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/sakshikadavkar/SentinelAI.git

cd SentinelAI
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Configure backend environment variables

Create a `.env` file inside `backend/`.

```env
PORT=5000

JWT_SECRET=your_jwt_secret

MONGO_URI=your_mongodb_connection_string

GEMINI_API_KEY=your_gemini_api_key

VIRUSTOTAL_API_KEY=your_virustotal_api_key
```

> ⚠️ Never commit your `.env` file or expose API keys publicly.

### 4. Start the backend

```bash
npm run dev
```

Backend runs on:

```text
http://localhost:5000
```

---

## 💻 Start the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on the Vite development server.

---

## 🧪 Production Build

To create a production build:

```bash
cd frontend
npm run build
```

---

## 🔒 Security

SentinelAI follows basic security practices including:

* JWT authentication
* Password hashing
* Environment-based secrets
* Protected routes
* API key separation
* MongoDB-based data persistence
* `.env` exclusion through `.gitignore`

---

## 📸 Application

### Security Command Center

The dashboard provides a centralized view of the organization's security posture, including AI risk scoring, active threats, incident statistics, threat severity, recent incidents, and live threat activity.

### Incident Management

Security analysts can create, investigate, update, and monitor cybersecurity incidents from the incident management interface.

### AI Investigation

The AI investigation module analyzes incident information and extracted indicators to provide threat assessment, risk scoring, and investigation insights.

### Threat Intelligence

Indicators are analyzed using external threat intelligence services to identify malicious and suspicious infrastructure.

---

## 🎯 Project Goals

SentinelAI was developed to demonstrate how **Artificial Intelligence and automated threat intelligence can assist cybersecurity incident response workflows**.

The project focuses on reducing manual investigation effort by combining incident management, IOC analysis, external threat intelligence, and AI-assisted investigation in one platform.

---

## 🚧 Future Improvements

* Real-time WebSocket threat notifications
* Advanced SIEM log ingestion
* Automated response playbooks
* More threat intelligence providers
* Role-based access control
* Email/SMS security alerts
* Advanced AI incident correlation
* Docker deployment
* Cloud deployment
* Security event timeline visualization

---

## 👩‍💻 Author

**Sakshi Kadavkar**

Computer Science & Engineering

GitHub:
https://github.com/sakshikadavkar

---

## 📄 License

This project is licensed under the MIT License.
