import { FunctionComponent, h } from 'preact';
import { PlayerId, Players } from '../domain';
import GameTile from './GameTile';
import Player from './Player';

const Players: FunctionComponent<{ players: Players; currentPlayer: PlayerId }> = (props) => {
  const { players, currentPlayer } = props;
  return (
    <aside className="players">
      {players.map((player) => (
        <Player name={player.name} id={player.id} currentPlayer={currentPlayer} hide={!!player.tiles.length}>
          {player.tiles.map((tile) => (
            <GameTile key={tile.id} {...tile} />
          ))}
        </Player>
      ))}
    </aside>
  );
};

Players.displayName = 'Player List';
export default Players;
