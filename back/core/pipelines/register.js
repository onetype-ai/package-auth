import onetype from '@onetype/framework';
import users from '@onetype/platform/workspace/users';
import teams from '@onetype/platform/workspace/teams';
import auth from '#auth/addon.js';

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
			config: 'workspace.user',
			description: 'The created user.'
		},
		team: {
			type: 'object',
			config: 'workspace.team',
			description: 'The created team.'
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

.Join('limits', 5, {
	description: 'Ensure the instance limits allow another team and user.',
	callback: async function(properties, resolve)
	{
		const limits = $ot.system.packages.limits('onetype/auth');

		if(limits.teams !== null && await teams.Find().filter('deleted_at', null, 'NULL').count() >= limits.teams)
		{
			return resolve(null, 'This instance has reached its team limit.', 400);
		}

		if(limits.users !== null && await users.Find().filter('deleted_at', null, 'NULL').count() >= limits.users)
		{
			return resolve(null, 'This instance has reached its user limit.', 400);
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
			config: 'workspace.team',
			description: 'The created team.'
		}
	},
	callback: async function({ name })
	{
		const team = teams.Item({ name: name.trim().split(' ')[0] + "'s Team" });

		await team.Create();

		return { team: team.Get(['id', 'name', 'description']) };
	}
})

.Join('user', 30, {
	description: 'Create the user with the hashed password.',
	requires: ['team'],
	out: {
		user: {
			type: 'object',
			config: 'workspace.user',
			description: 'The created user.'
		}
	},
	callback: async function({ name, email, password, team })
	{
		const user = users.Item({
			team_id: team.id,
			name: name.trim(),
			email: email,
			password: await auth.Fn('password.hash', password)
		});

		await user.Create();

		return { user: user.Get(['id', 'team_id', 'name', 'email', 'is_verified']) };
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
		const token = await auth.Fn('token.generate', user.id, team.id, 'Session', ip, agent);

		return {
			token: token.Get('token') + ':' + token.Get('id'),
			expiry: new Date(token.Get('expires_at')).getTime()
		};
	}
});
