import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './Select';

const meta: Meta<typeof Select> = {
  title: 'Primitives/Select',
  component: Select,
  argTypes: {
    options: { control: 'object' },
    defaultValue: { control: 'text' },
  },
};
export default meta;
type Story = StoryObj<typeof Select>;

const sampleOptions = [
  { value: 'one', label: 'Option One' },
  { value: 'two', label: 'Option Two' },
  { value: 'three', label: 'Option Three' },
];

export const Default: Story = {
  args: {
    options: sampleOptions,
  },
};

export const WithDefault: Story = {
  args: {
    options: sampleOptions,
    defaultValue: 'two',
  },
};