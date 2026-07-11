import tokens from '@onetype/platform/workspace/tokens';
import users from '@onetype/platform/workspace/users';
import teams from '@onetype/platform/workspace/teams';
import auth from '#auth/addon.js';

auth.Fn('session', async function(value)
{
	const [secret, id] = String(value).split(':');

	if(!secret || !id)
	{
		return null;
	}

	const token = await tokens.Find().filter('token', secret).filter('id', id).filter('type', ['Session', 'API'], 'IN').one();

	if(!token || new Date(token.Get('expires_at')) < new Date())
	{
		return null;
	}

	const user = await users.Find().filter('id', token.Get('user_id')).filter('deleted_at', null, 'NULL').one();

	if(!user)
	{
		return null;
	}

	const team = await teams.Find().filter('id', user.Get('team_id')).filter('deleted_at', null, 'NULL').one();

	return {
		user: {
			id: user.Get('id'),
			name: user.Get('name'),
			email: user.Get('email'),
			is_verified: user.Get('is_verified')
		},
		team: team ? {
			id: team.Get('id'),
			name: team.Get('name')
		} : null
	};
});
