# ⚖️ VeriLex - AI-Powered Legal Document Analyzer

<div align="center">

![VeriLex Logo](https://img.shields.io/badge/VeriLex-Legal%20AI-d4a574?style=for-the-badge&logo=scale-of-justice&logoColor=white)
<br/>

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)](https://expressjs.com/)
[![Gemini AI](https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)
<br/>
[![Deployed on Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://verilex.vercel.app)
[![Deployed on Railway](https://img.shields.io/badge/Backend-Railway-0B0D0E?style=for-the-badge&logo=railway&logoColor=white)](https://railway.app)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

<h3>
  <a href="https://verilex.vercel.app">🌐 Live Demo</a>
  <span> | </span>
  <a href="#-features">✨ Features</a>
  <span> | </span>
  <a href="#-getting-started">🚀 Getting Started</a>
</h3>

*An intelligent platform for legal professionals to analyze contracts, assess risks, and ensure compliance using advanced AI.*

</div>

---

## 📖 Overview

**VeriLex** is a sophisticated legal-tech application that leverages Google's **Gemini AI** to analyze legal documents (PDFs) in real-time. Designed with a premium aesthetic inspired by law libraries and executive boardrooms, it offers instant insights into contracts, identifying varying levels of risk, key obligations, and missing clauses.

The application features a modern, responsive dashboard with a dual-theme interface (Dark/Light) that maintains a professional "Legal Gold" identity across both modes.

## ✨ Features

### 🧠 **AI-Powered Analysis**
*   **Instant Risk Assessment**: Categorizes clauses into High, Medium, and Low risk.
*   **Clause Identification**: Automatically detects and labels standard legal clauses (Indemnification, Termination, Liability, etc.).
*   **Summary Generation**: Creates concise executive summaries of complex documents.
*   **Compliance Check**: Identifies missing standard clauses and potential loopholes.

### 🎨 **Premium User Experience**
*   **Sophisticated UI**: "Legal Gold" and "Deep Espresso" color palette for an authoritative feel.
*   **Interactive Dashboard**: Real-time stats, activity feeds, and risk distribution charts.
*   **Theme Support**: Toggle between a rich **Dark Mode** and a parchment-inspired **Light Mode**.
*   **Responsive Design**: Fully optimized for desktop and tablet viewing.

### 🛠️ **Technical Highlights**
*   **Secure Uploads**: Multer-based memory storage for secure and fast file processing.
*   **Real-time Feedback**: Loading states, skeletal screens, and toast notifications.
*   **History Tracking**: session-based history of analyzed documents.

## 🏗️ Tech Stack

### **Frontend**
*   **Framework**: React (v19) with Vite
*   **Styling**: Customized CSS variables, Flexbox/Grid layouts
*   **State Management**: React Hooks (`useState`, `useEffect`, `useContext`)
*   **Routing**: Custom navigation logic

### **Backend**
*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **AI Integration**: Google Generative AI (Gemini 1.5 Flash)
*   **PDF Processing**: `pdf-parse` / `pdfjs-dist`
*   **Security**: CORS, Helmet-style headers, Input validation

### **Deployment**
*   **Frontend**: Vercel (CD from GitHub)
*   **Backend**: Railway (Continuous Deployment)

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   npm or yarn
*   A Google Cloud Project with Gateway/Gemini API access

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/rizzit17/VeriLex.git
    cd VeriLex
    ```

2.  **Install Frontend Dependencies**
    ```bash
    cd client
    npm install
    ```

3.  **Install Backend Dependencies**
    ```bash
    cd ../server
    npm install
    ```

4.  **Configure Environment Variables**
    Create a `.env` file in the `server` directory:
    ```env
    PORT=3000
    GEMINI_API_KEY=your_google_gemini_api_key
    NODE_ENV=development
    ```

### Running Locally

1.  **Start the Backend Server**
    ```bash
    # In terminal 1 (server directory)
    npm start
    ```

2.  **Start the Frontend Client**
    ```bash
    # In terminal 2 (client directory)
    npm run dev
    ```

3.  Access the app at `http://localhost:5173`

## 📸 Screenshots

| Dashboard (Dark Mode) | Analysis Result |
|:---:|:---:|
| <div style="width: 400px; height: 250px; background: #1a1410; display: flex; align-items: center; justify-content: center; color: #d4a574; border: 1px solid #4a3728;">Add Screenshot Here</div> | <div style="width: 400px; height: 250px; background: #faf7f2; display: flex; align-items: center; justify-content: center; color: #6b5d52; border: 1px solid #c4b59a;">Add Screenshot Here</div> |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ⚖️ by [Rishit](https://github.com/rizzit17)**

</div>
