import onetype from '@onetype/framework';
import commands from '@onetype/framework/commands';
import auth from '#auth/addon.js';

commands.Item({
	id: 'auth:me',
	exposed: true,
	method: 'GET',
	endpoint: '/api/auth/me',
	description: 'Returns the signed in user, resolved from the session cookie or the authorization header.',
	metadata: { addon: 'auth' },
	in: {},
	out: {
		user: {
			type: 'object',
			required: true,
			config: 'workspace.user',
			description: 'The signed in user.'
		}
	},
	condition: function()
	{
		if(!onetype.CookieGet('ot_session', this.http.request) && !this.http.request.headers.authorization)
		{
			return 'Not authenticated.';
		}
	},
	callback: async function(properties, resolve)
	{
		const value = onetype.CookieGet('ot_session', this.http.request) || this.http.request.headers.authorization;
		const session = await auth.Fn('session', value);

		if(!session)
		{
			return resolve(null, 'Invalid or expired session.', 401);
		}

		resolve({ user: session.user });
	}
});
