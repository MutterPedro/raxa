import 'reflect-metadata';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import User from '../../src/core/entities/User';
import Button from '../../src/components/common/Button';
import Field from '../../src/components/common/Field';
import Card from '../../src/components/common/Card';
import Skeleton from '../../src/components/common/Skeleton';
import EmptyState from '../../src/components/common/EmptyState';
import Avatar from '../../src/components/common/Avatar';
import LoadingGauge from '../../src/components/common/LoadingGuage';
import SelectField, { CreatableSelectField } from '../../src/components/common/SelectField';

describe('Button', () => {
  it('renders label #unit', () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('click fires handler #unit', () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    fireEvent.click(screen.getByRole('button', { name: 'Click me' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('disabled prevents click #unit', () => {
    const onClick = jest.fn();
    render(
      <Button disabled onClick={onClick}>
        Disabled
      </Button>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Disabled' }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('each variant renders #unit', () => {
    const { getByRole } = render(
      <>
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
      </>,
    );
    expect(getByRole('button', { name: 'Primary' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Secondary' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Ghost' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Danger' })).toBeInTheDocument();
  });

  it('custom data-testid lands on the button element #unit', () => {
    render(<Button data-testid="my-btn">Label</Button>);
    expect(screen.getByTestId('my-btn')).toBeInTheDocument();
  });
});

describe('Field', () => {
  it('getByLabelText finds the input #unit', () => {
    render(<Field label="Name" />);
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
  });

  it('generated id wires label to input #unit', () => {
    const { container } = render(<Field label="Email" />);
    const input = container.querySelector('input') as HTMLInputElement;
    const label = container.querySelector('label') as HTMLLabelElement;
    expect(input?.id).toBeTruthy();
    expect(label?.htmlFor).toBe(input?.id);
  });

  it('explicit id is respected #unit', () => {
    render(<Field label="Phone" id="phone-input" />);
    expect(screen.getByLabelText('Phone')).toHaveAttribute('id', 'phone-input');
  });

  it('hint is visible #unit', () => {
    render(<Field label="Name" hint="Your full name" />);
    expect(screen.getByText('Your full name')).toBeInTheDocument();
  });

  it('error text visible and aria-invalid is true #unit', () => {
    render(<Field label="Email" error="Invalid email" />);
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
  });

  it('aria-describedby includes hint and error ids when both present #unit', () => {
    const { container } = render(<Field label="Name" hint="Your full name" error="Required" />);
    const input = container.querySelector('input') as HTMLInputElement;
    const describedBy = input?.getAttribute('aria-describedby')?.split(' ') ?? [];
    expect(describedBy.length).toBeGreaterThanOrEqual(2);
  });
});

describe('SelectField', () => {
  const options = [
    { value: '1', label: 'Ana' },
    { value: '2', label: 'Bruno' },
  ];

  it('label is wired to the input through inputId #unit', () => {
    render(
      <SelectField label="Quem pagou" inputId="payer-input" options={options} value={null} onChange={jest.fn()} />,
    );
    expect(screen.getByLabelText('Quem pagou')).toHaveAttribute('id', 'payer-input');
  });

  it('creatable renders every selected option as a chip #unit', () => {
    render(
      <CreatableSelectField
        label="Com quem?"
        inputId="participant-input"
        options={options}
        value={options}
        onChange={jest.fn()}
        onCreateOption={jest.fn()}
      />,
    );
    expect(screen.getByText('Ana')).toBeInTheDocument();
    expect(screen.getByText('Bruno')).toBeInTheDocument();
  });

  it('keyboard selects an option and reports it #unit', () => {
    const onChange = jest.fn();
    render(<SelectField label="Quem pagou" inputId="payer-input" options={options} value={null} onChange={onChange} />);
    const input = screen.getByLabelText('Quem pagou');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ value: '1', label: 'Ana' }),
      expect.objectContaining({ action: 'select-option' }),
    );
  });

  it('creatable variant reports typed text through onCreateOption #unit', () => {
    const onCreateOption = jest.fn();
    render(
      <CreatableSelectField
        label="Com quem?"
        inputId="participant-input"
        options={options}
        value={[]}
        onChange={jest.fn()}
        onCreateOption={onCreateOption}
      />,
    );
    const input = screen.getByLabelText('Com quem?');
    fireEvent.change(input, { target: { value: 'Carla' } });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onCreateOption).toHaveBeenCalledWith('Carla');
  });

  it('creatable create row defaults to Portuguese copy #unit', () => {
    render(
      <CreatableSelectField
        label="Com quem?"
        inputId="participant-input"
        options={options}
        value={[]}
        onChange={jest.fn()}
        onCreateOption={jest.fn()}
      />,
    );
    fireEvent.change(screen.getByLabelText('Com quem?'), { target: { value: 'Carla' } });
    expect(screen.getByText('Adicionar "Carla"')).toBeInTheDocument();
  });
});

describe('Card', () => {
  it('renders children #unit', () => {
    render(
      <Card>
        <span>Child content</span>
      </Card>,
    );
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });
});

describe('Skeleton', () => {
  it('renders and is aria-hidden #unit', () => {
    const { container } = render(<Skeleton />);
    const el = container.firstChild as HTMLElement;
    expect(el).toBeInTheDocument();
    expect(el).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('EmptyState', () => {
  it('title renders #unit', () => {
    render(<EmptyState title="No bills yet" />);
    expect(screen.getByText('No bills yet')).toBeInTheDocument();
  });

  it('hint renders #unit', () => {
    render(<EmptyState title="No bills" hint="Create your first bill to get started" />);
    expect(screen.getByText('Create your first bill to get started')).toBeInTheDocument();
  });

  it('action renders #unit', () => {
    render(<EmptyState title="No bills" action={<button type="button">Create Bill</button>} />);
    expect(screen.getByRole('button', { name: 'Create Bill' })).toBeInTheDocument();
  });
});

describe('Avatar', () => {
  it('initials render #unit', () => {
    const user = new User();
    user.name = 'Alice';
    render(<Avatar user={user} />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });
});

describe('LoadingGauge', () => {
  it('role="status" for accessibility #unit', () => {
    const { container } = render(<LoadingGauge />);
    expect(container.querySelector('[role="status"]')).toBeInTheDocument();
  });

  it('accessible name Carregando… #unit', () => {
    const { container } = render(<LoadingGauge />);
    expect(container.textContent).toContain('Carregando');
  });
});
