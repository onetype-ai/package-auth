import onetype from '@onetype/framework';
import commands from '@onetype/framework/commands';

commands.Item({
	id: 'auth:register',
	exposed: true,
	method: 'POST',
	endpoint: '/api/auth/register',
	description: 'Creates a team and its first user through the auth:register pipeline, then signs the user in and sets the session cookie.',
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

		const request = this.http.request;

		const result = await onetype.PipelineRun('auth:register', {
			name: properties.name,
			email: properties.email,
			password: properties.password,
			ip: request.socket.remoteAddress || '',
			agent: request.headers['user-agent'] || ''
		});

		if(result.code !== 200)
		{
			return resolve(null, result.message, result.code);
		}

		onetype.CookieSet('ot_session', result.data.token, { path: '/', maxAge: Math.floor((result.data.expiry - Date.now()) / 1000), sameSite: 'Lax' }, this.http.response);

		resolve({
			user: {
				id: result.data.user.Get('id'),
				name: result.data.user.Get('name'),
				email: result.data.user.Get('email')
			},
			team: {
				id: result.data.team.Get('id'),
				name: result.data.team.Get('name')
			}
		}, 'Welcome to OneType, ' + result.data.user.Get('name') + '.');
	}
});
