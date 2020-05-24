import * as React from 'react';
import { HexCoordinates, PlayerId, TileContent, TileId } from '../domain';
import { tileDragEmitter } from '../game-context';
import { handleDrop } from '../handlers';
import isEqual = require('react-fast-compare');

const defaultProps = {
    tileDragEmitter: tileDragEmitter,
};

type Props = {
    id: TileId;
    content: TileContent;
    playerId: PlayerId;
    availableMoves: HexCoordinates[];
} & typeof defaultProps;

const getPlayerColor = (playerId: PlayerId) => {
    const playerColors = ['#85dcbc', '#f64c72'];
    return playerColors[playerId] || 'red';
};

function Tile(props: Props) {
    const { id, availableMoves, content, playerId, tileDragEmitter } = props;

    function handleDragStart() {
        tileDragEmitter.emit({ type: 'start', tileId: id, tileMoves: availableMoves });
    }

    function handleDragEnd() {
        tileDragEmitter.emit({ type: 'end', tileId: id, tileMoves: availableMoves });
    }

    const attributes = {
        title: content,
        style: { '--color': getPlayerColor(playerId) },
        className: 'hex tile',
        draggable: !!availableMoves.length,
        onDragStart: handleDragStart,
        onDragEnd: handleDragEnd,
        onDrop: handleDrop,
    };

    return (
        <div {...attributes}>
            <span>{content}</span>
        </div>
    );
}

Tile.displayName = 'Tile';
Tile.defaultProps = defaultProps;

const TileMemo = React.memo(Tile, isEqual);

export default TileMemo;
