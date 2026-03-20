import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { AccountSelectorProps, Account } from '../types';
import Modal from './Modal';
import { ChevronDown, Search } from 'lucide-react';
import { twMerge } from "tailwind-merge";

const AccountSelector: React.FC<AccountSelectorProps> = ({
  accounts,
  selectedAccountId,
  onAccountSelect,
  className = ''
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const findAccountById = useCallback((id?: string): Account | null => {
    if (!id) return null;
    for (const group in accounts) {
      const found = accounts[group]?.find(account => account.id === id);
      if (found) return found;
    }
    return null;
  }, [accounts]);

  useEffect(() => {
    if (selectedAccountId) {
      const account = findAccountById(selectedAccountId);
      if (account) setSelectedAccount(account);
    } else if (Object.keys(accounts).length > 0) {
      const firstGroup = Object.keys(accounts)[0];
      if (accounts[firstGroup]?.length > 0) {
        setSelectedAccount(accounts[firstGroup][0]);
        onAccountSelect(accounts[firstGroup][0].id);
      }
    }
  }, [selectedAccountId, accounts, findAccountById, onAccountSelect]);

  // Cmd+K / Ctrl+K global shortcut
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        e.stopPropagation();
        setIsModalOpen(prev => !prev);
      }
    };
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Focus search input when modal opens, reset state
  useEffect(() => {
    if (isModalOpen) {
      setSearchQuery('');
      setHighlightedIndex(0);
      requestAnimationFrame(() => {
        searchInputRef.current?.focus();
      });
    }
  }, [isModalOpen]);

  // Filtered accounts based on search query
  const filteredGroups = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return accounts;

    const result: Record<string, Account[]> = {};
    for (const group in accounts) {
      const filtered = accounts[group]?.filter(account => {
        const name = account.name.toLowerCase();
        const groupName = group.toLowerCase();
        const id = account.id.toLowerCase();
        // Match against name, group, or id
        return name.includes(query) || groupName.includes(query) || id.includes(query);
      });
      if (filtered && filtered.length > 0) {
        result[group] = filtered;
      }
    }
    return result;
  }, [accounts, searchQuery]);

  // Flat list of filtered accounts for keyboard navigation
  const flatAccounts = useMemo(() => {
    const list: Account[] = [];
    for (const group in filteredGroups) {
      const groupAccounts = filteredGroups[group];
      if (groupAccounts) {
        list.push(...groupAccounts);
      }
    }
    return list;
  }, [filteredGroups]);

  // Keep highlighted index in bounds
  useEffect(() => {
    if (highlightedIndex >= flatAccounts.length) {
      setHighlightedIndex(Math.max(0, flatAccounts.length - 1));
    }
  }, [flatAccounts.length, highlightedIndex]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (!listRef.current) return;
    const highlighted = listRef.current.querySelector('[data-highlighted="true"]');
    if (highlighted) {
      highlighted.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex]);

  const selectAccount = useCallback((account: Account) => {
    setSelectedAccount(account);
    onAccountSelect(account.id);
    setIsModalOpen(false);
  }, [onAccountSelect]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < flatAccounts.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev > 0 ? prev - 1 : flatAccounts.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (flatAccounts[highlightedIndex]) {
          selectAccount(flatAccounts[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsModalOpen(false);
        break;
    }
  };

  const mergedClassName = twMerge(
    'ffid-account-selector flex cursor-pointer items-center gap-2 text-md font-semibold text-gray-800 hover:text-blue-600 transition-colors duration-200',
    className
  );

  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
  const shortcutLabel = isMac ? '⌘K' : 'Ctrl+K';

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
        <span className="ml-1 rounded border border-gray-300 bg-gray-100 px-1.5 py-0.5 text-xs font-normal text-gray-500">
          {shortcutLabel}
        </span>
      </h2>

      <Modal
        isOpen={isModalOpen}
        className="ffid-account-modal"
        onClose={() => setIsModalOpen(false)}
        title="Selecione a conta"
      >
        {/* Search input */}
        <div className="relative mt-2">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            className="w-full rounded-md border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-800 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400"
            placeholder="Buscar conta..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setHighlightedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            aria-label="Buscar conta"
            aria-activedescendant={flatAccounts[highlightedIndex] ? `account-option-${flatAccounts[highlightedIndex].id}` : undefined}
            role="combobox"
            aria-expanded={true}
            aria-controls="account-listbox"
            aria-autocomplete="list"
          />
        </div>

        {/* Account list */}
        <div
          ref={listRef}
          id="account-listbox"
          role="listbox"
          className="mt-2 max-h-64 overflow-y-auto rounded-md border border-gray-200 dark:border-gray-600"
        >
          {flatAccounts.length === 0 ? (
            <div className="px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
              Nenhuma conta encontrada
            </div>
          ) : (
            Object.keys(filteredGroups).map((groupName) => {
              const groupAccounts = filteredGroups[groupName];
              if (!groupAccounts || groupAccounts.length === 0) return null;

              return (
                <div key={groupName}>
                  {groupName && (
                    <div className="sticky top-0 bg-gray-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                      {groupName}
                    </div>
                  )}
                  {groupAccounts.map((account) => {
                    const flatIndex = flatAccounts.indexOf(account);
                    const isHighlighted = flatIndex === highlightedIndex;
                    const isSelected = account.id === selectedAccount?.id;

                    return (
                      <div
                        key={account.id}
                        id={`account-option-${account.id}`}
                        role="option"
                        aria-selected={isSelected}
                        data-highlighted={isHighlighted}
                        className={twMerge(
                          'flex cursor-pointer items-center justify-between px-3 py-2 text-sm transition-colors',
                          isHighlighted
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                            : 'text-gray-800 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700',
                          isSelected && !isHighlighted && 'bg-blue-50/50 dark:bg-blue-900/15'
                        )}
                        onClick={() => selectAccount(account)}
                        onMouseEnter={() => setHighlightedIndex(flatIndex)}
                      >
                        <span className="truncate">{account.name}</span>
                        {isSelected && (
                          <span className="ml-2 text-blue-600 dark:text-blue-400">✓</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
          <div className="flex gap-2">
            <span><kbd className="rounded border border-gray-300 bg-gray-100 px-1 py-0.5 text-[10px] dark:border-gray-600 dark:bg-gray-700">↑↓</kbd> navegar</span>
            <span><kbd className="rounded border border-gray-300 bg-gray-100 px-1 py-0.5 text-[10px] dark:border-gray-600 dark:bg-gray-700">↵</kbd> selecionar</span>
            <span><kbd className="rounded border border-gray-300 bg-gray-100 px-1 py-0.5 text-[10px] dark:border-gray-600 dark:bg-gray-700">esc</kbd> fechar</span>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AccountSelector;
