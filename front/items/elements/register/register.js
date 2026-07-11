elements.ItemAdd({
	id: 'auth-register',
	icon: 'person_add',
	name: 'Register',
	description: 'Registration form with name, email and password, submits the auth:register command and reloads the shell on success.',
	category: 'Auth',
	collection: 'Home',
	author: 'OneType',
	metadata: { addon: 'auth' },
	config: {
		background: {
			type: 'number',
			value: 1,
			options: [1, 2, 3],
			description: 'Background depth of the card from 1 to 3.'
		}
	},
	render: function()
	{
		this.success = () => window.location.reload();

		this.swap = () => $ot.ui.layouts.data({ auth_view: 'login' });

		return /* html */ `
			<div class="box">
				<div :class="'card bg-' + background">
					<div class="head">
						<h1>Create your account</h1>
						<p>One account for the whole workspace.</p>
					</div>
					<e-global-notice ot-if="command.error" title="Registration failed" :text="command.error" color="red"></e-global-notice>
					<ot-command-submit command="auth:register" :api="true" :_success="success">
						<div class="fields">
							<e-core-field orientation="vertical" label="Name">
								<div slot="input">
									<e-form-input name="name" placeholder="Your full name" icon="person" :clearable="false"></e-form-input>
								</div>
							</e-core-field>
							<e-core-field orientation="vertical" label="Email">
								<div slot="input">
									<e-form-input type="email" name="email" placeholder="you@company.com" icon="mail" :clearable="false"></e-form-input>
								</div>
							</e-core-field>
							<e-core-field orientation="vertical" label="Password">
								<div slot="input">
									<e-form-input type="password" name="password" placeholder="Pick a strong password" icon="lock" :clearable="false"></e-form-input>
								</div>
							</e-core-field>
							<e-form-button type="submit" text="Create account" icon="person_add" :loading="command.loading" #style="width: 100%"></e-form-button>
						</div>
					</ot-command-submit>
					<div class="foot">
						<span>Already have an account?</span>
						<a ot-click="() => swap()">Sign in</a>
					</div>
				</div>
			</div>
		`;
	}
});
