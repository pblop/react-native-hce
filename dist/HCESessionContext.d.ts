import React from 'react';
import { HCESession } from './HCESession';
/**
 * Interface to specify the value of {@link HCESessionContext}.
 *
 * The only one element is a {@link HCESession} class.
 *
 * @group React
 */
export interface HCEReactContextValue {
    session: HCESession;
}
/**
 * {@link https://reactjs.org/docs/context.html React Context} wrapper for {@link HCESession} class.
 *
 * Use in couple with {@link HCESessionProvider}
 *
 * @group React
 */
export declare const HCESessionContext: React.Context<HCEReactContextValue>;
/**
 * {@link https://reactjs.org/docs/context.html React Context} wrapper for {@link HCESession} class - provider.
 *
 * Use it to provide the singleton instance of {@link HCESession}
 * to React application instead of calling {@link HCESession.getInstance} manually.
 * The provider will not render the children until the HCESession class will not be
 * properly picked or created.
 *
 * @group React
 * @constructor
 */
export declare const HCESessionProvider: React.FC<{
    children?: React.ReactNode;
}>;
