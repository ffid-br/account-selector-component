# Account Selector Component

An elegant, accessible React account-selection interface with searchable autocomplete, keyboard shortcuts, and full dark-mode support — built with the FFID brand palette.

## Features

- **Searchable autocomplete** — real-time filtering by account name, group, or ID
- **Keyboard shortcut** — `⌘K` (macOS) / `Ctrl+K` (Windows / Linux) to toggle the selector
- **Full keyboard navigation** — `↑↓` to navigate, `Enter` to select, `Escape` to close
- **Grouped accounts** — accounts displayed under sticky group headers with proper `optgroup`-style grouping
- **Dark mode** — complete dark-mode support via Tailwind's `dark` class strategy
- **FFID brand palette** — custom `ffid-*` color tokens in Tailwind config for consistent brand styling
- **Accessible** — ARIA combobox / listbox pattern, `role="dialog"`, `aria-selected`, `aria-activedescendant`
- **TypeScript** — fully typed props, accounts, and settings interfaces
- **Lightweight** — only `lucide-react` and `tailwind-merge` as runtime dependencies

## Installation

```bash
npm install @ffid-br/account-selector-component
```

## Quick start

```tsx
import { useState } from 'react';
import { AccountSelector } from '@ffid-br/account-selector-component';
import '@ffid-br/account-selector-component/dist/style.css';
import type { AccountGroups } from '@ffid-br/account-selector-component';

const accounts: AccountGroups = {
  'FFID': [
    {
      id: 'acc-1',
      name: 'FFID Main',
      type: 'sales',
      support_type: 'online',
      support_name: 'Support',
      settings: {
        domains: ['example.com'],
        feeds: [],
        plugins: [],
        checkout: [],
        success: [],
        short_domain: '',
        script: '',
      },
      account_ownership_owner: 'FFID',
    },
  ],
  'Partner': [
    {
      id: 'acc-2',
      name: 'Partner Store',
      type: 'business',
      support_type: 'premium',
      support_name: 'Alice',
      settings: {
        domains: ['partner.com'],
        feeds: [],
        plugins: ['analytics'],
        checkout: [],
        success: [],
        short_domain: '',
        script: '',
      },
      account_ownership_owner: 'Partner',
    },
  ],
};

function App() {
  const [selectedId, setSelectedId] = useState<string | undefined>();

  return (
    <AccountSelector
      accounts={accounts}
      selectedAccountId={selectedId}
      onAccountSelect={(id) => setSelectedId(id)}
    />
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `accounts` | `AccountGroups` | Yes | Object where each key is a group name and the value is an array of `Account` objects. Use `""` as the key for ungrouped accounts. |
| `selectedAccountId` | `string \| undefined` | No | ID of the currently selected account. When omitted the first account is auto-selected. |
| `onAccountSelect` | `(accountId: string) => void` | Yes | Callback fired when the user selects an account. Receives the account `id`. |
| `className` | `string` | No | Additional CSS classes merged onto the trigger element via `tailwind-merge`. |

## Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘K` / `Ctrl+K` | Toggle the selector modal (global) |
| `↑` `↓` | Navigate the account list |
| `Enter` | Select the highlighted account |
| `Escape` | Close the modal |
| `Space` / `Enter` | Open the modal (when the trigger is focused) |

## Dark mode

The component uses Tailwind's **`class`** dark-mode strategy. Add the `dark` class to a parent element (typically `<html>` or `<body>`) to activate dark mode:

```html
<html class="dark">
  <!-- all AccountSelector elements will render in dark mode -->
</html>
```

Every interactive state — focus rings, highlights, hover backgrounds, group headers, keyboard-hint badges, and the scrollbar — adapts automatically.

## FFID brand palette

The Tailwind config ships with `ffid-*` color tokens (50–950) used for primary interactive states (focus rings, highlights, checkmarks). You can override or extend these in your own `tailwind.config.js`:

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        ffid: {
          500: '#2f5fff', // primary
          600: '#1a3ff5', // hover / active
          // ... override any shade you need
        },
      },
    },
  },
};
```

## Types

```typescript
interface AccountSettings {
  domains: string[];
  feeds: any[];
  plugins: string[];
  checkout: any[];
  success: any[];
  short_domain: string;
  script: string;
  [key: string]: any;
}

interface Account {
  id: string;
  name: string;
  type: string;
  support_type: string;
  support_name: string;
  settings: AccountSettings;
  account_ownership_owner: string;
}

interface AccountGroups {
  [key: string]: Account[];
}

interface AccountSelectorProps {
  accounts: AccountGroups;
  selectedAccountId?: string;
  onAccountSelect: (accountId: string) => void;
  className?: string;
}
```

## Running tests

```bash
npm test          # single run
npm run test:watch # watch mode
```

## License

MIT
