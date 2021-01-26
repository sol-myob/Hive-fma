﻿using System.Collections.Generic;
using Hive.Domain.Entities;
using Hive.Domain.Extensions;

namespace Hive.Domain.Movements
{
    public class Empty : IMovements
    {
        public ISet<Coords> GetMoves(Cell currentCell, ISet<Cell> cells) => cells.WhereEmpty().ToCoords();
    }
}
