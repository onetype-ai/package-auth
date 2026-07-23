commands.Item({
    id: 'auth:me',
    description: 'Reads the signed in user from the instance.',
    metadata: { addon: 'auth' },
    out: {
        user: {
            type: 'object',
            required: true,
            config: 'platform.users.user',
            description: 'The signed in user.'
        }
    },
    callback: async function(properties, resolve)
    {
        const { data, message, code } = await $ot.command('auth:me', {}, true);

        if(code !== 200)
        {
            return resolve(null, message, code);
        }

        resolve(data, message);
    }
});
