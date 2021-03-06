﻿using System;
using System.Collections.Generic;
using System.Text;
using FluentAssertions;
using FluentAssertions.Execution;
using FluentAssertions.Primitives;
using Hive.Domain.Entities;
using Hive.Domain.Movements;

namespace Hive.Domain.Tests.TestUtils
{
    internal static class HiveTestExtensions
    {
        public static RuleAssertions Should(this IMovements movements)
        {
            return new(initialHiveBuilder => movements.GetMoves(initialHiveBuilder.OriginCell, initialHiveBuilder.AllCells));
        }

        public static RuleAssertions Should(this Creature creature)
        {
            return new(initialHiveBuilder =>
            {
                var currentCell = initialHiveBuilder.OriginCell;
                currentCell.RemoveTopTile();
                initialHiveBuilder.OriginCell.AddTile(new Tile(0, 1, Creatures.Queen));
                initialHiveBuilder.AllCells.Add(currentCell);
                return creature.GetAvailableMoves(initialHiveBuilder.OriginCell, initialHiveBuilder.AllCells);
            });
        }
    }

    internal class RuleAssertions : ReferenceTypeAssertions<Func<InitialHiveBuilder, ISet<Coords>>, RuleAssertions>
    {

        public RuleAssertions(Func<InitialHiveBuilder, ISet<Coords>> subject) : base(subject)
        {
        }

        protected override string Identifier => "move";

        public AndConstraint<RuleAssertions> HaveMoves(InitialHiveBuilder initial, ExpectedHiveBuilder expected)
        {
            var expectedCoords = expected.ExpectedMoves();

            Execute.Assertion.Given(() => Subject(initial))
                .ForCondition(coords => coords.SetEquals(expectedCoords))
                .FailWith("\nResulting " + Identifier + "s did not match expected\n\nInitial:\n{1}\n\nActual - Expected:\n{2}\n", _ => initial.OriginCell.Coords, _ => new StringBuilder(initial.ToColoredString()),
                    actual => new StringBuilder(expected.GetDiff(actual)));

            return new AndConstraint<RuleAssertions>(this);
        }
    }
}
