import onetype from '@onetype/framework';
import commands from '@onetype/framework/commands';
import users from '@onetype/platform/workspace/users';
import teams from '@onetype/platform/workspace/teams';
import auth from '../../addon.js';

commands.Item({
	id: 'auth:register',
	exposed: true,
	method: 'POST',
	endpoint: '/api/auth/register',
	description: 'Creates a team and its first user, then signs the user in and sets the session cookie.',
	metadata: { addon: 'auth' },
	in: {
		name: {
			type: 'string',
			required: true,
			description: 'Display name of the user.'
		},
		email: {
			type: 'string',
			required: true,
			description: 'Email address the user will sign in with, unique across the instance.'
		},
		password: {
			type: 'string',
			required: true,
			description: 'Password in plain text, stored as a hash.'
		}
	},
	out: {
		user: {
			type: 'object',
			required: true,
			config: {
				id: {
					type: 'number',
					description: 'Id of the created user.'
				},
				name: {
					type: 'string',
					description: 'Display name of the created user.'
				},
				email: {
					type: 'string',
					description: 'Email address of the created user.'
				}
			},
			description: 'The created user.'
		},
		team: {
			type: 'object',
			required: true,
			config: {
				id: {
					type: 'number',
					description: 'Id of the created team.'
				},
				name: {
					type: 'string',
					description: 'Name of the created team.'
				}
			},
			description: 'The created team.'
		}
	},
	callback: async function(properties, resolve)
	{
		if(!onetype.ValidateEmail(properties.email))
		{
			return resolve(null, 'Please provide a valid email address.', 400);
		}

		const validation = onetype.ValidatePassword(properties.password);

		if(!validation.valid)
		{
			return resolve(null, validation.errors.join(' '), 400);
		}

		if(!properties.name || properties.name.trim().length < 2)
		{
			return resolve(null, 'Name must be at least 2 characters long.', 400);
		}

		if(await users.Find().filter('email', properties.email).count())
		{
			return resolve(null, 'A user with this email already exists.', 400);
		}

		const team = teams.Item({ name: properties.name.trim().split(' ')[0] + "'s Team" });

		await team.Create();

		const user = users.Item({
			team_id: team.Get('id'),
			name: properties.name.trim(),
			email: properties.email,
			password: await auth.Fn('password.hash', properties.password)
		});

		await user.Create();

		const request = this.http.request;
		const token = await auth.Fn('token.generate', user.Get('id'), team.Get('id'), 'Session', request.socket.remoteAddress, request.headers['user-agent']);
		const expiry = new Date(token.Get('expires_at'));

		onetype.CookieSet('ot_session', token.Get('token') + ':' + token.Get('id'), { path: '/', maxAge: Math.floor((expiry.getTime() - Date.now()) / 1000), sameSite: 'Lax' }, this.http.response);

		resolve({
			user: {
				id: user.Get('id'),
				name: user.Get('name'),
				email: user.Get('email')
			},
			team: {
				id: team.Get('id'),
				name: team.Get('name')
			}
		}, 'Welcome to OneType, ' + user.Get('name') + '.');
	}
});
