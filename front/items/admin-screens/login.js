onetype.AddonReady('admin.screens', (screens) =>
{
    screens.Item({
        id: 'auth.login',
        route: '/auth/login',
        metadata: { addon: 'auth' }
    });
});
