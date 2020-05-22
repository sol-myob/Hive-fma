import * as React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import * as TestUtils from 'react-dom/test-utils';
import { create } from 'react-test-renderer';
import Cell from '../components/Cell';
import TileDragEmitter from '../emitter/tileDragEmitter';
import { GameContext, HiveContext } from '../gameContext';

const emptyCell = { coordinates: { q: 0, r: 0 }, tiles: [] };
const cellWithTile = {
    coordinates: { q: 1, r: 1 },
    tiles: [{ id: 2, playerId: 2, content: 'fly', availableMoves: [{ q: 0, r: 0 }] }]
};

const hexagonJSX = (context: GameContext) =>
    <HiveContext.Provider value={context}>
        <Cell key="1-1" {...emptyCell}/>
        <Cell key="0-0" {...cellWithTile}/>
    </HiveContext.Provider>;
let container: HTMLDivElement;
let context: GameContext;
let tileDragEmitter = new TileDragEmitter();
beforeEach(() => {
    tileDragEmitter = new TileDragEmitter();
    context = ({
        moveTile: jest.fn(),
        players: [],
        hexagons: [],
    });

    container = document.createElement('div');
    document.body.appendChild(container);
    TestUtils.act(() => {
        render(hexagonJSX(context), container);
    });
});

describe('Cell Render', () => {
    test('starts with default classes', () => {
        const hexagons = document.querySelectorAll<HTMLDivElement>('.cell');
        expect(hexagons[0].classList.toString()).toEqual('hex cell');
        expect(hexagons[1].classList.toString()).toEqual('hex cell');
    });

    test('top tile is rendered if it exists', () => {
        const cell = document.querySelectorAll<HTMLDivElement>('.cell')[1];
        const tile = document.querySelectorAll<HTMLDivElement>('.tile')[0];
        expect(cell.children).toContain(tile);
    });
});

describe('Cell drag and drop', () => {
    test('dragover allows drop', () => {
        const cell = document.querySelectorAll<HTMLDivElement>('.cell')[1];
        cell.classList.add('valid-cell');
        const preventDefault = jest.fn();
        TestUtils.Simulate.dragOver(cell, { preventDefault });

        expect(preventDefault).toBeCalled();
    });

    test('drop sends move tile request', () => {
        const cells = document.querySelectorAll<HTMLDivElement>('.cell');
        cells[1].classList.add('active');
        tileDragEmitter.emit({ type: 'end', source: 2, data: [{ q: 1, r: 1 }] });

        expect(context.moveTile).toBeCalledWith({ tileId: 2, coordinates: { q: 1, r: 1 } });
    });

    test('cell is valid on drag start', () => {
        const cells = document.querySelectorAll<HTMLDivElement>('.cell');
        cells.forEach(c => TestUtils.Simulate.dragEnter(c));

        tileDragEmitter.emit({ type: 'start', source: 2, data: [{ q: 0, r: 0 }] });

        expect(cells[0].classList).toContain('valid-cell');
    });

    test('valid cell is active on tile drag enter', () => {
        const cells = document.querySelectorAll<HTMLDivElement>('.cell');
        cells[0].classList.add('valid-cell');
        cells.forEach(c => TestUtils.Simulate.dragEnter(c));

        expect(cells[0].classList).toContain('active');
        expect(cells[0].classList).not.toContain('invalid-cell');
    });

    test('cell is invalid on drag enter', () => {
        const cells = document.querySelectorAll<HTMLDivElement>('.cell');
        cells.forEach(c => TestUtils.Simulate.dragEnter(c));

        expect(cells[0].classList).toContain('invalid-cell');
        expect(cells[0].classList).not.toContain('active');
    });

    test('active and invalid are removed on drag leave', () => {
        const cells = document.querySelectorAll<HTMLDivElement>('.cell');
        cells.forEach(c => TestUtils.Simulate.dragEnter(c));
        cells.forEach(c => TestUtils.Simulate.dragLeave(c));

        expect(Array.from(cells).flatMap(c => c.classList)).not.toContain('active');
        expect(Array.from(cells).flatMap(c => c.classList)).not.toContain('invalid-cell');
    });

});

describe('Cell Snapshot', () => {
    test('matches current snapshot', () => {
        const component = create(hexagonJSX(context));

        let tree = component.toJSON();
        expect(tree).toMatchSnapshot();
    });
});

afterEach(() => {
    unmountComponentAtNode(container);
    container.remove();
});