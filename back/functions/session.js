import tokens from '@onetype/platform/workspace/tokens';
import users from '@onetype/platform/workspace/users';
import auth from '#auth/addon.js';

auth.Fn('session', async function(value)
{
	const [secret, id] = String(value).split(':');

	if(!secret || !id)
	{
		return null;
	}

	const token = await tokens.Find().filter('token', secret).filter('id', id).filter('type', 'Session').one();

	if(!token || new Date(token.Get('expires_at')) < new Date())
	{
		return null;
	}

	const user = await users.Find().filter('id', token.Get('user_id')).filter('deleted_at', null, 'NULL').one();

	if(!user)
	{
		return null;
	}

	return {
		user: user.Get(['id', 'name', 'email', 'is_verified'])
	};
});
