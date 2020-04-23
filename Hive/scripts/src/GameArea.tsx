import * as React from 'react';
import { IEngine } from './domain';
import { Context, IGameContext, useGameContext } from './GameContext';
import { Grid } from './Grid';
import { PlayerList } from './PlayerList';
import { gridContainer, playerContainer, root } from './styles/layout';

export interface IProps {
  engine: IEngine;
}

type ContainerRef = React.RefObject<HTMLDivElement>;

const useContainerSize = ({ setSize }: IGameContext): ContainerRef => {
  const refContainer = React.useRef<HTMLDivElement>(null);
  const [width, setWidth] = React.useState(0);
  const [height, setHeight] = React.useState(0);

  const updateSizes = React.useCallback(() => {
    if (!refContainer.current) {
      return;
    }
    let changed = false;
    const { clientHeight, clientWidth } = refContainer.current;
    if (width !== clientWidth) {
      changed = true;
      setWidth(clientWidth);
    }
    if (height !== clientHeight) {
      changed = true;
      setHeight(clientHeight);
    }
    if (changed) {
      setSize(clientWidth, clientHeight);
    }
  }, []);

  React.useLayoutEffect(updateSizes, [
    refContainer.current ? refContainer.current.clientWidth : Math.random(),
    refContainer.current ? refContainer.current.clientHeight : Math.random(),
  ]);

  React.useEffect(() => {
    window.addEventListener('resize', updateSizes);
    return () => window.removeEventListener('resize', updateSizes);
  }, []);

  return refContainer;
};

export const GameArea: React.StatelessComponent<IProps> = ({ engine }) => {
  const [loading, gameContext] = useGameContext(engine);

  const ref = useContainerSize(gameContext);

  if (loading) {
    return <h1>loading</h1>;
  }

  return (
    <div className={root}>
      <Context.Provider value={gameContext}>
        <div className={playerContainer}>
          <PlayerList />
        </div>
        <div ref={ref} className={gridContainer}>
          <Grid />
        </div>
      </Context.Provider>
    </div>
  );
};

GameArea.displayName = 'GameArea';
