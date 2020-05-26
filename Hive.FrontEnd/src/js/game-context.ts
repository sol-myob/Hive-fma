import {createContext, useContext, useEffect, useMemo, useState} from 'preact/compat';
import {GameState, Hexagon, Move, MoveTile, Player} from './domain';
import Engine from './game-engine';

interface GameContext {
    players: Player[];
    hexagons: Hexagon[];
    moveTile: MoveTile;
}

export const useNewHiveContext = (): [boolean, GameContext?] => {
    const [loading, setLoading] = useState(true);
    const [gameState, setGameState] = useState<GameState | undefined>(undefined);

    useEffect(() => {
        Engine.initialState()
            .then((state) => {
                setGameState(state);
                return setLoading(false);
            })
            .catch(() => {
                return setLoading(true);
            });
    }, []);

    const moveTile = useMemo(() => (move: Move) => {
        Engine.moveTile(move)
            .then((state) => {
                return setGameState(state);
            });
    }, [setGameState]);

    if (loading || !gameState) return [loading] ;
    return [loading, {...gameState, moveTile}];
};

export const HiveContext = createContext<GameContext>({
    hexagons: [],
    players: [],
    moveTile: () => undefined,
});

export const useHiveContext = () => useContext<GameContext>(HiveContext);