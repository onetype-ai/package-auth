import crypto from 'crypto';
import { promisify } from 'util';
import auth from '#auth/addon.js';

const scrypt = promisify(crypto.scrypt);

auth.Fn('password.verify', async function(password, stored)
{
    const [salt, hash] = String(stored).split(':');

    if(!salt || !hash)
    {
        return false;
    }

    const candidate = await scrypt(password, salt, 64);

    return crypto.timingSafeEqual(candidate, Buffer.from(hash, 'hex'));
});
