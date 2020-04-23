import { Toolkit, ToolkitOptions } from 'actions-toolkit';
import action from '../src/action';

jest.mock('../src/action');

describe('entrypoint test suite', () => {
  let actionFunction: (tools: Toolkit) => Promise<void>;
  let toolkitOptions: ToolkitOptions | undefined;

  beforeEach(() => {
    Toolkit.run = jest.fn().mockImplementation((fn: (tools: Toolkit) => Promise<void>, options?: ToolkitOptions) => {
      actionFunction = fn;
      toolkitOptions = options;
    });
    require('../src/index');
  });

  it('should run only for the "push" event', () => {
    expect(toolkitOptions).toBeDefined();
    // @ts-ignore: Object is possibly 'undefined'
    expect(toolkitOptions.event).toEqual('push');
  });

  it('should invoke action', async () => {
    const tools: Toolkit = new Toolkit();

    await actionFunction(tools);

    expect(action).toHaveBeenCalledWith(tools);
  });
});
