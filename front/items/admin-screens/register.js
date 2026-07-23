onetype.AddonReady('admin.screens', (screens) =>
{
    screens.Item({
        id: 'auth.register',
        route: '/auth/register',
        metadata: { addon: 'auth' }
    });
});
