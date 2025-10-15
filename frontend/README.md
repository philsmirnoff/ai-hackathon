# Fraud Triage Dashboard

A real-time fraud detection dashboard built with React, TypeScript, and Server-Sent Events.

## Setup

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Configuration

The dashboard connects to a backend SSE endpoint at `/ws` which proxies to `http://localhost:8080` by default.

To change the backend URL, modify the proxy configuration in `vite.config.ts`:

```typescript
server: {
  proxy: {
    "/ws": {
      target: "http://your-backend-url:port",
      changeOrigin: true,
      ws: true
    }
  }
}
```

## Features

- Real-time fraud insights via Server-Sent Events
- Risk-based filtering (OK, REVIEW, LIKELY_FRAUD)
- Search across event_id, explanation, merchant, user_id
- Live statistics and metrics
- Responsive card-based layout
- Auto-retry on connection loss
- Performance optimized (400 item cap)

## Data Format

The dashboard expects insights in this format:

```typescript
{
  event_id: string;
  risk: "OK" | "REVIEW" | "LIKELY_FRAUD";
  score: number;        // 0..1
  explanation: string;  // concise LLM reason
  ts: string;           // ISO string
  user_id?: string;
  amount?: number;
  merchant?: string;
}
```

## Development

- **npm run dev** - Start development server
- **npm run build** - Build for production
- **npm run preview** - Preview production build

## Architecture

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Server-Sent Events** for real-time data streaming
- **Inline styles** for minimal dependencies
- **Custom hooks** for state management
- **Responsive design** with CSS Grid

