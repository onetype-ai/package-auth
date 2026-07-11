onetype.AddonReady('ui.layouts', (layouts) =>
{
	layouts.Item({
		id: 'auth-register',
		isActive: true,
		screen: ['auth.register'],
		zone: 'root',
		slot: 'center',
		render: function()
		{
			return `<e-auth-register></e-auth-register>`;
		}
	});
});
