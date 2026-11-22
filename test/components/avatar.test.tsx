import 'reflect-metadata';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import Avatar from '../../src/components/common/Avatar';
import { createUser } from '../factories/entities';

describe('Avatar', () => {
  it('shows the profile picture when the user has one #unit', () => {
    render(<Avatar user={createUser(1, 'Ana', { photo_url: 'https://exemplo.com/a.png' })} />);

    expect(screen.getByTestId('avatar-picture')).toHaveAttribute('src', 'https://exemplo.com/a.png');
  });

  it('falls back to the initial when the picture fails to load (offline) #unit', () => {
    render(<Avatar user={createUser(1, 'Ana', { photo_url: 'https://exemplo.com/a.png' })} />);

    fireEvent.error(screen.getByTestId('avatar-picture'));

    expect(screen.queryByTestId('avatar-picture')).not.toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('shows the initial when the user has no picture #unit', () => {
    render(<Avatar user={createUser(1, 'Ana')} />);

    expect(screen.queryByTestId('avatar-picture')).not.toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
  });
});
