import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { ApolloServer } from 'apollo-server-express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { makeExecutableSchema } from '@graphql-tools/schema';

import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';
import { context } from './graphql/context';
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { logger } from './utils/logger';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use(rateLimiter);

// Authentication middleware
app.use(authMiddleware);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Create GraphQL schema
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// Create Apollo Server
const apolloServer = new ApolloServer({
  schema,
  context,
  introspection: process.env.NODE_ENV !== 'production',
  playground: process.env.NODE_ENV !== 'production',
  formatError: (error) => {
    logger.error('GraphQL Error:', error);
    return {
      message: error.message,
      code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
    };
  },
});

// Apply Apollo Server middleware
apolloServer.applyMiddleware({ 
  app, 
  path: '/graphql',
  cors: false // We handle CORS at the app level
});

// REST API routes
app.use('/api/v1/auth', require('./routes/auth').default);
app.use('/api/v1/users', require('./routes/users').default);
app.use('/api/v1/channels', require('./routes/channels').default);
app.use('/api/v1/messages', require('./routes/messages').default);
app.use('/api/v1/questions', require('./routes/questions').default);
app.use('/api/v1/votes', require('./routes/votes').default);
app.use('/api/v1/files', require('./routes/files').default);
app.use('/api/v1/notifications', require('./routes/notifications').default);

// Error handling middleware
app.use(errorHandler);

// Create HTTP server
const server = createServer(app);

// WebSocket server for GraphQL subscriptions
const wsServer = new WebSocketServer({
  server,
  path: '/graphql',
});

useServer(
  {
    schema,
    context,
  },
  wsServer
);

// Start server
async function startServer() {
  try {
    await apolloServer.start();
    
    server.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📊 GraphQL endpoint: http://localhost:${PORT}/graphql`);
      logger.info(`🔌 WebSocket endpoint: ws://localhost:${PORT}/graphql`);
      logger.info(`🏥 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

startServer();
