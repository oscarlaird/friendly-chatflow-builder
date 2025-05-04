import { WorkflowDisplay } from './WorkflowDisplay';
import type { Story } from '@ladle/react';

export const DefaultWorkflow: Story<any> = (args) => <WorkflowDisplay {...args} />;

DefaultWorkflow.args = {
  steps: [
    // 1) Regular function step
    {
      id: 'step-1',
      step_number: 1,
      type: 'function',
      function_name: 'fetch_user_data',
      function_description: 'Fetch basic information about the user from the CRM.',
      run_calls: [
        {
          input: { userId: '42' },
          output: { name: 'Alice', email: 'alice@example.com' },
        },
      ],
      active: false,
      disabled: false,
    },

    // 2) Control-flow "if" step with two children
    {
      id: 'step-2',
      step_number: 2,
      type: 'if',
      control_description: 'Does the user have an email address?',
      child_count: 2, // must match the number of following child steps
      active: false,
    },

    // └─ 2a) Child #1 (inside the IF)
    {
      id: 'step-3',
      step_number: 3,
      type: 'function',
      function_name: 'send_welcome_email',
      function_description: 'Send a welcome email to the user.',
      browser_required: false,
      run_calls: [
        {
          input: {
            recipient: 'alice@example.com',
            subject: 'Welcome!',
            body: 'Thanks for signing up!',
          },
          output: { status: 'sent' },
        },
      ],
      active: false,
    },

    // └─ 2b) Child #2 (inside the IF)
    {
      id: 'step-4',
      step_number: 4,
      type: 'function',
      function_name: 'log_no_email',
      function_description: 'Log that no email address was found.',
      run_calls: [],
      active: false,
    },

    // 3) Final "done" step
    {
      id: 'step-5',
      step_number: 5,
      type: 'done',
    },
  ],

  browserEvents: {},      // none for now
  compact: false,
  autoActivateSteps: true, // highlights active steps
};

DefaultWorkflow.argTypes = {
  compact: { control: { type: 'boolean' } },
  autoActivateSteps: { control: { type: 'boolean' } },
}; 