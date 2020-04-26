import { Toolkit } from 'actions-toolkit';
import action from './action';

Toolkit.run(action, {
  event: 'push',
  secrets: ['GITHUB_TOKEN'],
});
