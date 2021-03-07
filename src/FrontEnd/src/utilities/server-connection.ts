import { GameId, Tile } from '../domain';
import { GameStateUpdateHandler, HexServerConnection, OpponentSelectionHandler } from '../domain/engine';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';

export default class ServerConnection implements HexServerConnection {
  private readonly updateHandler;
  private readonly gameId: GameId;
  private readonly connection: HubConnection;
  private readonly opponentSelectionHandler: OpponentSelectionHandler;

  constructor(
    gameId: GameId,
    updateHandler: GameStateUpdateHandler,
    opponentSelectionHandler: OpponentSelectionHandler
  ) {
    this.gameId = gameId;
    this.opponentSelectionHandler = opponentSelectionHandler;
    this.updateHandler = updateHandler;
    this.connection = this.createConnection();
    return this;
  }

  connectGame = (): Promise<void> => {
    if (process.env.NODE_ENV !== 'production') {
      this.connection.onreconnecting((error) =>
        console.warn(`reconnecting to game ${this.gameId} .. ${error}`)
      );
      this.connection.onclose((error) =>
        console.info(`connection closed to game ${this.gameId} .. ${error}`)
      );
      this.connection.onreconnected((error) => {
        window.location.reload();
        console.info(`reconnected to game ${this.gameId} .. ${error}`);
      });
    }
    return this.connection.start();
  };

  getConnectionState = (): HubConnectionState => this.connection.state;

  sendSelection: OpponentSelectionHandler = (type: 'select' | 'deselect', tile: Tile) => {
    if (!this.connection) return;
    this.connection.state === HubConnectionState.Connected &&
      this.connection.invoke('SendSelection', type, tile).catch(function (err) {
        return console.error(err.toString());
      });
  };

  closeConnection = (): Promise<void> => {
    if (!this.connection) return Promise.resolve();
    this.connection.off('ReceiveGameState', this.updateHandler);
    return this.connection.stop();
  };

  private createConnection = () => {
    const hubUrl = `${window.location.protocol}//${window.location.host}/gamehub/${this.gameId}`;
    const connection = new HubConnectionBuilder().withUrl(hubUrl).withAutomaticReconnect().build();
    connection.on('ReceiveGameState', this.updateHandler);
    connection.on('OpponentSelection', this.opponentSelectionHandler);
    return connection;
  };
}
