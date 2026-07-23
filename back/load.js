import auth from './addon.js';

/* Functions */
import './functions/password/hash.js';
import './functions/password/verify.js';
import './functions/token/generate.js';
import './functions/token/expiry.js';
import './functions/token/revoke.js';
import './functions/session.js';

/* Pipelines */
import './items/pipelines/login.js';
import './items/pipelines/register.js';

/* Commands */
import './items/commands/login.js';
import './items/commands/register.js';
import './items/commands/logout.js';
import './items/commands/me.js';

/* Listeners */
import './listeners/middlewares/servers.http.request.js';

export default auth;
