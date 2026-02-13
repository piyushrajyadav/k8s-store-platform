import express, { Application, Request, Response, NextFunction } from 'express';
import storeRoutes from './routes/storeRoutes';

/**
 * Express application setup
 */
export function createApp(): Application {
    const app = express();

    // Middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // CORS middleware (allow all origins for simplicity)
    app.use((req: Request, res: Response, next: NextFunction) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        if (req.method === 'OPTIONS') {
            return res.sendStatus(200);
        }

        next();
    });

    // Routes
    app.use('/stores', storeRoutes);

    // Health check endpoint
    app.get('/health', (req: Request, res: Response) => {
        res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    });

    // Root endpoint
    app.get('/', (req: Request, res: Response) => {
        res.json({
            message: 'Store Provisioning Platform API',
            version: '1.0.0',
            endpoints: {
                stores: '/stores',
                health: '/health'
            }
        });
    });

    // 404 handler
    app.use((req: Request, res: Response) => {
        res.status(404).json({ error: 'Route not found' });
    });

    // Error handler
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
        console.error('Unhandled error:', err);
        res.status(500).json({ error: 'Internal server error' });
    });

    return app;
}
