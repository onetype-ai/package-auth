import onetype from '@onetype/framework';
import commands from '@onetype/framework/commands';
import users from '@onetype/platform/workspace/users';
import teams from '@onetype/platform/workspace/teams';

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
			config: 'workspace.user',
			description: 'The created user.'
		},
		team: {
			type: 'object',
			required: true,
			config: 'workspace.team',
			description: 'The created team.'
		}
	},
	condition: async function()
	{
		const manifest = $ot.get('packages')['onetype/auth'];

		if(!manifest.features.register)
		{
			return 'Registration is disabled on this instance.';
		}

		if(manifest.limits['teams:total'] !== null && await teams.Find().filter('deleted_at', null, 'NULL').count() >= manifest.limits['teams:total'])
		{
			return 'This instance has reached its team limit.';
		}

		if(manifest.limits['users:total'] !== null && await users.Find().filter('deleted_at', null, 'NULL').count() >= manifest.limits['users:total'])
		{
			return 'This instance has reached its user limit.';
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

		resolve({ user: result.data.user, team: result.data.team }, 'Welcome to OneType, ' + result.data.user.name + '.');
	}
});
