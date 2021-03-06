export type UncletopiaServersResponse = {
  status: boolean;
  message: string;
  data: Array<UncletopiaServer>;
};

export type UncletopiaServer = {
  server_id: string;
  name_short: string;
  name_long: string;
  host: string;
  port: number;
  region: string;
  latitude: number;
  longitude: number;
  is_enabled: boolean;
  cc: string;
  last_had_players: string;
  state: {
    PlayersCount: number;
    PlayersMax: number;
    ServerName: string;
    Version: string;
    Map: string;
  }
  a2s: {
    Protocol: number;
    Name: string;
    Map: string;
    Folder: string;
    Game: string;
    AppID: number;
    Players: number;
    MaxPlayers: number;
    Bots: number;
    ServerType: number;
    ServerOS: number;
    Visibility: boolean;
    VAC: boolean;
    Version: string;
    EDF: number;
    ExtendedServerInfo: {
      Port: number;
      SteamID: string;
      Keywords: string;
      GameID: string;
    }
    SourceTV: {
      Port: number;
      Name: string;
    }
  }
};
