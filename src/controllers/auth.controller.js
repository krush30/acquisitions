import logger from '#config/logger.js';
import { signupSchema, signinSchema } from '#validations/auth.validations.js';
import { formatValidationError } from '#services/format.js';
import {createUser, authenticateUser} from "../services/auth.service.js";
import {jwttoken} from "#services/jwt.js";
import {users} from "#models/user.model.js";
import {cookies} from "#services/cookies.js";

export const signUp = async (req, res) => {
    try {
        const validationResult = signupSchema.safeParse(req.body);

        if (!validationResult.success) {
            return res.status(400).json({
                error: 'Validation failed.',
                details: formatValidationError(validationResult.error),
            });
        }

        const { name, email, password, role } = validationResult.data;

        const user = await createUser({ name, email, password , role});
        const token = jwttoken.sign({id: user.id, email: user.email, role: user.role});
        cookies.set(res, 'token', token);

        logger.info(`Sign up user ${name} with email ${email}`);
        res.status(201).json({
            message: `Sign up user ${name} with email ${email}`,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (e) {
        logger.error('signUp failed', e);
        if (e.message === 'User with this email already exists') {
            return res
                .status(400)
                .json({ error: 'User with this email already exists' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const signIn = async (req, res) => {
    try {
        const validationResult = signinSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                error: 'Validation failed.',
                details: formatValidationError(validationResult.error),
            });
        }
        const { email, password } = validationResult.data;
        const user = await authenticateUser(email, password);
        const token = jwttoken.sign({ id: user.id, email: user.email, role: user.role });
        cookies.set(res, 'token', token);
        logger.info(`Sign in user with email ${email}`);
        res.status(200).json({
            message: `Sign in user with email ${email}`,
            user,
        });
    } catch (e) {
        logger.error('signIn failed', e);
        if (e.message === 'Invalid email or password') {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const signOut = async (req, res) => {
    try {
        const token = cookies.get(req, 'token');
        cookies.clear(res, 'token');
        if (token) {
            try {
                const payload = jwttoken.verify(token);
                logger.info(`Sign out user with email ${payload.email}`);
            } catch {
                logger.info('Sign out requested with invalid token');
            }
        } else {
            logger.info('Sign out requested with no token');
        }
        res.status(200).json({ message: 'Signed out successfully' });
    } catch (e) {
        logger.error('signOut failed', e);
        res.status(500).json({ error: 'Internal server error' });
    }
};
