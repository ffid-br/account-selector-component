import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AccountSelector from './AccountSelector';
import type { AccountGroups } from '../types';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const mockAccounts: AccountGroups = {
  'Company A': [
    {
      id: 'a1',
      name: 'Main Account',
      type: 'business',
      support_type: 'premium',
      support_name: 'John',
      settings: {
        domains: ['a.com'],
        feeds: [],
        plugins: [],
        checkout: [],
        success: [],
        short_domain: '',
        script: '',
      },
      account_ownership_owner: 'Company A',
    },
    {
      id: 'a2',
      name: 'Support Team',
      type: 'support',
      support_type: 'basic',
      support_name: 'Jane',
      settings: {
        domains: [],
        feeds: [],
        plugins: [],
        checkout: [],
        success: [],
        short_domain: '',
        script: '',
      },
      account_ownership_owner: 'Company A',
    },
  ],
  '': [
    {
      id: 'b1',
      name: 'Ungrouped Account',
      type: 'demo',
      support_type: 'basic',
      support_name: 'Support',
      settings: {
        domains: [],
        feeds: [],
        plugins: [],
        checkout: [],
        success: [],
        short_domain: '',
        script: '',
      },
      account_ownership_owner: '',
    },
  ],
  'Company B': [
    {
      id: 'c1',
      name: 'Company B Account',
      type: 'business',
      support_type: 'premium',
      support_name: 'Alice',
      settings: {
        domains: ['b.com'],
        feeds: [],
        plugins: [],
        checkout: [],
        success: [],
        short_domain: '',
        script: '',
      },
      account_ownership_owner: 'Company B',
    },
  ],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderSelector(props: Partial<Parameters<typeof AccountSelector>[0]> = {}) {
  const onAccountSelect = vi.fn();
  const utils = render(
    <AccountSelector
      accounts={mockAccounts}
      onAccountSelect={onAccountSelect}
      {...props}
    />
  );
  return { ...utils, onAccountSelect };
}

async function openModal(user: ReturnType<typeof userEvent.setup>) {
  const trigger = screen.getByRole('button', { name: /selecione a conta|main account/i });
  await user.click(trigger);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('AccountSelector', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  // ---- Rendering ----

  it('renders trigger with first account name when no selectedAccountId', () => {
    renderSelector();
    expect(screen.getByRole('button')).toHaveTextContent('Main Account');
  });

  it('renders trigger with selected account name', () => {
    renderSelector({ selectedAccountId: 'c1' });
    expect(screen.getByRole('button')).toHaveTextContent('Company B Account');
  });

  it('shows fallback text when accounts is empty', () => {
    renderSelector({ accounts: {} });
    expect(screen.getByRole('button')).toHaveTextContent('Selecione a conta');
  });

  it('shows keyboard shortcut badge', () => {
    renderSelector();
    expect(screen.getByText(/⌘K|Ctrl\+K/)).toBeInTheDocument();
  });

  // ---- Modal open / close ----

  it('opens modal on click', async () => {
    renderSelector();
    await openModal(user);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Buscar conta...')).toBeInTheDocument();
  });

  it('opens modal with Enter key', async () => {
    renderSelector();
    const trigger = screen.getByRole('button');
    trigger.focus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('opens modal with Space key', async () => {
    renderSelector();
    const trigger = screen.getByRole('button');
    trigger.focus();
    await user.keyboard(' ');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes modal on Escape', async () => {
    renderSelector();
    await openModal(user);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  // ---- Cmd+K shortcut ----

  it('toggles modal with Ctrl+K', async () => {
    renderSelector();
    // Open
    await user.keyboard('{Control>}k{/Control}');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    // Close
    await user.keyboard('{Control>}k{/Control}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  // ---- Autocomplete search ----

  it('filters accounts by name', async () => {
    renderSelector();
    await openModal(user);
    const input = screen.getByPlaceholderText('Buscar conta...');
    await user.type(input, 'Support');

    const listbox = screen.getByRole('listbox');
    expect(within(listbox).getByText('Support Team')).toBeInTheDocument();
    expect(within(listbox).queryByText('Main Account')).not.toBeInTheDocument();
    expect(within(listbox).queryByText('Company B Account')).not.toBeInTheDocument();
  });

  it('filters accounts by group name', async () => {
    renderSelector();
    await openModal(user);
    const input = screen.getByPlaceholderText('Buscar conta...');
    await user.type(input, 'Company B');

    const listbox = screen.getByRole('listbox');
    expect(within(listbox).getByText('Company B Account')).toBeInTheDocument();
    expect(within(listbox).queryByText('Main Account')).not.toBeInTheDocument();
  });

  it('shows empty state when search has no matches', async () => {
    renderSelector();
    await openModal(user);
    await user.type(screen.getByPlaceholderText('Buscar conta...'), 'xyznonexistent');
    expect(screen.getByText('Nenhuma conta encontrada')).toBeInTheDocument();
  });

  it('resets search when modal reopens', async () => {
    renderSelector();
    await openModal(user);
    await user.type(screen.getByPlaceholderText('Buscar conta...'), 'Support');
    await user.keyboard('{Escape}');
    await openModal(user);
    expect(screen.getByPlaceholderText('Buscar conta...')).toHaveValue('');
  });

  // ---- Keyboard navigation ----

  it('navigates down with ArrowDown and selects with Enter', async () => {
    const { onAccountSelect } = renderSelector();
    await openModal(user);

    // Focus the search input first
    const input = screen.getByPlaceholderText('Buscar conta...');
    await user.click(input);

    // First item is highlighted by default; move down to second
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');

    // Second account in flat list is "Support Team" (a2)
    expect(onAccountSelect).toHaveBeenLastCalledWith('a2');
  });

  it('wraps around when pressing ArrowDown at end', async () => {
    const { onAccountSelect } = renderSelector();
    await openModal(user);

    const input = screen.getByPlaceholderText('Buscar conta...');
    await user.click(input);

    // There are 4 accounts total; press down 4 times to wrap to first
    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}');
    await user.keyboard('{Enter}');

    expect(onAccountSelect).toHaveBeenLastCalledWith('a1');
  });

  it('navigates up with ArrowUp (wraps to last)', async () => {
    const { onAccountSelect } = renderSelector();
    await openModal(user);

    const input = screen.getByPlaceholderText('Buscar conta...');
    await user.click(input);

    // From index 0, ArrowUp wraps to last
    await user.keyboard('{ArrowUp}');
    await user.keyboard('{Enter}');

    expect(onAccountSelect).toHaveBeenLastCalledWith('c1');
  });

  // ---- Account selection ----

  it('selects account on click and closes modal', async () => {
    const { onAccountSelect } = renderSelector();
    await openModal(user);

    await user.click(screen.getByText('Company B Account'));

    expect(onAccountSelect).toHaveBeenCalledWith('c1');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveTextContent('Company B Account');
  });

  it('shows checkmark on selected account', async () => {
    renderSelector({ selectedAccountId: 'a1' });
    await openModal(user);

    const option = screen.getByRole('option', { name: /Main Account/ });
    // Check icon is an SVG from lucide-react
    expect(option.querySelector('svg')).toBeInTheDocument();
  });

  // ---- Grouped display ----

  it('renders group headers for named groups', async () => {
    renderSelector();
    await openModal(user);
    expect(screen.getByText('Company A')).toBeInTheDocument();
    expect(screen.getByText('Company B')).toBeInTheDocument();
  });

  it('does not render group header for empty-string group', async () => {
    renderSelector();
    await openModal(user);
    // Ungrouped Account should be present but with no group label
    expect(screen.getByText('Ungrouped Account')).toBeInTheDocument();
    // The listbox should only have 2 group headers (Company A, Company B)
    const listbox = screen.getByRole('listbox');
    const headers = listbox.querySelectorAll('.sticky');
    expect(headers).toHaveLength(2);
  });

  // ---- ARIA attributes ----

  it('has correct ARIA attributes on the combobox input', async () => {
    renderSelector();
    await openModal(user);

    const input = screen.getByRole('combobox');
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(input).toHaveAttribute('aria-controls', 'account-listbox');
    expect(input).toHaveAttribute('aria-autocomplete', 'list');
  });

  it('marks selected option with aria-selected', async () => {
    renderSelector({ selectedAccountId: 'a1' });
    await openModal(user);

    const selected = screen.getByRole('option', { name: /Main Account/ });
    expect(selected).toHaveAttribute('aria-selected', 'true');

    const other = screen.getByRole('option', { name: /Support Team/ });
    expect(other).toHaveAttribute('aria-selected', 'false');
  });

  // ---- className prop ----

  it('applies custom className to trigger', () => {
    renderSelector({ className: 'my-custom-class' });
    expect(screen.getByRole('button')).toHaveClass('my-custom-class');
  });

  // ---- Keyboard hints ----

  it('shows keyboard navigation hints inside modal', async () => {
    renderSelector();
    await openModal(user);
    expect(screen.getByText('navegar')).toBeInTheDocument();
    expect(screen.getByText('selecionar')).toBeInTheDocument();
    expect(screen.getByText('fechar')).toBeInTheDocument();
  });
});
