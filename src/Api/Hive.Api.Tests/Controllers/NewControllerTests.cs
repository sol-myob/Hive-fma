using FluentAssertions;
using Hive.Controllers;
using Hive.Converters;
using Hive.DTOs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Options;
using Moq;
using Xunit;

namespace Hive.Api.Tests.Controllers
{
    public class NewControllerTests
    {
        private readonly NewController _controller;
        private Mock<IDistributedCache> _memoryCacheMock;
        private const string NewGameId = "NEW_GAME_ID";

        public NewControllerTests()
        {
            var jsonOptions = new JsonOptions();
            jsonOptions.JsonSerializerOptions.Converters.Add(new CreatureJsonConverter());
            jsonOptions.JsonSerializerOptions.Converters.Add(new StackJsonConverter());

            var optionsMock = new Mock<IOptions<JsonOptions>>();
            optionsMock.SetupGet(m => m.Value).Returns(jsonOptions);

            _memoryCacheMock = new Mock<IDistributedCache>();
            _memoryCacheMock.Setup(m => m.Set(It.IsAny<string>(), It.IsAny<byte[]>(), It.IsAny<DistributedCacheEntryOptions>()));
            
            var httpContextMock = new Mock<HttpContext>();
            httpContextMock.SetupGet(m => m.TraceIdentifier).Returns(NewGameId);
            _controller = new NewController(optionsMock.Object, _memoryCacheMock.Object) {ControllerContext = {HttpContext = httpContextMock.Object}};
        }

        [Fact]
        public void Post_CreatesNewGame()
        {
            _controller.Post().Should().BeAssignableTo<CreatedResult>().Which.Value.Should().BeAssignableTo<GameState>().Which.GameId.Should().Be(NewGameId);
        }
        
        [Fact]
        public void Post_StoresNewGameInCache()
        {
            _controller.Post();
            _memoryCacheMock.Verify(m=>m.Set(NewGameId, It.IsAny<byte[]>(),It.IsAny<DistributedCacheEntryOptions>()));
        }
    }
}
