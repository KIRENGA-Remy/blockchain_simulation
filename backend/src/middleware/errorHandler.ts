
// Central Express error handler.  Any route that calls next(err)
// lands here, so we never expose stack traces to the client.

import { Request, Response, NextFunction } from 'express';

// Global error-handling middleware.

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
    console.error('[ERROR]', err.message, err.stack);
    res.status(500).json({ 
        status: false,
        error: err.message || 'Internal Server Error'
     });
}