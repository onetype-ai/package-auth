onetype.AddonReady('ui.layouts', (layouts) =>
{
	layouts.Item({
		id: 'auth-login',
		isActive: true,
		condition: {
			callback: function()
			{
				return !$ot.get('user') && this.auth_view !== 'register';
			}
		},
		zone: 'root',
		slot: 'center',
		config: {
			'auth_view': {
				type: 'string',
				value: 'login',
				description: 'Which auth screen shows while nobody is signed in, login or register.'
			}
		},
		render: function()
		{
			return `<e-auth-login></e-auth-login>`;
		}
	});
});
