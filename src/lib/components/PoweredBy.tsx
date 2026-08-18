import React from 'react';
import { twMerge } from 'tailwind-merge';
import { WORDMARK_LIGHT, WORDMARK_DARK } from './wordmark';

export interface PoweredByProps {
  /** Sidebar recolhida: esconde o texto e reduz o wordmark. */
  collapsed?: boolean;
  className?: string;
}

/**
 * PoweredBy — assinatura "Powered by Tailor.ia" do rodapé da sidebar.
 *
 * Existe aqui, e não em cada app, porque a assinatura já tinha divergido: genius exibia
 * "Powered by FFID" depois do rebrand e pilot não tinha a variante do dark. O wordmark vem
 * embutido (`wordmark.ts`) — depender de `/tailor-logo.png` no `public/` de cada projeto era
 * justamente o que quebrava, já que os nomes dos arquivos não batem entre os apps.
 *
 * Dark mode segue o mesmo mecanismo do AccountSelector: classe `dark` num ancestral.
 *
 * ponytail: wordmark em PNG base64 (~64KB no bundle). Vira SVG inline com `currentColor` —
 * um arquivo só, nítido em qualquer DPI — assim que o brand entregar o vetor.
 *
 * @example
 * ```tsx
 * <PoweredBy collapsed={sidebarCollapsed} />
 * ```
 */
const PoweredBy: React.FC<PoweredByProps> = ({ collapsed = false, className = '' }) => (
  <div className={twMerge('ffid-powered-by', className)}>
    <p className="flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-500">
      {!collapsed && <span>Powered by</span>}
      <img
        src={WORDMARK_LIGHT}
        alt="Tailor.ia"
        className={twMerge('w-auto dark:hidden', collapsed ? 'h-5' : 'h-6')}
      />
      <img
        src={WORDMARK_DARK}
        alt="Tailor.ia"
        className={twMerge('w-auto hidden dark:block', collapsed ? 'h-5' : 'h-6')}
      />
    </p>
  </div>
);

export default PoweredBy;
