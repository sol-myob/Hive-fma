import { deepEqual } from 'fast-equals';
import { FunctionComponent, h } from 'preact';
import { memo } from 'preact/compat';
import { PlayerId, Tile } from '../domain';
import { useTileDragEmitter } from '../emitters';
import { handleDrop } from '../handlers';

type Props = Tile;

const getPlayerColor = (playerId: PlayerId) => {
    const playerColors = ['#85dcbc', '#f64c72'];
    return playerColors[playerId] || 'red';
};

const TileFC: FunctionComponent<Props> = (props: Props) => {
    const { id, moves, creature, playerId } = props;
    const tileDragEmitter = useTileDragEmitter();

    function handleDragStart() {
        tileDragEmitter.emit({ type: 'start', tile: props });
    }

    function handleDragEnd() {
        tileDragEmitter.emit({ type: 'end', tile: props });
    }

    const attributes = {
        title: creature,
        style: { '--color': getPlayerColor(playerId) },
        class: 'hex tile',
        draggable: !!moves.length,
        ondragstart: handleDragStart,
        ondragend: handleDragEnd,
        ondrop: handleDrop,
    };

    return (
        <div {...attributes}>
            <span>{creature}</span>
        </div>
    );
};

TileFC.displayName = 'Tile';
export default memo(TileFC, deepEqual);