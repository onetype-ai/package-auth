import crypto from 'crypto';
import { promisify } from 'util';
import auth from '../../addon.js';

const scrypt = promisify(crypto.scrypt);

auth.Fn('password.hash', async function(password)
{
	const salt = crypto.randomBytes(16).toString('hex');
	const hash = await scrypt(password, salt, 64);

	return salt + ':' + hash.toString('hex');
});
