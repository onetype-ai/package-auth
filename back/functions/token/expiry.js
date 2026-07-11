import auth from '../../addon.js';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

const LIFETIMES = {
	'Session': 14 * DAY,
	'Access': HOUR,
	'Refresh': 30 * DAY,
	'API': 365 * DAY,
	'Invite': 7 * DAY,
	'Reset': DAY,
	'Verify': DAY
};

auth.Fn('token.expiry', function(type)
{
	return new Date(Date.now() + (LIFETIMES[type] ? LIFETIMES[type] : DAY));
});
