import tokens from '@onetype/platform/workspace/tokens';
import auth from '../../addon.js';

auth.Fn('token.revoke', async function(value, type = 'Session')
{
	const item = await tokens.Find().filter('token', value).filter('type', type).one();

	if(!item)
	{
		return false;
	}

	await item.Delete();

	return true;
});
