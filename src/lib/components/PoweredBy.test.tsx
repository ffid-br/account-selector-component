import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PoweredBy from './PoweredBy';

describe('PoweredBy', () => {
  it('mostra o texto e as duas variantes do wordmark quando expandido', () => {
    render(<PoweredBy />);

    expect(screen.getByText('Powered by')).toBeInTheDocument();

    const logos = screen.getAllByAltText('Tailor.ia');
    expect(logos).toHaveLength(2);
    expect(logos[0].className).toContain('dark:hidden');
    expect(logos[1].className).toContain('dark:block');
  });

  it('esconde o texto quando recolhido, mantendo o wordmark', () => {
    render(<PoweredBy collapsed />);

    expect(screen.queryByText('Powered by')).not.toBeInTheDocument();
    expect(screen.getAllByAltText('Tailor.ia')).toHaveLength(2);
  });

  it('embute o wordmark, sem depender de arquivo no public/ do consumidor', () => {
    render(<PoweredBy />);

    for (const logo of screen.getAllByAltText('Tailor.ia')) {
      expect(logo.getAttribute('src')).toMatch(/^data:image\//);
    }
  });
});
