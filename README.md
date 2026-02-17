# VeriLex - AI-Powered Legal Document Analysis

![VeriLex Logo](https://img.shields.io/badge/VeriLex-Legal%20AI-d4a574?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-b8860b?style=for-the-badge)

**VeriLex** is a sophisticated AI-powered legal document analysis platform designed for legal professionals. It provides intelligent contract review, risk assessment, and compliance analysis with a premium brown/gold legal aesthetic.

## ✨ Features

### 🔍 **AI Document Analysis**
- Intelligent PDF contract review using Google's Gemini AI
- Automatic clause identification and categorization
- Risk level assessment (High, Medium, Low)
- Key obligations extraction
- Compliance recommendations

### 📊 **Dashboard & Analytics**
- Real-time document analysis overview
- Risk distribution visualization
- Recent documents tracking
- Activity feed with timeline
- Document history management

### 🎨 **Premium UI/UX**
- Elegant brown/gold legal aesthetic
- Light/dark theme toggle
- Parchment texture background
- Smooth animations and transitions
- Intro landing page with branding
- Responsive design

### 🔐 **Security**
- Secure API key management
- Environment variable configuration
- Session-based intro display

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Google Gemini API Key** ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/verilex.git
   cd verilex
   ```

2. **Install root dependencies**
   ```bash
   npm install
   ```

3. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

4. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

5. **Set up environment variables**
   ```bash
   cd ../server
   cp .env.example .env
   ```
   
   Edit `server/.env` and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   PORT=3000
   ```

### Running the Application

1. **Start the server** (from `server/` directory):
   ```bash
   npm start
   ```
   Server will run on `http://localhost:3000`

2. **Start the client** (from `client/` directory, in a new terminal):
   ```bash
   npm run dev
   ```
   Client will run on `http://localhost:5173`

3. **Open your browser** and navigate to:
   ```
   http://localhost:5173
   ```

## 📁 Project Structure

```
verilex/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── utils/         # Utility functions
│   │   └── App.jsx        # Main app component
│   └── package.json
│
├── server/                # Express backend
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── utils/            # Helper functions
│   ├── data/             # Data storage
│   ├── .env.example      # Environment template
│   └── index.js          # Server entry point
│
└── package.json          # Root package.json
```

## 🔧 Configuration

### Environment Variables

Create a `server/.env` file with the following variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Your Google Gemini API key | ✅ Yes |
| `PORT` | Server port (default: 3000) | ❌ No |

### Theme Configuration

The application supports both light and dark themes:
- **Dark Mode**: Deep brown backgrounds with gold accents (default)
- **Light Mode**: Parchment cream backgrounds with brown text
- Toggle using the sun/moon button in the top-right corner
- Preference is saved to `localStorage`

## 🎯 Usage

1. **Upload a Document**
   - Click the "Upload Document" button (gold gradient)
   - Select a PDF contract or legal document
   - Wait for AI analysis to complete

2. **View Analysis**
   - Click on any document in the "Recent Documents" list
   - Review identified clauses, obligations, and risks
   - Check compliance recommendations

3. **Navigate Pages**
   - **Dashboard**: Overview and recent activity
   - **Documents**: Full document list with search
   - **Analytics**: Risk breakdown and metrics
   - **Reports**: Generate analysis reports
   - **Settings**: Configure preferences

4. **Toggle Theme**
   - Click the sun/moon icon in the top-right
   - Switch between dark and light modes

## 🛠️ Technology Stack

### Frontend
- **React** - UI library
- **Vite** - Build tool and dev server
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **Multer** - File upload handling
- **PDF-Parse** - PDF text extraction
- **Google Generative AI** - Gemini AI integration

### Styling
- **Vanilla CSS** - Custom styling
- **Google Fonts** - Playfair Display & Inter

## 📝 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/upload` | Upload and analyze PDF document |
| `GET` | `/api/history` | Get analysis history |

## 🎨 Design Philosophy

VeriLex embodies a **premium legal-tech aesthetic**:

- **Color Palette**: Warm browns and rich golds
- **Typography**: Playfair Display (serif) + Inter (sans-serif)
- **Texture**: Subtle parchment overlay
- **Mood**: Sophisticated, trustworthy, authoritative
- **Inspiration**: Law libraries, executive boardrooms, legal documents

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** for powerful document analysis
- **React** and **Vite** for excellent developer experience
- Legal professionals for inspiration and feedback

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Built with ⚖️ by the VeriLex Team**
