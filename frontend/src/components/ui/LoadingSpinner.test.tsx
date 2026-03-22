import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { LoadingSpinner, ButtonSpinner } from './LoadingSpinner';

describe('LoadingSpinner component', () => {
  it('renders with accessible role and label', () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders small size', () => {
    render(<LoadingSpinner size="small" />);
    const spinner = screen.getByRole('status');
    expect(spinner.className).toMatch(/w-4/);
  });

  it('renders large size', () => {
    render(<LoadingSpinner size="large" />);
    const spinner = screen.getByRole('status');
    expect(spinner.className).toMatch(/w-12/);
  });

  it('applies custom className to wrapper', () => {
    const { container } = render(<LoadingSpinner className="my-custom-class" />);
    expect(container.firstChild).toHaveClass('my-custom-class');
  });
});

describe('ButtonSpinner component', () => {
  it('renders with accessible role', () => {
    render(<ButtonSpinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
