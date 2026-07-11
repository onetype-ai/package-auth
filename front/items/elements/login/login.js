elements.ItemAdd({
	id: 'auth-login',
	icon: 'login',
	name: 'Login',
	description: 'Login form with email and password, submits the auth:login command and reloads the shell on success.',
	category: 'Auth',
	collection: 'Home',
	author: 'OneType',
	metadata: { addon: 'auth' },
	config: {},
	render: function()
	{
		this.success = () => window.location.reload();

		this.swap = () => $ot.ui.layouts.data({ auth_view: 'register' });

		return /* html */ `
			<div class="box">
				<div class="card">
					<div class="head">
						<h1>Welcome back</h1>
						<p>Sign in to your workspace.</p>
					</div>
					<e-global-notice ot-if="command.error" title="Sign in failed" :text="command.error" color="red"></e-global-notice>
					<ot-command-submit command="auth:login" :api="true" :_success="success">
						<div class="fields">
							<e-core-field orientation="vertical" label="Email">
								<div slot="input">
									<e-form-input type="email" name="email" placeholder="you@company.com" icon="mail" :clearable="false"></e-form-input>
								</div>
							</e-core-field>
							<e-core-field orientation="vertical" label="Password">
								<div slot="input">
									<e-form-input type="password" name="password" placeholder="Your password" icon="lock" :clearable="false"></e-form-input>
								</div>
							</e-core-field>
							<e-form-button type="submit" text="Sign in" icon="login" :loading="command.loading" #style="width: 100%"></e-form-button>
						</div>
					</ot-command-submit>
					<div class="foot">
						<span>New here?</span>
						<a ot-click="() => swap()">Create an account</a>
					</div>
				</div>
			</div>
		`;
	}
});
