# 🛡️ SentinelAI

## AI-Powered Cybersecurity Incident Response Platform

SentinelAI is an AI-powered cybersecurity incident response platform designed to help security analysts detect, investigate, analyze, and manage security incidents from a centralized security operations dashboard.

The platform combines **incident management, IOC extraction, threat intelligence, AI-powered investigation, risk assessment, analytics, and automated security insights** into a unified interface.

---

## ✨ Features

- 🔐 Secure user authentication
- 🚨 Security incident management
- 🤖 AI-powered incident investigation
- 🛡️ Threat intelligence analysis
- 🔎 IOC extraction and analysis
- 📊 Real-time security dashboard
- ⚠️ AI-based risk scoring
- 📈 Threat severity and activity analytics
- 🤖 AI Security Copilot
- 📡 Live threat feed
- 📋 Automated incident analysis
- 🗄️ MongoDB-based incident storage
- 🔄 Automatic dashboard statistics refresh

---

## 🏗️ System Architecture

```text
                         ┌─────────────────┐
                         │      User       │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │ React Frontend  │
                         │ Vite + Tailwind │
                         └────────┬────────┘
                                  │
                              REST API
                                  │
                                  ▼
                         ┌─────────────────┐
                         │ Node.js +       │
                         │ Express Backend │
                         └────────┬────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
              ▼                   ▼                   ▼
       ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
       │   MongoDB   │     │   Gemini    │     │ VirusTotal  │
       │  Database   │     │     API     │     │     API     │
       └─────────────┘     └─────────────┘     └─────────────┘
              │                   │                   │
              └───────────────────┼───────────────────┘
                                  ▼
                         ┌─────────────────┐
                         │ Security       │
                         │ Analysis       │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │ Dashboard /     │
                         │ Incident Report │
                         └─────────────────┘