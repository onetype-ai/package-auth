import onetype from '@onetype/framework';
import commands from '@onetype/framework/commands';
import users from '@onetype/platform/workspace/users';
import auth from '../../addon.js';

commands.Item({
	id: 'auth:login',
	exposed: true,
	method: 'POST',
	endpoint: '/api/auth/login',
	description: 'Signs a user in with email and password, issues a session token and sets the session cookie.',
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

		const user = await users.Find().filter('email', properties.email).filter('deleted_at', null, 'NULL').one();

		if(!user || !await auth.Fn('password.verify', properties.password, user.Get('password')))
		{
			return resolve(null, 'Invalid email or password.', 400);
		}

		const request = this.http.request;
		const token = await auth.Fn('token.generate', user.Get('id'), user.Get('team_id'), 'Session', request.socket.remoteAddress, request.headers['user-agent']);
		const value = token.Get('token') + ':' + token.Get('id');
		const expiry = new Date(token.Get('expires_at'));

		onetype.CookieSet('ot_session', value, { path: '/', maxAge: Math.floor((expiry.getTime() - Date.now()) / 1000), sameSite: 'Lax' }, this.http.response);

		resolve({ token: value, expiry: expiry.getTime() }, 'Welcome back, ' + user.Get('name') + '.');
	}
});
