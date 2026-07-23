import auth from '#auth/addon.js';

auth.Fn('token.expiry', function(type)
{
    const day = 24 * 60 * 60 * 1000;

    const lifetimes = {
        'Session': 14 * day
    };

    return new Date(Date.now() + (lifetimes[type] ? lifetimes[type] : day));
});
