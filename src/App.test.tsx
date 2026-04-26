import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Login from './pages/Login';
import { BrowserRouter } from 'react-router-dom';

// Mock Firebase
vi.mock('../firebase', () => ({
  auth: {
    signOut: vi.fn(),
  },
  googleProvider: {},
  signInWithPopup: vi.fn(),
}));

describe('Login Component', () => {
  it('renders the app title', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    expect(screen.getByText(/KidTasker/i)).toBeDefined();
  });

  it('renders the sign in button', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    expect(screen.getByText(/Sign in with Google/i)).toBeDefined();
  });
});
