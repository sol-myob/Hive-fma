﻿﻿using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Threading.Tasks;
using Hive.Domain;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using JsonSerializer = System.Text.Json.JsonSerializer;

namespace Hive.Api.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class MoveController : ControllerBase
    {
        private readonly ILogger<MoveController> _logger;

        public MoveController(ILogger<MoveController> logger)
        {
            _logger = logger;
        }

        [HttpPost]
        [Produces("application/json")]
        public  GameState Post()
        {
            var set = new JsonSerializerSettings
            {
                ContractResolver = new DefaultContractResolver
                {
                    NamingStrategy = new CamelCaseNamingStrategy()
                },
                Formatting = Formatting.Indented
            };
            var gameState = JsonConvert.DeserializeObject<GameState>(HttpContext.Session.GetString("game"), set);
            
            gameState.Cells.Add(new Cell(new GameCoordinate(1, 2), ColorTranslator.ToHtml(Color.Chartreuse)));
           
            var json = JsonConvert.SerializeObject(gameState, set);
            HttpContext.Session.SetString("game", json);
            return gameState;
        }
    }
}
