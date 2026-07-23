import pipelines from 'addon-pipelines';
import platform from '@onetype/platform/addon';
import auth from '#auth/addon.js';

pipelines.Item({
    id: 'auth:register',
    description: 'Create a user, then issue a session token.',
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
            config: 'platform.users.user',
            description: 'The created user.'
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

.Join('guard', {
    description: 'Ensure no user exists with the email.',
    callback: async function({ email }, resolve)
    {
        if(await platform.users.Find().filter('email', email).count())
        {
            return resolve(null, 'A user with this email already exists.', 400);
        }
    }
})

.Join('user', {
    description: 'Create the user with the hashed password.',
    out: {
        user: {
            type: 'object',
            config: 'platform.users.user',
            description: 'The created user.'
        }
    },
    callback: async function({ name, email, password })
    {
        const user = platform.users.Item({
            name: name.trim(),
            email: email,
            password: await auth.Fn('password.hash', password)
        });

        await user.Create();

        return { user: user.Get(['id', 'name', 'email', 'is_verified']) };
    }
})

.Join('session', {
    description: 'Issue a session token for the new user.',
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
