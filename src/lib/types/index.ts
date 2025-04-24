export interface AccountSettings {
  domains: string[];
  feeds: any[];
  plugins: string[];
  checkout: any[];
  success: any[];
  short_domain: string;
  script: string;
  [key: string]: any;
}

export interface Account {
  id: string;
  name: string;
  type: string;
  support_type: string;
  support_name: string;
  settings: AccountSettings;
  account_ownership_owner: string;
}

export interface AccountGroups {
  [key: string]: Account[];
}

export interface AccountSelectorProps {
  accounts: AccountGroups;
  selectedAccountId?: string;
  onAccountSelect: (accountId: string) => void;
  className?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}