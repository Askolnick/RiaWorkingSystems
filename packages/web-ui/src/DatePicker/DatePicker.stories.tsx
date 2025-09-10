import type { Meta, StoryObj } from '@storybook/react';
import { DatePicker, DatePickerUtils } from './DatePicker';

const meta: Meta<typeof DatePicker> = {
  title: 'Form/DatePicker',
  component: DatePicker,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    showTime: {
      control: 'boolean',
    },
    error: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof DatePicker>;

export const Default: Story = {
  args: {
    size: 'md',
    placeholder: 'Select a date',
  },
};

export const WithLabel: Story = {
  args: {
    size: 'md',
    label: 'Appointment Date',
    placeholder: 'Select a date',
  },
};

export const WithHelperText: Story = {
  args: {
    size: 'md',
    label: 'Appointment Date',
    helperText: 'Choose a date for your appointment',
    placeholder: 'Select a date',
  },
};

export const WithTime: Story = {
  args: {
    size: 'md',
    label: 'Appointment DateTime',
    helperText: 'Choose a date and time for your appointment',
    showTime: true,
    placeholder: 'Select a date and time',
  },
};

export const WithError: Story = {
  args: {
    size: 'md',
    label: 'Appointment Date',
    helperText: 'This date is required',
    error: true,
    placeholder: 'Select a date',
  },
};

export const Disabled: Story = {
  args: {
    size: 'md',
    label: 'Appointment Date',
    helperText: 'Date selection is currently disabled',
    disabled: true,
    value: DatePickerUtils.today(),
  },
};

export const WithMinMax: Story = {
  args: {
    size: 'md',
    label: 'Appointment Date',
    helperText: 'Select a date within the next 30 days',
    min: DatePickerUtils.today(),
    max: DatePickerUtils.daysFromToday(30),
    placeholder: 'Select a date',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    label: 'Start Date',
    placeholder: 'Select a date',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    label: 'Event Date',
    placeholder: 'Select a date',
  },
};

export const Controlled: Story = {
  args: {
    size: 'md',
    label: 'Controlled Date',
    helperText: 'This is a controlled component',
    value: DatePickerUtils.today(),
  },
  render: (args) => {
    const [value, setValue] = React.useState(args.value);
    
    return (
      <DatePicker 
        {...args} 
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    );
  },
};