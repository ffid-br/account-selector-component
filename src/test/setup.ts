import '@testing-library/jest-dom/vitest';

// Ensure modal-root exists for portal rendering
const modalRoot = document.createElement('div');
modalRoot.id = 'modal-root';
document.body.appendChild(modalRoot);

// jsdom doesn't implement scrollIntoView
Element.prototype.scrollIntoView = () => {};
