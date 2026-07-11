onetype.AddonReady('ui.screens', (screens) =>
{
	screens.Item({
		id: 'auth.register',
		route: '/auth/register',
		metadata: { addon: 'auth' }
	});
});
