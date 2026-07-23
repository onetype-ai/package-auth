elements.ItemAdd({
    id: 'auth-login',
    icon: 'login',
    name: 'Login',
    description: 'Login form with email and password, submits the auth:login command and reloads the shell on success.',
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

            const { message, code } = await $ot.command('auth:login', data);

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
                    <e-admin-global-heading title="Welcome back" description="Sign in to your workspace."></e-admin-global-heading>
                    <e-admin-global-notice ot-if="error" title="Sign in failed" :text="error" color="red"></e-admin-global-notice>

                    <ot-form :_submit="submit">
                        <div class="fields">
                            <e-admin-core-field orientation="vertical" label="Email">
                                <div slot="input">
                                    <e-admin-form-input type="email" name="email" placeholder="you@company.com" icon="mail" :clearable="false"></e-admin-form-input>
                                </div>
                            </e-admin-core-field>
                            <e-admin-core-field orientation="vertical" label="Password">
                                <div slot="input">
                                    <e-admin-form-input type="password" name="password" placeholder="Your password" icon="lock" :clearable="false"></e-admin-form-input>
                                </div>
                            </e-admin-core-field>
                            <e-admin-form-button type="submit" text="Sign in" icon="login" :loading="loading" #style="width: 100%"></e-admin-form-button>
                        </div>
                    </ot-form>
                    <div class="foot">
                        <span>New here?</span>
                        <a href="/auth/register">Create an account</a>
                    </div>
                </div>
            </div>
        `;
    }
});
