// workflowstep.stories.tsx
import { WorkflowStep } from './WorkflowStep';
import type { Story } from '@ladle/react';

export const Default: Story<any> = (args) => <WorkflowStep {...args} />;

Default.args = {
  step: {
    id: 'step-1',
    step_number: 1,
    type: 'function',
    function_name: 'send_email',
    function_description: 'Send an email to the specified recipient with the provided subject and message.',
    browser_required: false,
    run_calls: [
      {
        input: {
          recipient: 'user@example.com',
          subject: 'Welcome!',
          message: 'Thank you for signing up. Let us know if you have any questions.',
        },
        output: {
          status: 'success',
          message_id: 'abc123',
        },
      },
    ],
    active: true,
    disabled: false,
  },
  browserEvents: [],
  autoOpen: false,
  hasChildren: false,
  isUserInputStep: false,
  compact: false,
  uniformWidth: false,
  hasChanged: false,
};

Default.argTypes = {
  autoOpen: { control: { type: 'boolean' } },
  hasChildren: { control: { type: 'boolean' } },
  isUserInputStep: { control: { type: 'boolean' } },
  compact: { control: { type: 'boolean' } },
  uniformWidth: { control: { type: 'boolean' } },
  hasChanged: { control: { type: 'boolean' } },
  chatId: { control: { type: 'text' } },
};
