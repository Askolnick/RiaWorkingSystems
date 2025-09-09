import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Primitives/Input',
  component: Input,
  argTypes: {
    prefix: { control: 'text' },
    suffix: { control: 'text' },
    placeholder: { control: 'text' },
    type: { control: 'text' },
  },
};
export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text',
  },
};

export const WithPrefixSuffix: Story = {
  args: {
    prefix: '🔍',
    suffix: <span>✔️</span>,
    placeholder: 'Search...',
  },
};