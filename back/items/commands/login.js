import onetype from '@onetype/framework';
import commands from '@onetype/framework/commands';

commands.Item({
	id: 'auth:login',
	exposed: true,
	method: 'POST',
	endpoint: '/api/auth/login',
	description: 'Signs a user in with email and password through the auth:login pipeline and sets the session cookie.',
	metadata: { addon: 'auth' },
	in: {
		email: {
			type: 'string',
			required: true,
			description: 'Email address the user signs in with.'
		},
		password: {
			type: 'string',
			required: true,
			description: 'Password in plain text, verified against the stored hash.'
		}
	},
	out: {
		token: {
			type: 'string',
			required: true,
			description: 'Session token in value and id form, also set as the session cookie.'
		},
		expiry: {
			type: 'number',
			required: true,
			description: 'Unix timestamp in milliseconds when the session expires.'
		}
	},
	callback: async function(properties, resolve)
	{
		if(!onetype.ValidateEmail(properties.email))
		{
			return resolve(null, 'Please provide a valid email address.', 400);
		}

		const request = this.http.request;

		const result = await onetype.PipelineRun('auth:login', {
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

		resolve({ token: result.data.token, expiry: result.data.expiry }, 'Welcome back, ' + result.data.user.name + '.');
	}
});
