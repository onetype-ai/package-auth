onetype.AddonReady('ui.layouts', (layouts) =>
{
	layouts.Item({
		id: 'auth-login',
		isActive: true,
		screen: ['auth.login'],
		zone: 'root',
		slot: 'center',
		render: function()
		{
			return `<e-auth-login></e-auth-login>`;
		}
	});
});
