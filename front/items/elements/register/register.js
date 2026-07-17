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
			options: [0, 1, 2, 3],
			description: 'Background depth of the card from 1 to 3. 0 renders transparent, without background or borders.'
		}
	},
	render: function()
	{
		this.error = null;
		this.loading = false;

		this.submit = async (data) =>
		{
			if(this.loading)
			{
				return false;
			}

			this.loading = true;
			this.error = null;

			const { message, code } = await $ot.command('auth:register', data);

			this.loading = false;

			if(code !== 200)
			{
				this.error = message;

				return false;
			}

			await $ot.ui.screens.close();

			return false;
		};

		return /* html */ `
			<div class="box">
				<div :class="'card bg-' + background">
					<e-global-heading title="Create your account" description="One account for the whole workspace."></e-global-heading>
					<e-global-notice ot-if="error" title="Registration failed" :text="error" color="red"></e-global-notice>

					<ot-form :_submit="submit">
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
							<e-form-button type="submit" text="Create account" icon="person_add" :loading="loading" #style="width: 100%"></e-form-button>
						</div>
					</ot-form>
					<div class="foot">
						<span>Already have an account?</span>
						<a href="/auth/login">Sign in</a>
					</div>
				</div>
			</div>
		`;
	}
});
