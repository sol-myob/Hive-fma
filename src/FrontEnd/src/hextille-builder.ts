import { Cell } from './domain';
export type Row = { id: number; cells: Array<Cell & { hidden?: boolean }> };

const getWidth = (cells: Cell[]): [number, number] => {
  const [min, max] = cells.reduce(([min, max], c) => [Math.min(min, c.coords.q), Math.max(max, c.coords.q)], [
    0,
    0,
  ]);
  return [min, max - min + 1];
};

const getHeight = (sortedHexagons: Cell[]): [number, number] => {
  const firstCell = sortedHexagons[0] as Cell;
  const lastCell = sortedHexagons[sortedHexagons.length - 1] as Cell;
  const height = lastCell.coords.r - firstCell.coords.r + 1;
  return [firstCell.coords.r, height];
};

export const createRows = (sortedHexagons: Cell[]): Row[] => {
  const [firstRow, height] = getHeight(sortedHexagons);
  const [firstColumn, width] = getWidth(sortedHexagons);

  const createEmptyRow = (i: number): Row => ({
    id: firstRow + i,
    cells: Array.from(Array(width).keys(), (j: number) => ({
      coords: { q: firstRow + i, r: firstColumn + j },
      tiles: [],
      hidden: true,
    })),
  });

  const createEmptyRows = () => {
    return Array.from(Array(height).keys(), createEmptyRow);
  };

  return sortedHexagons.reduce((rows, cell) => {
    (rows[cell.coords.r - firstRow] as Row).cells[cell.coords.q - firstColumn] = cell;
    return rows;
  }, createEmptyRows());
};
