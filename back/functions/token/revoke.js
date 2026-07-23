import platform from '@onetype/platform/addon';
import auth from '#auth/addon.js';

auth.Fn('token.revoke', async function(value, type = 'Session')
{
    const item = await platform.tokens.Find().filter('token', value).filter('type', type).one();

    if(!item)
    {
        return false;
    }

    await item.Delete();

    return true;
});
