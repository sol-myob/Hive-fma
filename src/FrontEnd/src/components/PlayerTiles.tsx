import { FunctionComponent, h } from 'preact';
import { Player } from '../domain';
import { deepEqual } from 'fast-equals';
import { memo } from 'preact/compat';
import Tile from './Tile';

type Props = Player;

const PlayerTiles: FunctionComponent<Props> = (props: Props) => {
  const { name, tiles, id } = props;
  const changePlayerUrl = `${window.location.pathname
    .split('/')
    .slice(0, 3)
    .join('/')}/${id}`;
  return tiles.length > 0 ? (
    <div className="player" title={name}>
      <a className="name" href={changePlayerUrl}>
        {name}
        <svg width="2vw" height="2vh" xmlns="http://www.w3.org/2000/svg">
          <use href="#share" />
        </svg>
      </a>
      <div className="tiles">
        {tiles.map((tile) => (
          <Tile key={tile.id} {...tile} />
        ))}
      </div>
    </div>
  ) : null;
};

PlayerTiles.displayName = 'Player Tiles';
export default memo(PlayerTiles, deepEqual);
