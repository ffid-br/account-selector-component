# Account Selector Component

A React component library that provides an elegant account selection interface with support for grouped accounts.

## Features

- Interactive h2 element displaying the currently selected account name
- Modal with account selection dropdown supporting optgroups
- Support for nested account structures with proper grouping
- Event emission of selected account ID when user makes a selection
- Styled with Tailwind CSS for a modern look and feel
- TypeScript support with proper typing for the account data structure

## Installation

```bash
npm install @ffid/account-selector-component
```

## Usage

```tsx
import React, { useState } from 'react';
import { AccountSelector } from 'account-selector-component';
import type { AccountGroups } from 'account-selector-component';

// Your account data structure
const accounts: AccountGroups = {
  "FFID": [
    {
      "id": "account-id-1",
      "name": "FFID Main",
      "type": "sales",
      "support_type": "online",
      "support_name": "Support Name",
      "settings": {
        "domains": ["example.com"],
        "feeds": [],
        "plugins": [],
        "checkout": [],
        "success": [],
        "short_domain": "",
        "script": ""
      },
      "account_ownership_owner": "FFID"
    },
    // More accounts...
  ],
  // More account groups...
};

function YourComponent() {
  const [selectedAccountId, setSelectedAccountId] = useState<string | undefined>(undefined);

  const handleAccountSelect = (accountId: string) => {
    setSelectedAccountId(accountId);
    // Do something with the selected account ID
  };

  return (
    <AccountSelector 
      accounts={accounts}
      selectedAccountId={selectedAccountId}
      onAccountSelect={handleAccountSelect}
      className="your-custom-class" // Optional
    />
  );
}
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `accounts` | `AccountGroups` | An object where each key is a group name and the value is an array of account objects |
| `selectedAccountId` | `string \| undefined` | Optional ID of the initially selected account |
| `onAccountSelect` | `(accountId: string) => void` | Callback function that receives the selected account ID |
| `className` | `string` | Optional additional CSS classes to apply to the account selector |

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
```

## License

MIT