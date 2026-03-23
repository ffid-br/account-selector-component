import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { AccountSelectorProps, Account } from '../types';
import Modal from './Modal';
import { ChevronDown, Search, Check } from 'lucide-react';
import { twMerge } from "tailwind-merge";

/**
 * AccountSelector — FFID account picker with searchable autocomplete.
 *
 * Opens a modal with a search input that filters accounts in real-time.
 * Supports keyboard navigation (arrows, Enter, Escape) and a global
 * `Cmd+K` (macOS) / `Ctrl+K` (Windows/Linux) shortcut to toggle.
 *
 * Dark mode is activated via the Tailwind `dark` class on a parent element
 * (e.g. `<html class="dark">`). All interactive states — focus rings,
 * highlights, hover, selected, group headers, kbd hints — adapt to dark mode
 * using the FFID brand palette (`ffid-*` tokens defined in tailwind.config).
 *
 * Uses the Inter font family (FFID brand) loaded via CSS.
 *
 * @example
 * ```tsx
 * <AccountSelector
 *   accounts={groupedAccounts}
 *   selectedAccountId={currentId}
 *   onAccountSelect={(id) => setCurrentId(id)}
 * />
 * ```
 */
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

  /** Look up an account by ID across all groups. */
  const findAccountById = useCallback((id?: string): Account | null => {
    if (!id) return null;
    for (const group in accounts) {
      const found = accounts[group]?.find(account => account.id === id);
      if (found) return found;
    }
    return null;
  }, [accounts]);

  // Sync selected account with prop / default to first account
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

  // Global keyboard shortcut: Cmd+K / Ctrl+K
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

  // Auto-focus search when modal opens
  useEffect(() => {
    if (isModalOpen) {
      setSearchQuery('');
      setHighlightedIndex(0);
      requestAnimationFrame(() => {
        searchInputRef.current?.focus();
      });
    }
  }, [isModalOpen]);

  // ---------------------------------------------------------------------------
  // Filtered + flattened accounts
  // ---------------------------------------------------------------------------

  /** Groups filtered by the current search query (matches name, group, or id). */
  const filteredGroups = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return accounts;

    const result: Record<string, Account[]> = {};
    for (const group in accounts) {
      const filtered = accounts[group]?.filter(account => {
        const name = account.name.toLowerCase();
        const groupName = group.toLowerCase();
        const id = account.id.toLowerCase();
        return name.includes(query) || groupName.includes(query) || id.includes(query);
      });
      if (filtered && filtered.length > 0) {
        result[group] = filtered;
      }
    }
    return result;
  }, [accounts, searchQuery]);

  /** Flat ordered list + O(1) index lookup map. */
  const { flatAccounts, indexMap } = useMemo(() => {
    const list: Account[] = [];
    const map = new Map<string, number>();
    for (const group in filteredGroups) {
      const groupAccounts = filteredGroups[group];
      if (groupAccounts) {
        for (const acc of groupAccounts) {
          map.set(acc.id, list.length);
          list.push(acc);
        }
      }
    }
    return { flatAccounts: list, indexMap: map };
  }, [filteredGroups]);

  // Clamp highlighted index when list shrinks
  useEffect(() => {
    if (highlightedIndex >= flatAccounts.length) {
      setHighlightedIndex(Math.max(0, flatAccounts.length - 1));
    }
  }, [flatAccounts.length, highlightedIndex]);

  // Keep highlighted row visible inside the scrollable list
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector('[data-highlighted="true"]');
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [highlightedIndex]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const selectAccount = useCallback((account: Account) => {
    setSelectedAccount(account);
    onAccountSelect(account.id);
    setIsModalOpen(false);
  }, [onAccountSelect]);

  /** Keyboard navigation inside the search input. */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => (prev < flatAccounts.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : flatAccounts.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (flatAccounts[highlightedIndex]) selectAccount(flatAccounts[highlightedIndex]);
        break;
      case 'Escape':
        e.preventDefault();
        setIsModalOpen(false);
        break;
    }
  };

  // ---------------------------------------------------------------------------
  // Derived values
  // ---------------------------------------------------------------------------

  const mergedClassName = twMerge(
    'ffid-account-selector flex cursor-pointer items-center gap-2 text-md font-semibold',
    'text-gray-800 dark:text-gray-100',
    'hover:text-ffid-600 dark:hover:text-ffid-400',
    'transition-colors duration-200',
    className
  );

  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
  const shortcutLabel = isMac ? '⌘K' : 'Ctrl+K';

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
      {/* Trigger button */}
      <h2
        onClick={() => setIsModalOpen(true)}
        className={mergedClassName}
        role="button"
        aria-haspopup="dialog"
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
        <ChevronDown size={20} className="text-gray-500 dark:text-gray-400" />
      </h2>

      {/* Selector modal */}
      <Modal
        isOpen={isModalOpen}
        className="ffid-account-modal"
        onClose={() => setIsModalOpen(false)}
        title="Selecione a conta"
      >
        {/* Search input */}
        <div className="relative mt-2">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
          />
          <input
            ref={searchInputRef}
            type="text"
            className={twMerge(
              'w-full rounded-md border py-2 pl-9 pr-3 text-sm shadow-sm',
              'border-gray-300 bg-white text-gray-900 placeholder:text-gray-400',
              'dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400',
              'focus:border-ffid-500 focus:outline-none focus:ring-1 focus:ring-ffid-500',
              'dark:focus:border-ffid-400 dark:focus:ring-ffid-400'
            )}
            placeholder="Buscar conta..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setHighlightedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            aria-label="Buscar conta"
            aria-activedescendant={
              flatAccounts[highlightedIndex]
                ? `account-option-${flatAccounts[highlightedIndex].id}`
                : undefined
            }
            role="combobox"
            aria-expanded={true}
            aria-controls="account-listbox"
            aria-autocomplete="list"
          />
        </div>

        {/* Account listbox */}
        <div
          ref={listRef}
          id="account-listbox"
          role="listbox"
          className="mt-2 max-h-[50vh] sm:max-h-80 overflow-y-auto rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800"
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
                  {/* Group header (sticky) */}
                  {groupName && (
                    <div className="sticky top-0 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                      {groupName}
                    </div>
                  )}

                  {/* Account rows */}
                  {groupAccounts.map((account) => {
                    const flatIndex = indexMap.get(account.id) ?? 0;
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
                          'flex cursor-pointer items-center justify-between px-3 py-2.5 text-sm transition-colors border-l-2',
                          isHighlighted
                            ? 'bg-ffid-500/15 border-l-ffid-500 text-ffid-900 dark:bg-ffid-400/20 dark:border-l-ffid-400 dark:text-white font-medium'
                            : 'border-l-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/60',
                          isSelected && !isHighlighted && 'bg-ffid-50 border-l-ffid-400 text-ffid-700 font-medium dark:bg-ffid-950/40 dark:border-l-ffid-500 dark:text-ffid-300'
                        )}
                        onClick={() => selectAccount(account)}
                        onMouseEnter={() => setHighlightedIndex(flatIndex)}
                      >
                        <span className="truncate">{account.name}</span>
                        {isSelected && (
                          <Check size={16} className="ml-2 shrink-0 text-ffid-600 dark:text-ffid-400" />
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Keyboard hints — hidden on touch devices, visible on desktop */}
        <div className="mt-3 hidden sm:flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex gap-3">
            <span>
              <kbd className="rounded border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 px-1 py-0.5 text-[10px] text-gray-600 dark:text-gray-300">↑↓</kbd>{' '}
              navegar
            </span>
            <span>
              <kbd className="rounded border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 px-1 py-0.5 text-[10px] text-gray-600 dark:text-gray-300">↵</kbd>{' '}
              selecionar
            </span>
            <span>
              <kbd className="rounded border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 px-1 py-0.5 text-[10px] text-gray-600 dark:text-gray-300">esc</kbd>{' '}
              fechar
            </span>
          </div>
          <kbd className="rounded border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 text-[10px] text-gray-600 dark:text-gray-300">
            {shortcutLabel}
          </kbd>
        </div>
      </Modal>
    </>
  );
};

export default AccountSelector;
