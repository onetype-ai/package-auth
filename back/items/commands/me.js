import onetype from '@onetype/framework';
import commands from '@onetype/framework/commands';
import auth from '#auth/addon.js';

commands.Item({
	id: 'auth:me',
	exposed: true,
	method: 'GET',
	endpoint: '/api/auth/me',
	description: 'Returns the signed in user and their team, resolved from the session cookie or the authorization header.',
	metadata: { addon: 'auth' },
	in: {},
	out: {
		user: {
			type: 'object',
			required: true,
			config: {
				id: {
					type: 'number',
					description: 'Id of the user.'
				},
				name: {
					type: 'string',
					description: 'Display name of the user.'
				},
				email: {
					type: 'string',
					description: 'Email address of the user.'
				},
				is_verified: {
					type: 'boolean',
					description: 'Whether the email address is verified.'
				},
				team: {
					type: 'object',
					config: {
						id: {
							type: 'number',
							description: 'Id of the team.'
						},
						name: {
							type: 'string',
							description: 'Name of the team.'
						}
					},
					description: 'The team the user belongs to.'
				}
			},
			description: 'The signed in user with their team.'
		}
	},
	callback: async function(properties, resolve)
	{
		const value = onetype.CookieGet('ot_session', this.http.request) || this.http.request.headers.authorization;

		if(!value)
		{
			return resolve(null, 'Not authenticated.', 401);
		}

		const session = await auth.Fn('session', value);

		if(!session)
		{
			return resolve(null, 'Invalid or expired session.', 401);
		}

		resolve({ user: { ...session.user, team: session.team } });
	}
});
