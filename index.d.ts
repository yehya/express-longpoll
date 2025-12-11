// Type definitions for express-longpoll 2.0
// Project: https://github.com/yehya/express-longpoll
// Definitions by: Yehya Awad <https://github.com/yehya>

import { Application, Router, Request, Response, NextFunction } from 'express';

declare namespace ExpressLongPoll {
	/**
	 * Options for creating a long-poll endpoint
	 */
	interface CreateOptions {
		/**
		 * Maximum number of listeners for this endpoint
		 * Helps prevent memory leaks
		 * @default 0 (unlimited)
		 */
		maxListeners?: number;
	}

	/**
	 * Options for initializing express-longpoll
	 */
	interface InitOptions {
		/**
		 * Enable debug logging
		 * @default false
		 */
		DEBUG?: boolean;

		/**
		 * EventEmitter2 configuration
		 */
		events?: {
			/**
			 * Maximum number of listeners
			 * @default 0 (unlimited)
			 */
			maxListeners?: number;
		};
	}

	/**
	 * Middleware function type
	 */
	type Middleware = (req: Request, res: Response, next: NextFunction) => void;

	/**
	 * Express-LongPoll instance
	 */
	interface ExpressLongPollInstance {
		/**
		 * Creates a long-poll endpoint at the specified URL
		 *
		 * @param url - The URL path for the long-poll endpoint
		 * @param options - Optional configuration
		 * @returns Promise that resolves when endpoint is created
		 *
		 * @example
		 * ```typescript
		 * longpoll.create('/events');
		 * ```
		 */
		create(url: string, options?: CreateOptions): Promise<void>;

		/**
		 * Creates a long-poll endpoint with middleware
		 *
		 * @param url - The URL path for the long-poll endpoint
		 * @param middleware - Express middleware function(s)
		 * @param options - Optional configuration
		 * @returns Promise that resolves when endpoint is created
		 *
		 * @example
		 * ```typescript
		 * longpoll.create('/events', authMiddleware, { maxListeners: 50 });
		 * ```
		 */
		create(
			url: string,
			middleware: Middleware | Middleware[],
			options?: CreateOptions
		): Promise<void>;

		/**
		 * Publishes data to all listeners on the specified endpoint
		 *
		 * @param url - The URL path of the endpoint
		 * @param data - Data to send to all connected clients
		 * @returns Promise that resolves when data is published
		 *
		 * @example
		 * ```typescript
		 * longpoll.publish('/events', { type: 'update', message: 'Hello!' });
		 * ```
		 */
		publish<T = any>(url: string, data: T): Promise<void>;

		/**
		 * Publishes data to a specific listener by ID
		 *
		 * @param url - The URL path of the endpoint
		 * @param id - The ID of the specific listener
		 * @param data - Data to send to the listener
		 * @returns Promise that resolves when data is published
		 *
		 * @example
		 * ```typescript
		 * longpoll.publishToId('/events', 'user123', { message: 'Private message' });
		 * ```
		 */
		publishToId<T = any>(url: string, id: string, data: T): Promise<void>;

		/**
		 * Adds middleware to the Express app
		 *
		 * @param middleware - Express middleware function
		 */
		use(middleware: Middleware): void;
	}

	/**
	 * Factory function type
	 */
	interface ExpressLongPollFactory {
		(app: Application | Router, options?: InitOptions): ExpressLongPollInstance;
	}
}

/**
 * Initialize express-longpoll with an Express app or router
 *
 * @param app - Express application or router instance
 * @param options - Optional configuration
 * @returns ExpressLongPoll instance
 *
 * @example
 * ```typescript
 * import express from 'express';
 * import expressLongPoll from 'express-longpoll';
 *
 * const app = express();
 * const longpoll = expressLongPoll(app, { DEBUG: true });
 *
 * await longpoll.create('/events');
 * await longpoll.publish('/events', { message: 'Hello World' });
 * ```
 */
declare const expressLongPoll: ExpressLongPoll.ExpressLongPollFactory;

export = expressLongPoll;
export as namespace ExpressLongPoll;
