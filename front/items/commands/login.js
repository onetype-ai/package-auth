commands.Item({
    id: 'auth:login',
    description: 'Signs a user in with email and password through the instance and sets the session cookie.',
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
        const { data, message, code } = await $ot.command('auth:login', properties, true);

        if(code !== 200)
        {
            return resolve(null, message, code);
        }

        const me = await $ot.command('auth:me', {});

        if(me.code === 200)
        {
            $ot.set('user', me.data.user);
        }

        resolve(data, message);
    }
});
