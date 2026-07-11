import auth from '#auth/addon.js';

const DAY = 24 * 60 * 60 * 1000;

const LIFETIMES = {
	'Session': 14 * DAY
};

auth.Fn('token.expiry', function(type)
{
	return new Date(Date.now() + (LIFETIMES[type] ? LIFETIMES[type] : DAY));
});
