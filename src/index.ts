import GameServer from './GameServer';
import Sequence from './games/sequence';
import Splendor from './games/splendor';
import Jaipur from './games/jaipur';

let app = new GameServer(new Jaipur()).getApp();
export { app };