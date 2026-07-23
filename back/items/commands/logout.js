import commands from 'addon-commands';
import auth from '#auth/addon.js';

commands.Item({
    id: 'auth:logout',
    exposed: true,
    method: 'POST',
    endpoint: '/api/auth/logout',
    description: 'Revokes the active session token and clears the session cookie.',
    metadata: { addon: 'auth' },
    in: {},
    out: {
        success: {
            type: 'boolean',
            required: true,
            description: 'Whether a session was revoked.'
        }
    },
    condition: function()
    {
        if(!onetype.CookieGet('ot_session', this.http.request))
        {
            return 'Not signed in.';
        }
    },
    callback: async function(properties, resolve)
    {
        const value = onetype.CookieGet('ot_session', this.http.request);
        const [secret] = value.split(':');
        const success = await auth.Fn('token.revoke', secret, 'Session');

        onetype.CookieClear('ot_session', { path: '/' }, this.http.response);

        resolve({ success }, 'Signed out.');
    }
});
