import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Button } from '../Button';

describe('Button Component', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('h-10', 'px-4', 'text-base'); // Default size: md
    expect(button).toHaveClass('bg-theme', 'text-white'); // Default variant: primary
  });

  it('renders with different variants', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-theme', 'text-white');

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-secondary', 'text-white');

    rerender(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-bg', 'text-theme', 'border');

    rerender(<Button variant="danger">Danger</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-attention', 'text-white');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-8', 'px-3', 'text-sm');

    rerender(<Button size="md">Medium</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-10', 'px-4', 'text-base');

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-12', 'px-5', 'text-lg');
  });

  it('handles iconOnly prop correctly', () => {
    render(<Button iconOnly>🎯</Button>);
    const button = screen.getByRole('button');
    
    expect(button).toHaveClass('!px-0', 'w-10');
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    
    render(<Button onClick={handleClick}>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    
    await user.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('can be disabled', () => {
    const handleClick = jest.fn();
    render(<Button disabled onClick={handleClick}>Disabled</Button>);
    
    const button = screen.getByRole('button', { name: /disabled/i });
    expect(button).toBeDisabled();
    
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom</Button>);
    const button = screen.getByRole('button', { name: /custom/i });
    
    expect(button).toHaveClass('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Ref test</Button>);
    
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current?.textContent).toBe('Ref test');
  });

  it('passes through other HTML button props', () => {
    render(
      <Button 
        type="submit" 
        aria-label="Submit form"
        data-testid="submit-button"
      >
        Submit
      </Button>
    );
    
    const button = screen.getByRole('button', { name: /submit/i });
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toHaveAttribute('aria-label', 'Submit form');
    expect(button).toHaveAttribute('data-testid', 'submit-button');
  });

  it('has proper focus styles', () => {
    render(<Button>Focus test</Button>);
    const button = screen.getByRole('button', { name: /focus test/i });
    
    expect(button).toHaveClass('focus:outline-none', 'focus-visible:ring-2');
  });

  it('applies transition styles', () => {
    render(<Button>Transition test</Button>);
    const button = screen.getByRole('button', { name: /transition test/i });
    
    expect(button).toHaveClass('transition-all');
  });
});