import {Cell, HexCoordinates, Tile as TileType} from '../domain';
import {FunctionComponent, h} from 'preact';
import {TileEvents, useCellEventEmitter, useTileEventEmitter,} from '../emitters';
import {deepEqual} from 'fast-equals';
import {handleDragOver} from '../handlers';
import {memo} from 'preact/compat';
import {useEffect, useState} from 'preact/hooks';
import Tile from './Tile';

type Props = Cell;

const CellFC: FunctionComponent<Props> = (props: Props) => {
    const {tiles, coords} = props;
    const [tileEventEmitter, cellEventEmitter] = [
        useTileEventEmitter(),
        useCellEventEmitter(),
    ];
    const isValidMove = (validMoves: HexCoordinates[]) =>
        validMoves.some((dest) => dest.q == coords.q && dest.r == coords.r)
    const [classes, setClasses] = useState(['hex', 'cell']);
    const [currentTile, setCurrentTile] = useState<TileType | null>(null);

    function handleDragLeave(ev: { stopPropagation: () => void }) {
        ev.stopPropagation();
        if (currentTile) setClasses(classes.filter(e => e !== 'active'))
    }

    function handleDragEnter(ev: { stopPropagation: () => void }) {
        if (currentTile) setClasses([...classes, 'active']);
    }

    function handleClickEvent(ev: { stopPropagation: () => void }) {
        if (!currentTile) return;
        ev.stopPropagation();
        move();
        tileEventEmitter.emit({type: 'end', tile: currentTile});
    }

    function move() {
        if (!currentTile || !isValidMove(currentTile.moves)) return;
        cellEventEmitter.emit({
            type: 'drop',
            move: {coords, tileId: currentTile.id},
        });
    }

    function handleTileEvent(e: TileEvents) {
        const valid = isValidMove(e.tile.moves);

        if (e.type === 'start') {
            setCurrentTile(e.tile)
            if (valid) setClasses([...classes, 'can-drop']);
        } else if (e.type === 'end') {
            if (classes.includes('active')) move();
            setCurrentTile(null);
            setClasses(['hex', 'cell'])
        }
    }

    useEffect(() => {
        tileEventEmitter.add(handleTileEvent);
        return () => tileEventEmitter.remove(handleTileEvent);
    });

    const attributes = {
        className: classes.join(' '),
        ondragover: handleDragOver,
        ondragleave: handleDragLeave,
        ondragenter: handleDragEnter,
        onmouseenter: handleDragEnter,
        onmouseleave: handleDragLeave,
        onclick: handleClickEvent,
    };

    return (
        <div {...attributes}>
            {tiles.length > 0 && <Tile {...tiles[0]} />}
        </div>
    );
};

CellFC.displayName = 'Cell';
export default memo(
    CellFC,
    (p, n) => deepEqual(p.coords, n.coords) && !p.tiles.length && !n.tiles.length
);
