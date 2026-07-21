import users from '@onetype/platform/users';
import auth from '#auth/addon.js';

onetype.Pipeline('auth:login', {
	description: 'Sign a user in: verify the credentials and issue a session token.',
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
		},
		ip: {
			type: 'string',
			description: 'IP address the session is issued from.'
		},
		agent: {
			type: 'string',
			description: 'User agent the session is issued from.'
		}
	},
	out: {
		token: {
			type: 'string',
			required: true,
			description: 'Session token in value and id form.'
		},
		expiry: {
			type: 'number',
			required: true,
			description: 'Unix timestamp in milliseconds when the session expires.'
		},
		user: {
			type: 'object',
			config: 'workspace.user',
			description: 'The signed in user.'
		}
	}
})

.Join('user', 10, {
	description: 'Find the user by email and verify the password against the stored hash.',
	out: {
		user: {
			type: 'object',
			config: 'workspace.user',
			description: 'The signed in user.'
		}
	},
	callback: async function({ email, password }, resolve)
	{
		const user = await users.Find().filter('email', email).filter('deleted_at', null, 'NULL').one();

		if(!user || !await auth.Fn('password.verify', password, user.Get('password')))
		{
			return resolve(null, 'Invalid email or password.', 400);
		}

		return { user: user.Get(['id', 'name', 'email', 'is_verified']) };
	}
})

.Join('session', 20, {
	description: 'Issue a session token for the user.',
	requires: ['user'],
	out: {
		token: {
			type: 'string',
			description: 'Session token in value and id form.'
		},
		expiry: {
			type: 'number',
			description: 'Unix timestamp in milliseconds when the session expires.'
		}
	},
	callback: async function({ user, ip, agent })
	{
		const token = await auth.Fn('token.generate', user.id, 'Session', ip, agent);

		return {
			token: token.Get('token') + ':' + token.Get('id'),
			expiry: new Date(token.Get('expires_at')).getTime()
		};
	}
});
