import crypto from 'crypto';
import tokens from '@onetype/platform/workspace/tokens';
import auth from '#auth/addon.js';

auth.Fn('token.generate', async function(user, team, type = 'Session', ip = '', agent = '')
{
	const item = tokens.Item({
		user_id: user,
		team_id: team,
		type: type,
		token: crypto.randomBytes(64).toString('hex'),
		ip_address: ip,
		user_agent: agent,
		expires_at: auth.Fn('token.expiry', type).toISOString()
	});

	await item.Create();

	return item;
});
