import onetype from '@onetype/framework';
import users from '@onetype/platform/workspace/users';
import teams from '@onetype/platform/workspace/teams';
import auth from '../../addon.js';

onetype.Pipeline('auth:register', {
	description: 'Create a team and its first user, then issue a session token.',
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
		user: {
			type: 'object',
			description: 'The created user item.'
		},
		team: {
			type: 'object',
			description: 'The created team item.'
		},
		token: {
			type: 'string',
			required: true,
			description: 'Session token in value and id form.'
		},
		expiry: {
			type: 'number',
			required: true,
			description: 'Unix timestamp in milliseconds when the session expires.'
		}
	}
})

.Join('guard', 10, {
	description: 'Ensure no user exists with the email.',
	callback: async function({ email }, resolve)
	{
		if(await users.Find().filter('email', email).count())
		{
			return resolve(null, 'A user with this email already exists.', 400);
		}
	}
})

.Join('team', 20, {
	description: 'Create the team the user will belong to.',
	out: {
		team: {
			type: 'object',
			description: 'Created team item.'
		}
	},
	callback: async function({ name })
	{
		const team = teams.Item({ name: name.trim().split(' ')[0] + "'s Team" });

		await team.Create();

		return { team };
	}
})

.Join('user', 30, {
	description: 'Create the user with the hashed password.',
	requires: ['team'],
	out: {
		user: {
			type: 'object',
			description: 'Created user item.'
		}
	},
	callback: async function({ name, email, password, team })
	{
		const user = users.Item({
			team_id: team.Get('id'),
			name: name.trim(),
			email: email,
			password: await auth.Fn('password.hash', password)
		});

		await user.Create();

		return { user };
	}
})

.Join('session', 40, {
	description: 'Issue a session token for the new user.',
	requires: ['user', 'team'],
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
	callback: async function({ user, team, ip, agent })
	{
		const token = await auth.Fn('token.generate', user.Get('id'), team.Get('id'), 'Session', ip, agent);

		return {
			token: token.Get('token') + ':' + token.Get('id'),
			expiry: new Date(token.Get('expires_at')).getTime()
		};
	}
});
