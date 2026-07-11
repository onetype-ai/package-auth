import onetype from '@onetype/framework';
import commands from '@onetype/framework/commands';
import auth from '#auth/addon.js';

commands.Item({
	id: 'auth:logout',
	exposed: true,
	method: 'POST',
	endpoint: '/api/auth/logout',
	description: 'Revokes the active session token and clears the session cookie.',
	metadata: { addon: 'auth' },
	in: {},
	out: {
		success: {
			type: 'boolean',
			required: true,
			description: 'Whether a session was revoked.'
		}
	},
	callback: async function(properties, resolve)
	{
		const value = onetype.CookieGet('ot_session', this.http.request);

		if(!value)
		{
			return resolve(null, 'Not signed in.', 401);
		}

		const [secret] = value.split(':');
		const success = await auth.Fn('token.revoke', secret, 'Session');

		onetype.CookieClear('ot_session', { path: '/' }, this.http.response);

		resolve({ success }, 'Signed out.');
	}
});
