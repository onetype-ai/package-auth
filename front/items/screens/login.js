onetype.AddonReady('ui.screens', (screens) =>
{
	screens.Item({
		id: 'auth.login',
		route: '/login',
		metadata: { addon: 'auth' }
	});
});
