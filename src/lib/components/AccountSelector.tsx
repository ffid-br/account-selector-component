import React, { useState, useEffect, useCallback } from 'react';
import { AccountSelectorProps, Account } from '../types';
import Modal from './Modal';
import { ChevronDown } from 'lucide-react';
import { twMerge } from "tailwind-merge";

const AccountSelector: React.FC<AccountSelectorProps> = ({ 
  accounts, 
  selectedAccountId, 
  onAccountSelect,
  className = ''
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  // Find the selected account from all groups
  const findAccountById = useCallback((id?: string): Account | null => {
    if (!id) return null;
    
    for (const group in accounts) {
      const found = accounts[group]?.find(account => account.id === id);
      if (found) return found;
    }
    
    return null;
  }, [accounts]);

  // Initialize selected account
  useEffect(() => {
    if (selectedAccountId) {
      const account = findAccountById(selectedAccountId);
      if (account) setSelectedAccount(account);
    } else if (Object.keys(accounts).length > 0) {
      // Default to first account in first group if no ID provided
      const firstGroup = Object.keys(accounts)[0];
      if (accounts[firstGroup]?.length > 0) {
        setSelectedAccount(accounts[firstGroup][0]);
        onAccountSelect(accounts[firstGroup][0].id);
      }
    }
  }, [selectedAccountId, accounts, findAccountById, onAccountSelect]);

  const handleAccountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newAccountId = e.target.value;
    const newAccount = findAccountById(newAccountId);
    
    if (newAccount) {
      setSelectedAccount(newAccount);
      onAccountSelect(newAccount.id);
    }
    
    setIsModalOpen(false);
  };
  const mergedClassName = twMerge(
    'ffid-account-selector flex cursor-pointer items-center gap-2 text-md font-semibold text-gray-800 hover:text-blue-600 transition-colors duration-200',
    className
  );
  
  return (
    <>
      <h2 
        onClick={() => setIsModalOpen(true)}
        className={mergedClassName}
        role="button"
        aria-haspopup="true"
        aria-expanded={isModalOpen}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsModalOpen(true);
          }
        }}
      >
        {selectedAccount ? selectedAccount.name : 'Selecione a conta'}
        <ChevronDown size={20} className="text-gray-500" />
      </h2>
      
      <Modal 
        isOpen={isModalOpen} 
        className="ffid-account-modal"
        onClose={() => setIsModalOpen(false)}
        title="Selecione a conta"
      >
        <div className="mt-2">
          <select
            className="w-full rounded-md border border-gray-300 bg-white dark:bg-gray-700 px-3 py-2 text-base text-dark-500 dark:text-white shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={selectedAccount?.id || ''}
            onChange={handleAccountChange}
            autoFocus
          >
            {Object.keys(accounts).map((groupName) => {
              const groupAccounts = accounts[groupName];
              
              // Skip empty groups
              if (!groupAccounts || groupAccounts.length === 0) return null;
              
              // If the group name is empty, don't use an optgroup
              if (groupName === "") {
                return groupAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ));
              }
              
              // Otherwise use an optgroup
              return (
                <optgroup key={groupName} label={groupName}>
                  {groupAccounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </optgroup>
              );
            })}
          </select>
        </div>
        
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            style={{ marginRight: '10px' }}
            className="rounded-md border border-gray-300 bg-white dark:bg-gray-700 dark:text-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={() => setIsModalOpen(false)}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={() => setIsModalOpen(false)}
          >
            Confirmar
          </button>
        </div>
      </Modal>
    </>
  );
};

export default AccountSelector;