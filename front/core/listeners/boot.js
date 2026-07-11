$ot.boot.then(() =>
{
	const active = $ot.ui.screens.active();

	if(!$ot.get('user') && !active)
	{
		$ot.ui.screens.open('auth.login');
	}

	if($ot.get('user') && ['auth.login', 'auth.register'].includes(active?.Get('id')))
	{
		$ot.ui.screens.close();
	}
});
