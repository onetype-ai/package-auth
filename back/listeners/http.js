import onetype from '@onetype/framework';
import auth from '#auth/addon.js';

onetype.MiddlewareIntercept('servers.http.request', async (middleware) =>
{
	const http = middleware.value;
	const path = http.url.pathname;

	if(path.endsWith('.js') || path.endsWith('.css'))
	{
		return await middleware.next();
	}

	const value = onetype.CookieGet('ot_session', http.request) || http.request.headers.authorization;

	if(!value)
	{
		return await middleware.next();
	}

	const session = await auth.Fn('session', value);

	if(session)
	{
		http.state.user = session.user;
	}

	await middleware.next();
});
