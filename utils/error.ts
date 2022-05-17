import Logger from 'shared/utils/Logger';

import { isString } from './data';
import { LoggerInterface } from './Logger';

export const ERROR_NAMESPACE = 'EH';
const DEFAULT_ERROR_MESSAGE = 'Unknown error encountered.';
const DEFAULT_LOGGER = new Logger(ERROR_NAMESPACE);

export interface DetErrorOptions {
  id?: string; // slug unique to each place in the codebase that we will use this.
  isUserTriggered?: boolean; // whether the error was triggered by an active interaction.
  level?: ErrorLevel;
  logger?: LoggerInterface;
  name?: string;
  payload?: unknown;
  publicMessage?: string;
  publicSubject?: string;
  silent?: boolean;
  type?: ErrorType;
}

export enum ErrorLevel {
  Fatal = 'fatal',
  Error = 'error',
  Warn = 'warning',
}

export enum ErrorType {
  Server = 'server', // internal apis and server errors.
  Auth = 'auth',
  Unknown = 'unknown',
  Ui = 'ui',
  Input = 'input', // the issue is caused by unexpected/invalid user input.
  ApiBadResponse = 'apiBadResponse', // unexpected response structure.
  Api = 'api', // third-party api
}

const defaultErrOptions: DetErrorOptions = {
  isUserTriggered: false,
  level: ErrorLevel.Error,
  logger: DEFAULT_LOGGER,
  silent: false,
  type: ErrorType.Unknown,
};

export const isError = (error: unknown): error is Error => {
  return error instanceof Error;
};
export const isDetError = (error: unknown): error is DetError => {
  return error instanceof DetError;
};
// An expected Error with supplemental information on
// how it should be handled.
export class DetError extends Error implements DetErrorOptions {
  id?: string;
  isUserTriggered: boolean;
  level: ErrorLevel;
  logger: LoggerInterface;
  payload?: unknown;
  publicMessage?: string;
  publicSubject?: string;
  original?: unknown;
  silent: boolean;
  type: ErrorType;
  isHandled: boolean;

  constructor(e?: unknown, options: DetErrorOptions = {}) {
    const defaultMessage = isError(e) ? e.message : (isString(e) ? e : DEFAULT_ERROR_MESSAGE);
    const message = options.publicSubject || options.publicMessage || defaultMessage;
    super(message);

    // Maintains proper stack trace for where our error was thrown.
    if (Error.captureStackTrace) Error.captureStackTrace(this, DetError);

    // Override DetError defaults with options.
    Object.assign(this, { ...defaultErrOptions, ...options });

    // Save original error being passed in.
    this.original = e;
    this.name = e instanceof Error ? e.name : 'Error';

    // Flag indicating whether this error has previously been handled by `handleError`.
    this.isHandled = false;
  }

  loadOptions(options: DetErrorOptions): void {
    Object.assign(this, options);
  }
}
