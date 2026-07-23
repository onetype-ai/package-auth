commands.Item({
    id: 'auth:register',
    description: 'Creates a user on the instance, then signs the user in and sets the session cookie.',
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
            config: 'platform.users.user',
            description: 'The created user.'
        }
    },
    callback: async function(properties, resolve)
    {
        const { data, message, code } = await $ot.command('auth:register', properties, true);

        if(code !== 200)
        {
            return resolve(null, message, code);
        }

        $ot.set('user', data.user);

        resolve(data, message);
    }
});
