# Neural Discourse

A multi-model AI conversation framework that enables autonomous discourse between different large language models. Built with FastAPI and modern async Python.

## Overview

Neural Discourse allows users to configure two or three AI models from different providers and observe them engage in conversation with each other. Each model can be assigned a unique system prompt to define its persona, enabling exploration of how different AI systems interact, debate, and build on each other's ideas.

## Features

- **Multi-Provider Support**: Integrates with Anthropic (Claude), Groq (Llama, Qwen), OpenAI (GPT-4, o1), xAI (Grok), Google (Gemini), Kimi (Moonshot), and OpenRouter
- **2-Way & 3-Way Conversations**: Support for conversations between 2 or 3 AI models simultaneously
- **Demo Mode**: Test the platform without API keys (limited usage)
- **Configurable Personas**: Assign distinct system prompts to each model participant
- **Conversation Persistence**: SQLite database storage for conversation history with full export capabilities (JSON, MD, TXT, CSV)
- **Client-Side API Key Management**: Secure key storage in browser localStorage with key validation
- **Message Injection**: Inject user messages mid-conversation to steer the dialogue
- **Streaming Responses**: Real-time message delivery via Server-Sent Events
- **Responsive Design**: Optimized mobile and desktop layouts with touch-friendly controls
- **Security Hardened**: Rate limiting, CORS protection, CSP headers, and API key redaction in logs

## Tech Stack

**Backend**
- Python 3.11+
- FastAPI (async web framework)
- SQLAlchemy 2.0 (async ORM)
- aiosqlite (async SQLite driver)
- Pydantic (data validation)

**Frontend**
- Vanilla JavaScript (ES6+)
- CSS3 with custom properties
- HTML5 Canvas animations

**Infrastructure**
- Uvicorn (ASGI server)
- Railway/Render compatible deployment

## Installation

### Prerequisites
- Python 3.11 or higher
- pip package manager

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/MckAnissa/neural-discourse.git
cd neural-discourse
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # Linux/macOS
venv\Scripts\activate     # Windows
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the development server:
```bash
python run.py
```

5. Open `http://localhost:8000` in your browser

### API Key Configuration

API keys can be configured in two ways:

1. **Browser Storage** (Recommended): Click the "Keys" button in the application header to enter your API keys. Keys are stored securely in your browser's localStorage.

2. **Environment Variables**: Create a `.env` file based on `.env.example`:
```
ANTHROPIC_API_KEY=your_key_here
GROQ_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
XAI_API_KEY=your_key_here
```

## Project Structure

```
neural-discourse/
├── app/
│   ├── providers/          # AI provider implementations
│   │   ├── anthropic.py    # Claude integration
│   │   ├── groq.py         # Groq integration
│   │   ├── openai.py       # OpenAI integration
│   │   ├── xai.py          # xAI/Grok integration
│   │   └── base.py         # Abstract base provider
│   ├── routes/             # API endpoints
│   │   ├── conversations.py
│   │   └── models.py
│   ├── static/             # Frontend assets
│   ├── templates/          # Jinja2 templates
│   ├── config.py           # Application settings
│   ├── database.py         # Database configuration
│   ├── models.py           # SQLAlchemy models
│   ├── schemas.py          # Pydantic schemas
│   └── main.py             # Application entry point
├── requirements.txt
├── Procfile                # Deployment configuration
└── run.py                  # Development server script
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/models` | List available models by provider |
| GET | `/api/conversations` | List all conversations |
| POST | `/api/conversations` | Create new conversation |
| GET | `/api/conversations/{id}` | Get conversation details |
| DELETE | `/api/conversations/{id}` | Delete conversation |
| GET | `/api/conversations/{id}/messages` | Get conversation messages |
| POST | `/api/conversations/{id}/run` | Execute conversation turns |

## Deployment

### Railway

1. Connect your GitHub repository to Railway
2. Railway auto-detects the Python application
3. Generate a public domain in Settings > Networking

### Render

1. Create a new Web Service connected to your repository
2. Set build command: `pip install -r requirements.txt`
3. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

## Architecture Decisions

- **Async-First Design**: All database operations and API calls use async/await for optimal performance under concurrent load
- **Provider Abstraction**: Common interface allows easy addition of new AI providers
- **Client-Side Key Storage**: Eliminates server-side key management complexity while maintaining security
- **Streaming Architecture**: NDJSON streaming enables real-time UI updates during model responses

## License

MIT License - see LICENSE file for details

## Author

Anissa McKnight
