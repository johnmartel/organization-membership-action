import { Toolkit } from 'actions-toolkit';
import action from './action';

Toolkit.run(action, {
  event: 'push',
  token: process.env.ORG_MEMBERSHIP_MANAGEMENT_TOKEN,
});
