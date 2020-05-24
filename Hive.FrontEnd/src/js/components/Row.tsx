import * as React from 'react';
import { Hexagon, HexCoordinates } from '../domain';
import Cell from './Cell';
import isEqual from 'react-fast-compare';

const cellKey = ({ q, r }: HexCoordinates) => `${q}-${r}`;
const cellComponent = (cell: typeof Cell.arguments['props']) => <Cell key={cellKey(cell.coordinates)} {...cell} />;
const emptyCell = (key: number) => <div key={key} className="hidden"/>;

type Props = {
    id: number;
    row: Array<Hexagon | false>;
};

function Row (props: Props) {
    const { row } = props;
    const cells = row.map((cell, i) => (cell && cellComponent(cell)) || emptyCell(i));
    return <div className="hex-row">{cells}</div>;
}

Row.displayName = 'Row';

const RowMemo = React.memo(Row, isEqual);

export default RowMemo;
