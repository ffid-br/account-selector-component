import React, { useState } from 'react';
import { AccountSelector } from './lib';
import type { AccountGroups } from './lib';

// Example accounts data structure
const mockAccounts: AccountGroups = {
  "Company A": [
    {
      "id": "a1b2c3d4",
      "name": "Main Account",
      "type": "business",
      "support_type": "premium",
      "support_name": "John Smith",
      "settings": {
        "domains": ["company-a.com"],
        "feeds": [],
        "plugins": ["analytics"],
        "checkout": [],
        "success": [],
        "short_domain": "",
        "script": ""
      },
      "account_ownership_owner": "Company A"
    },
    {
      "id": "b2c3d4e5",
      "name": "Support Team",
      "type": "support",
      "support_type": "premium",
      "support_name": "Jane Doe",
      "settings": {
        "domains": ["support.company-a.com"],
        "feeds": [],
        "plugins": [],
        "checkout": [],
        "success": [],
        "short_domain": "",
        "script": ""
      },
      "account_ownership_owner": "Company A"
    }
  ],
  "": [
    {
      "id": "c3d4e5f6",
      "name": "Test Account",
      "type": "demo",
      "support_type": "basic",
      "support_name": "Support Team",
      "settings": {
        "domains": ["test.com"],
        "feeds": [],
        "plugins": [],
        "checkout": [],
        "success": [],
        "short_domain": "",
        "script": ""
      },
      "account_ownership_owner": ""
    }
  ],
  "Company B": [
    {
      "id": "d4e5f6g7",
      "name": "Company B",
      "type": "business",
      "support_type": "premium",
      "support_name": "Alice Johnson",
      "settings": {
        "domains": ["company-b.com"],
        "feeds": [],
        "plugins": ["analytics", "marketing"],
        "checkout": [],
        "success": [],
        "short_domain": "",
        "script": ""
      },
      "account_ownership_owner": "Company B"
    }
  ]
};

function App() {
  const [selectedAccountId, setSelectedAccountId] = useState<string | undefined>(undefined);

  const handleAccountSelect = (accountId: string) => {
    setSelectedAccountId(accountId);
    console.log('Selected account ID:', accountId);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-2xl rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-2xl font-bold text-gray-800">Account Selector Demo</h1>
        
        <div className="mb-6 rounded-md bg-gray-50 p-4">
          <AccountSelector 
            accounts={mockAccounts} 
            selectedAccountId={selectedAccountId}
            onAccountSelect={handleAccountSelect} 
          />
        </div>
        
        {selectedAccountId && (
          <div className="mt-8 rounded-md bg-blue-50 p-4 text-blue-800">
            <p><strong>Selected Account ID:</strong> {selectedAccountId}</p>
          </div>
        )}
        
        <div className="mt-8">
          <h3 className="mb-2 text-lg font-semibold">Component Usage:</h3>
          <pre className="overflow-x-auto rounded-md bg-gray-800 p-4 text-sm text-white">
            {`import { AccountSelector } from '@ffid/account-selector-component';

// Your account data
const accounts = {
  "Company A": [ ... ],
  "Company B": [ ... ],
  "": [ ... ]
};

function YourComponent() {
  const [selectedAccountId, setSelectedAccountId] = useState();

  const handleAccountSelect = (accountId) => {
    setSelectedAccountId(accountId);
    // Do something with the selected account ID
  };

  return (
    <AccountSelector 
      accounts={accounts}
      selectedAccountId={selectedAccountId}
      onAccountSelect={handleAccountSelect}
    />
  );
}`}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default App;