import { render, RenderResult, screen } from '@testing-library/preact';
import { h } from 'preact';
import Player from '../components/Player';

describe('Player Tests', () => {
  const renderPlayer = (): [RenderResult, Element] => {
    const playerProps = { id: 1, name: 'Player 1', show: false, currentPlayer: 1, onHidden: jest.fn() };
    global.window.history.replaceState({}, global.document.title, `/game/33/1`);
    const container = render(<Player {...playerProps} />);
    const player = document.getElementsByClassName('player').item(0);
    return [container, player!];
  };

  test('has rendered with player name', () => {
    const [, player] = renderPlayer();
    expect(player.querySelector('.name')).toHaveTextContent('Player 1');
  });

  test('player is rendered with their tiles', () => {
    const [, player] = renderPlayer();
    expect(player.getElementsByClassName('tiles')).toHaveLength(1);
  });

  test(`player is hidden when last tile is played`, () => {
    jest.useFakeTimers();
    const [player] = renderPlayer();
    expect(screen.getByTitle('Player 1')).not.toHaveClass('hide');
    player.rerender(<Player onHidden={jest.fn()} id={1} name="P1" />);

    jest.advanceTimersByTime(100);
    player.rerender(<Player onHidden={jest.fn()} id={1} name="P1" />);
    expect(screen.getByTitle('P1')).toHaveClass('hide');
  });

  test('snapshot', () => {
    const [player] = renderPlayer();
    expect(player).toMatchSnapshot();
  });
});
