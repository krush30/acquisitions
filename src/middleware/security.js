import aj from '#config/arcjet.js'
import {slidingWindow} from "@arcjet/node";
import logger from "#config/logger.js";

const securityMiddleware = async (req, res, next) => {
    try {
        // Skip Arcjet locally, when no key, or for safe internal endpoints
        const isDev = process.env.NODE_ENV !== 'production';
        const noKey = !process.env.ARCJET_KEY;
        console.log(process.env.ARCJET_KEY)
        const skipPaths = new Set(['/health', '/api', '/']);
        if (isDev || noKey || skipPaths.has(req.path)) {
            return next();
        }

        const role = req.user?.role || 'guest';
        let limit;
        let message;

        switch (role) {
            case 'admin':
                limit = 20;
                message = 'Admin request limit exceeded (20 per minute). Slow down blud.';
                break;
            case 'user':
                limit = 10;
                message = 'User request limit exceeded (10 per minute). Slow down blud.';
                break;
            default:
                limit = 5;
                message = 'Guest request limit exceeded (5 per minute). Slow down blud.';
                break;
        }

        const client = aj.withRule(
            slidingWindow({
                mode: 'LIVE',
                interval: '1m',
                max: limit,
                name: `${role}-rate-limit`,
            })
        );

        const decision = await client.protect(req);

        if (decision.isDenied() && decision.reason.isBot()) {
            logger.warn('Bot request blocked', { ip: req.ip, userAgent: req.get('User-Agent'), path: req.path });
            return res.status(403).json({ error: 'Error', message: 'Automated requests are not allowed' });
        }

        if (decision.isDenied() && decision.reason.isShield()) {
            logger.warn('Shield blocked request', { ip: req.ip, userAgent: req.get('User-Agent'), path: req.path });
            return res.status(403).json({ error: 'Error', message: 'Request blocked by shield' });
        }

        if (decision.isDenied() && decision.reason.isRateLimit()) {
            logger.warn('Rate Limit Exceeded', { ip: req.ip, userAgent: req.get('User-Agent'), path: req.path });
            return res.status(429).json({ error: 'Error', message });
        }

        next();
    } catch (e) {
        console.error('Arcjet middleware error', e);
        res.status(500).json({ error: 'Internal Server Error', message: 'Something went wrong with security' });
    }
};

export default securityMiddleware;