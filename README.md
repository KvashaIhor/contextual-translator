# contextual-translator

A modern web application designed for language learners of any language pair. This tool provides intelligent, phrase-by-phrase translations that preserve context and structure, making it easier to understand source text while learning target language equivalents.

## ✨ Features

- **🌐 Any Language Pair**: Choose from 20+ popular languages as source and target
- **📝 Inline Translation**: Translates text with target language equivalents in parentheses after each phrase
- **↔️ Language Swap**: Instantly swap source and target languages with one click
- **📊 Real-time Progress**: Live progress tracking with ETA during translation
- **📁 File Processing**: Upload `.txt` files and download translated results
- **🔄 Streaming Translation**: Real-time translation updates as text is processed
- **🎯 Context Preservation**: Maintains original formatting, punctuation, and sentence structure
- **🧠 AI-Powered**: Uses GPT-4o-mini for intelligent, contextual translations
- **📱 Responsive Design**: Modern UI built with Next.js and Tailwind CSS

## 🌍 Supported Languages

- English, Spanish, French, German, Italian, Portuguese
- Russian, Ukrainian, Polish, Dutch, Swedish, Norwegian, Danish, Finnish
- Japanese, Korean, Chinese, Arabic, Hindi, Turkish
- And many more...

## 🎯 Perfect For

- Language students learning any language pair
- Multilingual speakers studying new languages
- Language teachers creating learning materials
- Anyone needing phrase-by-phrase translation with context
- Travelers preparing for international trips

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- Python 3.8+
- OpenAI API key

### Installation

#### Quick Setup (Recommended)
```bash
git clone <repository-url>
cd universal-language-learner
./setup.sh
```

#### Manual Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd universal-language-learner
   ```

2. **Install frontend dependencies**
   ```bash
   pnpm install
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Environment Variables**
   
   Copy the environment template and add your API key:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your OpenAI API key:
   ```env
   OPENAI_API_KEY=your-openai-api-key-here
   ```

### Running the Application

1. **Start the Flask backend** (in one terminal):
   ```bash
   cd scripts
   python flask_api.py
   ```
   The API will run on `http://localhost:5000`

2. **Start the Next.js frontend** (in another terminal):
   ```bash
   pnpm dev
   ```
   The web app will be available at `http://localhost:3000`

## 📖 How It Works

### Translation Process

1. **Upload**: Select a German `.txt` file
2. **Processing**: The system processes text line by line
3. **Translation**: Each phrase gets translated with context preservation
4. **Output**: Download the formatted learning material

### Translation Format Example

**Input (German to Ukrainian):**
```
Der Sohn schreibt eine Karte aus dem Ferienlager.
Liebe Mutti, lieber Papi, das Wetter ist sehr schön.
```

**Output (Learning Format):**
```
Der Sohn schreibt (син пише) eine Karte (листівку) aus dem Ferienlager (з табору відпочинку: die Ferien – канікули, das Lager – табір).

Der Sohn schreibt eine Karte aus dem Ferienlager.

Liebe Mutti (дорога мамо), lieber Papi (дорогий тато), das Wetter ist sehr schön (погода дуже гарна).

Liebe Mutti, lieber Papi, das Wetter ist sehr schön.
```

**Input (Spanish to English):**
```
Me gusta mucho viajar por el mundo y conocer nuevas culturas.
```

**Output (Learning Format):**
```
Me gusta mucho (I really like) viajar (to travel) por el mundo (around the world) y conocer (and meet/discover) nuevas culturas (new cultures).

Me gusta mucho viajar por el mundo y conocer nuevas culturas.
```

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icons

### Backend
- **Flask** - Python web framework
- **OpenAI API** - GPT-4o-mini for translations
- **Flask-CORS** - Cross-origin resource sharing
- **Server-Sent Events** - Real-time progress updates

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main translation interface
│   ├── layout.tsx         # Root layout
│   ├── globals.css        # Global styles
│   └── api/               # API routes (alternative to Flask)
├── components/            # Reusable UI components
│   ├── ui/               # Shadcn/ui components
│   └── theme-provider.tsx
├── scripts/
│   └── flask_api.py      # Flask backend server
├── lib/
│   └── utils.ts          # Utility functions
└── public/               # Static assets
```

## ⚙️ Configuration

### Environment Variables

The application uses environment variables for configuration:

**Frontend (.env.local)**:
```env
# OpenAI API Key (required)
OPENAI_API_KEY=your-openai-api-key-here

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000

# Flask server configuration
FLASK_HOST=0.0.0.0
FLASK_PORT=5000

# Environment
NODE_ENV=development
```

**Security Note**: Never commit your `.env.local` file to version control. The actual API key has been moved to environment variables for security.

### Language Customization

Languages can now be selected dynamically through the web interface! The application supports:

- **Frontend Selection**: Choose any language pair from the dropdown menus
- **Language Swap**: Click the swap button (⇄) to instantly reverse source and target languages
- **Dynamic Translation**: The AI automatically adapts its translation style to the selected language pair

To add more languages, modify the `LANGUAGES` array in `app/page.tsx`:

```typescript
const LANGUAGES = [
  { code: "YourLanguage", name: "Your Language (Native Name)" },

]
```

### AI Model Settings

```python
MODEL = "gpt-4o-mini" 
temperature=0.2 
```

## 🎨 UI Components

The application uses a modern component library including:
- File upload with drag-and-drop
- Real-time progress bars
- Responsive cards and layouts
- Toast notifications
- Loading states and animations

## 🔧 Development

### Available Scripts

```bash
# Frontend development
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint

# Backend development
python flask_api.py    # Start Flask server
```

### Environment Variables

Create a `.env.local` file for frontend configuration:
```env
NEXT_PUBLIC_FLASK_URL=http://localhost:5000
```

## 🚦 API Endpoints

### Flask Backend

- `POST /translate` - Upload file and get streaming translation
- `GET /health` - Health check endpoint

### Next.js API (Alternative)

- `POST /api/translate` - Alternative translation endpoint

## 📝 File Format Support

- **Input**: Plain text files (`.txt`)
- **Encoding**: UTF-8
- **Output**: Formatted text with inline translations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📋 Roadmap

- [ ] Support for additional language pairs
- [ ] Batch file processing
- [ ] User authentication and history
- [ ] Custom translation templates
- [ ] Audio pronunciation guides
- [ ] Mobile app version
- [ ] Offline translation capability

## ⚠️ Important Notes

- Requires active internet connection for AI translations
- OpenAI API usage will incur costs based on token usage
- Large files may take several minutes to process
- Keep your API key secure and never commit `.env.local` to version control
- API keys are now stored in environment variables for security

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for providing the translation AI
- Radix UI for accessible components
- Vercel for Next.js framework
- The open-source community for inspiration

---

**Made with ❤️ for language learners**

For questions or support, please open an issue on GitHub.