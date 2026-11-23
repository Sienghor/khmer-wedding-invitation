import { createContext } from 'react';

/**
 * True once the guest has passed through the opening. In-page 3D scenes wait
 * for it, so they never render behind the gate in a second WebGL context.
 */
export const OpenedContext = createContext(true);
