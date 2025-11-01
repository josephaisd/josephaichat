# Joseph AI Chatbot

## Overview

Joseph AI is an intelligent chatbot application featuring a modern "liquid glass" UI design aesthetic. The application provides AI-powered conversations using OpenAI's GPT-4o model through OpenRouter, with support for both text and image inputs. Users can create multiple chat sessions, view conversation history, and interact with an AI assistant in a premium, visually appealing interface inspired by modern AI platforms like ChatGPT and Claude.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript, using Vite as the build tool and development server.

**UI Component System**: Built on shadcn/ui components with Radix UI primitives, providing a comprehensive set of accessible, customizable components. The design follows a "liquid glass" aesthetic with frosted glass effects, backdrop blur, translucent surfaces, and gradient overlays.

**Styling**: Tailwind CSS with custom design tokens defined in CSS variables. The theme system supports both dark and light modes with a custom color palette featuring glass surfaces, gradient backgrounds, and carefully selected accent colors (primary: cyan, neutral backgrounds).

**State Management**: 
- TanStack Query (React Query) for server state management and API data fetching
- React hooks for local component state
- Session storage for guest mode persistence

**Routing**: Wouter for lightweight client-side routing

**Key Design Decisions**:
- Chose shadcn/ui over a monolithic component library for maximum customization flexibility
- Implemented custom "liquid glass" design system with backdrop blur and gradient effects
- Split components into reusable UI primitives (Button, Card, Dialog, etc.) and feature-specific components (ChatInput, MessageBubble, etc.)

### Backend Architecture

**Runtime**: Node.js with Express.js server

**Language**: TypeScript with ES modules

**API Design**: RESTful API endpoints for chat and message management:
- `/api/auth/user` - User authentication status
- `/api/chats` - CRUD operations for chat sessions
- `/api/chats/:id/messages` - Message management per chat

**Authentication**: Replit's OpenID Connect (OIDC) authentication flow using Passport.js strategy, with support for guest mode sessions

**Session Management**: 
- Express sessions stored in PostgreSQL using connect-pg-simple
- 7-day session TTL with secure, HTTP-only cookies
- Session storage table for persistent authentication state

**Key Design Decisions**:
- Chose Express for its simplicity and extensive middleware ecosystem
- Implemented dual-mode authentication (authenticated users + guest sessions) for flexibility
- Used RESTful patterns for predictable, standard API interactions

### Data Storage

**Database**: PostgreSQL via Neon serverless driver

**ORM**: Drizzle ORM for type-safe database operations

**Schema Design**:
- `users` - User profiles with email, name, and avatar
- `chats` - Chat sessions linked to users
- `messages` - Individual messages within chats, supporting both text and image URLs
- `sessions` - Express session storage

**Key Relationships**:
- Users have many Chats (one-to-many with cascade delete)
- Chats have many Messages (one-to-many with cascade delete)
- Supports nullable userId for guest mode functionality

**Storage Abstraction**: IStorage interface with two implementations:
- `MemStorage` - In-memory storage for development/testing
- Database-backed storage using Drizzle ORM for production

**Key Design Decisions**:
- Chose Drizzle ORM for excellent TypeScript integration and type inference
- Implemented storage interface pattern for flexibility and testability
- Used Neon serverless PostgreSQL for modern, scalable cloud database hosting

### External Dependencies

**AI Service**: 
- OpenRouter API acting as a gateway to OpenAI's GPT-4o model
- Configured with environment variable `OPENROUTER_API_KEY`
- Supports both text and image-based conversations
- Base URL: `https://openrouter.ai/api/v1`

**Authentication Provider**:
- Replit OIDC authentication
- Issuer URL: `https://replit.com/oidc` (or custom via env)
- Requires `REPL_ID` and `SESSION_SECRET` environment variables

**Third-Party Libraries**:
- Google Fonts: Inter, SF Pro Display, DM Sans, Geist Mono, Fira Code, Architects Daughter
- Radix UI: Comprehensive set of accessible component primitives
- Lucide React: Icon library for consistent iconography
- date-fns: Date formatting and manipulation

**Build and Development Tools**:
- Vite: Fast build tool with HMR support
- ESBuild: Production bundling for server code
- Replit-specific plugins for error overlay and source mapping

**Environment Variables Required**:
- `DATABASE_URL` - PostgreSQL connection string (Neon serverless)
- `OPENROUTER_API_KEY` - API key for AI model access
- `SESSION_SECRET` - Secret for session encryption
- `REPL_ID` - Replit environment identifier
- `ISSUER_URL` - OIDC issuer URL (optional, defaults to Replit)

**Key Design Decisions**:
- Used OpenRouter as an abstraction layer over OpenAI for flexibility and potential model switching
- Integrated Replit authentication for seamless deployment on Replit platform
- Leveraged shadcn/ui's approach of copying components into the project for full control
- Separated concerns between AI integration, authentication, and data persistence