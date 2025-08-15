# QUP - Question-Answer Platform

A modern Slack-like messaging platform with Stack Overflow-style Q&A features, built as a monorepo with React Native mobile app, Next.js admin web, and Node.js backend API.

## 🚀 Features

### Core Features
- **Real-time messaging** with WebSocket/GraphQL subscriptions
- **Q&A system** with questions, answers, and comments
- **Role-based voting system** (normal users = 1 vote, special users = 5 votes)
- **File attachments** (images, videos, documents)
- **User roles** (Normal, Special, Moderator, Admin)
- **Channel/workspace management**
- **Reputation system** based on votes received
- **Search and filtering** for questions/answers

### Technical Features
- **GraphQL-first API** with REST supplementary endpoints
- **Real-time updates** via GraphQL subscriptions
- **Firebase integration** for mobile push notifications
- **File uploads** with S3 presigned URLs
- **Dockerized** for easy development and deployment
- **AWS infrastructure** with ECS, RDS, ElastiCache
- **CI/CD pipelines** for automated deployment

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Native  │    │   Next.js Admin │    │   Third-party   │
│     (Mobile)    │    │      (Web)      │    │   Integrations  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   API Gateway   │
                    │  (ALB + Route)  │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Backend API   │
                    │                 │
                    │  GraphQL Server │
                    │  + REST Routes  │
                    │  + WebSockets   │
                    └─────────────────┘
```

## 📁 Project Structure

```
qup/
├── apps/
│   ├── mobile/           # React Native (Expo) app
│   ├── admin/            # Next.js admin web
│   ├── api/              # Node.js GraphQL + REST API
│   └── worker/           # Background job processor
├── packages/
│   ├── ui/               # Shared React/RN components
│   ├── tsconfig/         # Shared TypeScript configs
│   ├── eslint-config/    # Shared ESLint configs
│   ├── shared/           # Shared types, utils, constants
│   └── api-client/       # Generated GraphQL client
├── infra/
│   ├── terraform/        # AWS infrastructure
│   └── docker/           # Docker configurations
├── .github/workflows/    # CI/CD pipelines
├── turbo.json           # Turborepo configuration
└── package.json         # Root package.json
```

## 🛠️ Tech Stack

### Frontend
- **React Native** (Expo) - Mobile app
- **Next.js 14** - Admin web app
- **GraphQL** (Apollo Client) - Data fetching
- **TypeScript** - Type safety

### Backend
- **Node.js** - Runtime
- **GraphQL** (Apollo Server) - Primary API
- **Express.js** - REST supplementary endpoints
- **Prisma** - Database ORM
- **PostgreSQL** - Primary database
- **Redis** - Caching and sessions
- **WebSocket** - Real-time communication

### Infrastructure
- **AWS ECS Fargate** - Container orchestration
- **Amazon RDS** - Managed PostgreSQL
- **ElastiCache Redis** - Managed Redis
- **S3** - File storage
- **CloudFront** - CDN
- **Application Load Balancer** - Traffic routing
- **Route 53** - DNS management
- **ACM** - SSL certificates

### DevOps
- **Docker** - Containerization
- **Terraform** - Infrastructure as Code
- **GitHub Actions** - CI/CD
- **Turborepo** - Monorepo build system

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm 8+
- Docker & Docker Compose
- AWS CLI (for deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd qup
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start local infrastructure**
   ```bash
   pnpm docker:up
   ```

5. **Run database migrations**
   ```bash
   pnpm db:migrate
   ```

6. **Start development servers**
   ```bash
   pnpm dev
   ```

### Available Scripts

- `pnpm dev` - Start all development servers
- `pnpm build` - Build all packages and apps
- `pnpm lint` - Run linting across all packages
- `pnpm test` - Run tests across all packages
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm docker:up` - Start local Docker services
- `pnpm docker:down` - Stop local Docker services
- `pnpm db:migrate` - Run database migrations
- `pnpm db:seed` - Seed database with sample data

## 📱 Mobile App Development

### React Native (Expo)

```bash
cd apps/mobile
pnpm start
```

- Scan QR code with Expo Go app
- Or run on Android/iOS simulators

### Key Features
- Real-time chat with GraphQL subscriptions
- Q&A interface with voting
- File uploads (images/videos)
- Push notifications via Firebase
- Offline support with Apollo Client cache

## 🌐 Admin Web Development

### Next.js Admin

```bash
cd apps/admin
pnpm dev
```

- Access at `http://localhost:3000`
- Admin dashboard for user management
- Channel moderation tools
- Analytics and reporting

## 🔧 API Development

### GraphQL + REST API

```bash
cd apps/api
pnpm dev
```

- GraphQL endpoint: `http://localhost:4000/graphql`
- REST API: `http://localhost:4000/api/v1`
- GraphQL Playground: `http://localhost:4000/graphql`

### Key Endpoints

#### GraphQL
- `Query` - Fetch data (users, channels, messages, questions)
- `Mutation` - Modify data (send messages, vote, create questions)
- `Subscription` - Real-time updates (chat, notifications)

#### REST
- `POST /api/v1/auth/login` - User authentication
- `POST /api/v1/files/upload` - File uploads
- `GET /api/v1/users` - User management
- `POST /api/v1/push/send` - Send push notifications

## 🗄️ Database Schema

### Core Tables
- `users` - User accounts and profiles
- `channels` - Chat channels and workspaces
- `messages` - Chat messages and Q&A content
- `questions` - Q&A questions
- `votes` - Voting system with weights
- `files` - File attachments
- `notifications` - User notifications

### Key Relationships
- Users can belong to multiple channels
- Messages can be questions, answers, or comments
- Votes have weights based on user roles
- Files are linked to messages and questions

## 🔐 Authentication & Authorization

### User Roles
- **Normal User** - Basic messaging and voting (1 vote weight)
- **Special User** - Enhanced privileges (5 vote weight)
- **Moderator** - Channel moderation (10 vote weight)
- **Admin** - Full system access (20 vote weight)

### Permissions
- Role-based access control
- Channel-specific permissions
- Content moderation capabilities
- User management tools

## 📤 File Upload System

### Supported Types
- **Images**: JPEG, PNG, GIF, WebP
- **Videos**: MP4, WebM, OGG
- **Documents**: PDF, TXT, DOC

### Upload Flow
1. Client requests presigned URL from API
2. File uploaded directly to S3
3. API notified of completion
4. File metadata stored in database

## 🔔 Push Notifications

### Firebase Integration
- Android push notifications
- Real-time delivery
- Rich notifications with images
- Topic-based subscriptions

### Notification Types
- New messages in channels
- Answers to your questions
- Vote notifications
- Mentions (@username)
- System announcements

## 🚀 Deployment

### AWS Infrastructure

1. **Deploy infrastructure**
   ```bash
   cd infra/terraform
   terraform init
   terraform plan
   terraform apply
   ```

2. **Deploy applications**
   ```bash
   # CI/CD will handle this automatically
   # Or manually push to trigger deployment
   git push origin main
   ```

### Environment Variables

Required environment variables for production:

```bash
# Database
DATABASE_URL=postgresql://...

# Redis
REDIS_URL=redis://...

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...

# S3
S3_BUCKET=qup-files
S3_REGION=us-east-1

# Firebase
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...

# JWT
JWT_SECRET=...

# App URLs
NEXT_PUBLIC_API_URL=https://api.yourapp.com
NEXT_PUBLIC_WS_URL=wss://api.yourapp.com
```

## 🧪 Testing

### Test Types
- **Unit tests** - Individual functions and components
- **Integration tests** - API endpoints and database operations
- **E2E tests** - Full user workflows
- **Load tests** - Performance under stress

### Running Tests
```bash
# All tests
pnpm test

# Specific app
pnpm test --filter=api
pnpm test --filter=mobile
pnpm test --filter=admin

# Watch mode
pnpm test --watch
```

## 📊 Monitoring & Observability

### AWS Services
- **CloudWatch** - Logs and metrics
- **X-Ray** - Distributed tracing
- **Sentry** - Error tracking
- **Datadog** - Application monitoring

### Key Metrics
- API response times
- Database query performance
- Real-time connection count
- File upload success rates
- Push notification delivery

## 🤝 Contributing

### Development Workflow
1. Create feature branch from `main`
2. Make changes with tests
3. Run linting and type checking
4. Submit pull request
5. Code review and approval
6. Merge to main

### Code Standards
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Conventional commits
- Comprehensive testing

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [API Documentation](docs/api.md)
- [Mobile App Guide](docs/mobile.md)
- [Admin Panel Guide](docs/admin.md)
- [Deployment Guide](docs/deployment.md)

### Issues
- [GitHub Issues](https://github.com/your-org/qup/issues)
- [Discussions](https://github.com/your-org/qup/discussions)

### Contact
- Email: support@yourapp.com
- Discord: [Join our community](https://discord.gg/yourapp)

---

**Built with ❤️ using modern web technologies**
