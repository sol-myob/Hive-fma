using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Hive.Controllers;
using Hive.Converters;
using Hive.Domain.Entities;
using Hive.DTOs;
using Hive.Hubs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Options;
using Moq;
using Xunit;

namespace Hive.Api.Tests.Controllers
{
    public class MoveControllerTests
    {
        private const string ExistingGameId = "EXISTING_GAME_ID";
        private const string MissingGameId = "MISSING_GAME_ID";
        private readonly MoveController _controller;
        private readonly Mock<IHubContext<GameHub>> _hubMock;

        public MoveControllerTests()
        {
            var game = new Domain.Hive(new[] {"player1", "player2"});
            game.Move(game.Players[0]
                .Tiles.First()
                .Id, new Coords(1, 0));
            game.Move(game.Players[1]
                .Tiles.First()
                .Id, new Coords(2, 0));
            var gameState = new GameState(game.Players, game.Cells, ExistingGameId);

            var jsonOptions = new JsonOptions();
            jsonOptions.JsonSerializerOptions.Converters.Add(new CreatureJsonConverter());
            jsonOptions.JsonSerializerOptions.Converters.Add(new StackJsonConverter());

            _hubMock = new Mock<IHubContext<GameHub>>();
            _hubMock.Setup(m => m.Clients.Group(It.IsAny<string>())
                    .SendCoreAsync(It.IsAny<string>(), It.IsAny<object[]>(), It.IsAny<CancellationToken>()))
                .Returns(() => Task.CompletedTask);

            var optionsMock = new Mock<IOptions<JsonOptions>>();
            optionsMock.SetupGet(m => m.Value)
                .Returns(jsonOptions);

            var memoryCacheMock = new Mock<IDistributedCache>();
            memoryCacheMock.Setup(m => m.GetAsync(MissingGameId, It.IsAny<CancellationToken>()))
                .Returns(() => Task.FromResult<byte[]>(null));
            memoryCacheMock.Setup(m => m.GetAsync(ExistingGameId, It.IsAny<CancellationToken>()))
                .Returns(() => Task.FromResult(Encoding.Default.GetBytes(JsonSerializer.Serialize(gameState, jsonOptions.JsonSerializerOptions))));
            _controller = new MoveController(_hubMock.Object, optionsMock.Object, memoryCacheMock.Object);
        }

        [Fact]
        public async Task Post_IdMissing_ReturnsBadRequest()
        {
            Move move = new(1, new Coords(0, 0));
            (await _controller.Post(null!, move)).Should()
                .BeOfType<BadRequestResult>();
        }

        [Fact]
        public async Task Post_MoveMissing_ReturnsBadRequest()
        {
            (await _controller.Post(ExistingGameId, null!)).Should()
                .BeOfType<BadRequestResult>();
        }

        [Fact]
        public async Task Post_GameNotInCache_ReturnsNotFound()
        {
            Move move = new(1, new Coords(0, 0));

            (await _controller.Post(MissingGameId, move)).Should()
                .BeOfType<NotFoundResult>();
        }

        [Fact]
        public async Task Post_GameInCache_ReturnsAccepted()
        {
            Move move = new(1, new Coords(0, 0));

            var actionResult = await _controller.Post(ExistingGameId, move);
            var result = actionResult.Should()
                .BeOfType<AcceptedResult>()
                .Subject;
            result.Location.Should()
                .Be($"/game/{ExistingGameId}");
            result.Value.Should()
                .BeAssignableTo<GameState>();
        }

        [Fact]
        public async Task Post_GameInCache_PerformsMove()
        {
            Move move = new(1, new Coords(0, 0));

            var result = (await _controller.Post(ExistingGameId, move)).Should()
                .BeOfType<AcceptedResult>()
                .Subject;
            var newGameState = result.Value.Should()
                .BeAssignableTo<GameState>()
                .Subject;

            newGameState.Cells.Single(c => c.Coords == move.Coords)
                .Tiles.Should()
                .Contain(t => t.Id == move.TileId);
        }

        [Fact]
        public async Task Post_GameInCache_SendsNewGameState()
        {
            Move move = new(3, new Coords(0, 0));

            var result = (await _controller.Post(ExistingGameId, move)).Should()
                .BeOfType<AcceptedResult>()
                .Subject;
            var newGameState = result.Value.Should()
                .BeAssignableTo<GameState>()
                .Subject;

            _hubMock.Verify(m => m.Clients.Group(ExistingGameId), Times.Once);
            _hubMock.Verify(m => m.Clients.Group(ExistingGameId)
                .SendCoreAsync("ReceiveGameState", It.Is<object[]>(a => a.OfType<GameState>()
                    .Single() == newGameState), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task Post_GameInCache_InvalidMoveForbidden()
        {
            Move move = new(4, new Coords(4, 4));

            var result = (await _controller.Post(ExistingGameId, move)).Should()
                .BeOfType<ForbidResult>()
                .Subject;
        }
    }
}
