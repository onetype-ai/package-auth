import crypto from 'crypto';
import platform from '@onetype/platform/addon';
import auth from '#auth/addon.js';

auth.Fn('token.generate', async function(user, type = 'Session', ip = '', agent = '')
{
    const item = platform.tokens.Item({
        user_id: user,
        type: type,
        token: crypto.randomBytes(64).toString('hex'),
        ip_address: ip,
        user_agent: agent,
        expires_at: auth.Fn('token.expiry', type).toISOString()
    });

    await item.Create();

    return item;
});
