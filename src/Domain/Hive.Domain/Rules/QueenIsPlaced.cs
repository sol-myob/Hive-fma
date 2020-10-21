﻿using System.Collections.Generic;
using System.Linq;
using Hive.Domain.Entities;
using Hive.Domain.Extensions;

namespace Hive.Domain.Rules
{
    public class QueenIsPlaced : IRule
    {
        public ISet<Coords> ApplyRule(Cell currentCell, ISet<Cell> allCells)
        {
            return QueenHasBeenPlaced(currentCell, allCells) ? allCells.ToCoords() : new HashSet<Coords>();
        }

        private static bool QueenHasBeenPlaced(Cell currentCell, ISet<Cell> allCells)
        {
            return allCells
                            .WhereOccupied()
                            .WherePlayerOccupies(currentCell.TopTile().PlayerId)
                            .Any(c => c.IsQueen());
        }
    }
}
