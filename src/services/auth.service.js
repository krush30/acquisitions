import bcrypt from 'bcrypt';
import logger from "#config/logger.js";
import {db} from "#config/database.js";
import {users} from "#models/user.model.js";
import {eq} from 'drizzle-orm'

export const hashPassword = async (password) => {
    try {
        return await bcrypt.hash(password, 10);
    } catch (e) {
        logger.error(`Failed to hash password: ${e}`);
        throw new Error('Error hashing password');
    }
}

export const comparePassword = async (password, hashedPassword) => {
    try {
        return await bcrypt.compare(password, hashedPassword);
    } catch (e) {
        logger.error(`Failed to compare password: ${e}`);
        throw new Error('Error comparing password');
    }
}

export const authenticateUser = async (email, password) => {
    try {
        const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
        const user = existing[0];
        if (!user) {
            throw new Error('Invalid email or password');
        }
        const ok = await comparePassword(password, user.password);
        if (!ok) {
            throw new Error('Invalid email or password');
        }
        // Return safe user shape (no password)
        const { id, name, email: uEmail, role, created_at } = user;
        return { id, name, email: uEmail, role, created_at };
    } catch (e) {
        if (e.message === 'Invalid email or password') throw e;
        logger.error(`Failed to authenticate user: ${e}`);
        throw new Error(`Error authenticating user: ${e}`);
    }
}

export const createUser = async ({name, email, password, role = 'user'}) => {
    try {
        const existingUser = db.select().from(users).where(eq(users.email, email)).limit(1);
        if(existingUser.length > 0)throw new Error(`User with email already exists: ${existingUser}`);

        const password_hash = await hashPassword(password);
        const [newUser] = await db.insert(users)
            .values({ name, email, password: password_hash, role })
            .returning({
                id: users.id,
                name: users.name,
                email: users.email,
                role: users.role,
                created_at: users.created_at
            });
        logger.info(`${newUser.email} created succesfully`)
        return newUser;

    }catch (e) {
        logger.error(`Failed to create user: ${e}`);
        throw new Error(`Error creating user: ${e}`);
    }
}
