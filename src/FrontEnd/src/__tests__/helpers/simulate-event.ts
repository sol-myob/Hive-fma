import { fireEvent } from '@testing-library/preact';

export const simulateEvent = (target: HTMLElement, type: string): () => void => {
  const preventDefault = jest.fn();
  const e = new MouseEvent(type, { bubbles: true });
  Object.assign(e, { preventDefault });
  fireEvent(target, e);

  return preventDefault;
};
