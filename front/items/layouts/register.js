onetype.AddonReady('ui.layouts', (layouts) =>
{
	layouts.Item({
		id: 'auth-register',
		isActive: true,
		condition: {
			callback: function()
			{
				return !$ot.get('user') && this.auth_view === 'register';
			}
		},
		zone: 'root',
		slot: 'center',
		render: function()
		{
			return `<e-auth-register></e-auth-register>`;
		}
	});
});
