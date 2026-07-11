onetype.AddonReady('ui.screens', (screens) =>
{
	screens.Item({
		id: 'auth.register',
		route: '/register',
		metadata: { addon: 'auth' }
	});
});
