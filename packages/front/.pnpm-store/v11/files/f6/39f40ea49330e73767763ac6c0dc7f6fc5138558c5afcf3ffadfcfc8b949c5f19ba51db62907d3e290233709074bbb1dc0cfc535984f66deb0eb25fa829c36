import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import { resolve, isAbsolute, parse, join, dirname } from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';
import { renderDOMHead } from '@unhead/dom';
import { gray, yellow, blue, dim, cyan, red, green } from 'ansis';
import { JSDOM } from 'jsdom';
import { resolveConfig, build as build$1, mergeConfig } from 'vite';
import { s as serializeState } from './vite-ssg.C6pK7rvr.mjs';

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var eventemitter3 = {exports: {}};

var hasRequiredEventemitter3;

function requireEventemitter3 () {
	if (hasRequiredEventemitter3) return eventemitter3.exports;
	hasRequiredEventemitter3 = 1;
	(function (module) {

		var has = Object.prototype.hasOwnProperty
		  , prefix = '~';

		/**
		 * Constructor to create a storage for our `EE` objects.
		 * An `Events` instance is a plain object whose properties are event names.
		 *
		 * @constructor
		 * @private
		 */
		function Events() {}

		//
		// We try to not inherit from `Object.prototype`. In some engines creating an
		// instance in this way is faster than calling `Object.create(null)` directly.
		// If `Object.create(null)` is not supported we prefix the event names with a
		// character to make sure that the built-in object properties are not
		// overridden or used as an attack vector.
		//
		if (Object.create) {
		  Events.prototype = Object.create(null);

		  //
		  // This hack is needed because the `__proto__` property is still inherited in
		  // some old browsers like Android 4, iPhone 5.1, Opera 11 and Safari 5.
		  //
		  if (!new Events().__proto__) prefix = false;
		}

		/**
		 * Representation of a single event listener.
		 *
		 * @param {Function} fn The listener function.
		 * @param {*} context The context to invoke the listener with.
		 * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
		 * @constructor
		 * @private
		 */
		function EE(fn, context, once) {
		  this.fn = fn;
		  this.context = context;
		  this.once = once || false;
		}

		/**
		 * Add a listener for a given event.
		 *
		 * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
		 * @param {(String|Symbol)} event The event name.
		 * @param {Function} fn The listener function.
		 * @param {*} context The context to invoke the listener with.
		 * @param {Boolean} once Specify if the listener is a one-time listener.
		 * @returns {EventEmitter}
		 * @private
		 */
		function addListener(emitter, event, fn, context, once) {
		  if (typeof fn !== 'function') {
		    throw new TypeError('The listener must be a function');
		  }

		  var listener = new EE(fn, context || emitter, once)
		    , evt = prefix ? prefix + event : event;

		  if (!emitter._events[evt]) emitter._events[evt] = listener, emitter._eventsCount++;
		  else if (!emitter._events[evt].fn) emitter._events[evt].push(listener);
		  else emitter._events[evt] = [emitter._events[evt], listener];

		  return emitter;
		}

		/**
		 * Clear event by name.
		 *
		 * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
		 * @param {(String|Symbol)} evt The Event name.
		 * @private
		 */
		function clearEvent(emitter, evt) {
		  if (--emitter._eventsCount === 0) emitter._events = new Events();
		  else delete emitter._events[evt];
		}

		/**
		 * Minimal `EventEmitter` interface that is molded against the Node.js
		 * `EventEmitter` interface.
		 *
		 * @constructor
		 * @public
		 */
		function EventEmitter() {
		  this._events = new Events();
		  this._eventsCount = 0;
		}

		/**
		 * Return an array listing the events for which the emitter has registered
		 * listeners.
		 *
		 * @returns {Array}
		 * @public
		 */
		EventEmitter.prototype.eventNames = function eventNames() {
		  var names = []
		    , events
		    , name;

		  if (this._eventsCount === 0) return names;

		  for (name in (events = this._events)) {
		    if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
		  }

		  if (Object.getOwnPropertySymbols) {
		    return names.concat(Object.getOwnPropertySymbols(events));
		  }

		  return names;
		};

		/**
		 * Return the listeners registered for a given event.
		 *
		 * @param {(String|Symbol)} event The event name.
		 * @returns {Array} The registered listeners.
		 * @public
		 */
		EventEmitter.prototype.listeners = function listeners(event) {
		  var evt = prefix ? prefix + event : event
		    , handlers = this._events[evt];

		  if (!handlers) return [];
		  if (handlers.fn) return [handlers.fn];

		  for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
		    ee[i] = handlers[i].fn;
		  }

		  return ee;
		};

		/**
		 * Return the number of listeners listening to a given event.
		 *
		 * @param {(String|Symbol)} event The event name.
		 * @returns {Number} The number of listeners.
		 * @public
		 */
		EventEmitter.prototype.listenerCount = function listenerCount(event) {
		  var evt = prefix ? prefix + event : event
		    , listeners = this._events[evt];

		  if (!listeners) return 0;
		  if (listeners.fn) return 1;
		  return listeners.length;
		};

		/**
		 * Calls each of the listeners registered for a given event.
		 *
		 * @param {(String|Symbol)} event The event name.
		 * @returns {Boolean} `true` if the event had listeners, else `false`.
		 * @public
		 */
		EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
		  var evt = prefix ? prefix + event : event;

		  if (!this._events[evt]) return false;

		  var listeners = this._events[evt]
		    , len = arguments.length
		    , args
		    , i;

		  if (listeners.fn) {
		    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

		    switch (len) {
		      case 1: return listeners.fn.call(listeners.context), true;
		      case 2: return listeners.fn.call(listeners.context, a1), true;
		      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
		      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
		      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
		      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
		    }

		    for (i = 1, args = new Array(len -1); i < len; i++) {
		      args[i - 1] = arguments[i];
		    }

		    listeners.fn.apply(listeners.context, args);
		  } else {
		    var length = listeners.length
		      , j;

		    for (i = 0; i < length; i++) {
		      if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

		      switch (len) {
		        case 1: listeners[i].fn.call(listeners[i].context); break;
		        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
		        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
		        case 4: listeners[i].fn.call(listeners[i].context, a1, a2, a3); break;
		        default:
		          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
		            args[j - 1] = arguments[j];
		          }

		          listeners[i].fn.apply(listeners[i].context, args);
		      }
		    }
		  }

		  return true;
		};

		/**
		 * Add a listener for a given event.
		 *
		 * @param {(String|Symbol)} event The event name.
		 * @param {Function} fn The listener function.
		 * @param {*} [context=this] The context to invoke the listener with.
		 * @returns {EventEmitter} `this`.
		 * @public
		 */
		EventEmitter.prototype.on = function on(event, fn, context) {
		  return addListener(this, event, fn, context, false);
		};

		/**
		 * Add a one-time listener for a given event.
		 *
		 * @param {(String|Symbol)} event The event name.
		 * @param {Function} fn The listener function.
		 * @param {*} [context=this] The context to invoke the listener with.
		 * @returns {EventEmitter} `this`.
		 * @public
		 */
		EventEmitter.prototype.once = function once(event, fn, context) {
		  return addListener(this, event, fn, context, true);
		};

		/**
		 * Remove the listeners of a given event.
		 *
		 * @param {(String|Symbol)} event The event name.
		 * @param {Function} fn Only remove the listeners that match this function.
		 * @param {*} context Only remove the listeners that have this context.
		 * @param {Boolean} once Only remove one-time listeners.
		 * @returns {EventEmitter} `this`.
		 * @public
		 */
		EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
		  var evt = prefix ? prefix + event : event;

		  if (!this._events[evt]) return this;
		  if (!fn) {
		    clearEvent(this, evt);
		    return this;
		  }

		  var listeners = this._events[evt];

		  if (listeners.fn) {
		    if (
		      listeners.fn === fn &&
		      (!once || listeners.once) &&
		      (!context || listeners.context === context)
		    ) {
		      clearEvent(this, evt);
		    }
		  } else {
		    for (var i = 0, events = [], length = listeners.length; i < length; i++) {
		      if (
		        listeners[i].fn !== fn ||
		        (once && !listeners[i].once) ||
		        (context && listeners[i].context !== context)
		      ) {
		        events.push(listeners[i]);
		      }
		    }

		    //
		    // Reset the array, or remove it completely if we have no more listeners.
		    //
		    if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
		    else clearEvent(this, evt);
		  }

		  return this;
		};

		/**
		 * Remove all listeners, or those of the specified event.
		 *
		 * @param {(String|Symbol)} [event] The event name.
		 * @returns {EventEmitter} `this`.
		 * @public
		 */
		EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
		  var evt;

		  if (event) {
		    evt = prefix ? prefix + event : event;
		    if (this._events[evt]) clearEvent(this, evt);
		  } else {
		    this._events = new Events();
		    this._eventsCount = 0;
		  }

		  return this;
		};

		//
		// Alias methods names because people roll like that.
		//
		EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
		EventEmitter.prototype.addListener = EventEmitter.prototype.on;

		//
		// Expose the prefix.
		//
		EventEmitter.prefixed = prefix;

		//
		// Allow `EventEmitter` to be imported as module namespace.
		//
		EventEmitter.EventEmitter = EventEmitter;

		//
		// Expose the module.
		//
		{
		  module.exports = EventEmitter;
		} 
	} (eventemitter3));
	return eventemitter3.exports;
}

var eventemitter3Exports = requireEventemitter3();
const EventEmitter = /*@__PURE__*/getDefaultExportFromCjs(eventemitter3Exports);

class TimeoutError extends Error {
	name = 'TimeoutError';

	constructor(message, options) {
		super(message, options);
		Error.captureStackTrace?.(this, TimeoutError);
	}
}

const getAbortedReason = signal => signal.reason ?? new DOMException('This operation was aborted.', 'AbortError');

function pTimeout(promise, options) {
	const {
		milliseconds,
		fallback,
		message,
		customTimers = {setTimeout, clearTimeout},
		signal,
	} = options;

	let timer;
	let abortHandler;

	const wrappedPromise = new Promise((resolve, reject) => {
		if (typeof milliseconds !== 'number' || Math.sign(milliseconds) !== 1) {
			throw new TypeError(`Expected \`milliseconds\` to be a positive number, got \`${milliseconds}\``);
		}

		if (signal?.aborted) {
			reject(getAbortedReason(signal));
			return;
		}

		if (signal) {
			abortHandler = () => {
				reject(getAbortedReason(signal));
			};

			signal.addEventListener('abort', abortHandler, {once: true});
		}

		// Use .then() instead of async IIFE to preserve stack traces
		// eslint-disable-next-line promise/prefer-await-to-then, promise/prefer-catch
		promise.then(resolve, reject);

		if (milliseconds === Number.POSITIVE_INFINITY) {
			return;
		}

		// We create the error outside of `setTimeout` to preserve the stack trace.
		const timeoutError = new TimeoutError();

		timer = customTimers.setTimeout(() => {
			if (fallback) {
				try {
					resolve(fallback());
				} catch (error) {
					reject(error);
				}

				return;
			}

			if (typeof promise.cancel === 'function') {
				promise.cancel();
			}

			if (message === false) {
				resolve();
			} else if (message instanceof Error) {
				reject(message);
			} else {
				timeoutError.message = message ?? `Promise timed out after ${milliseconds} milliseconds`;
				reject(timeoutError);
			}
		}, milliseconds);
	});

	// eslint-disable-next-line promise/prefer-await-to-then
	const cancelablePromise = wrappedPromise.finally(() => {
		cancelablePromise.clear();
		if (abortHandler && signal) {
			signal.removeEventListener('abort', abortHandler);
		}
	});

	cancelablePromise.clear = () => {
		customTimers.clearTimeout(timer);
		timer = undefined;
	};

	return cancelablePromise;
}

// Port of lower_bound from https://en.cppreference.com/w/cpp/algorithm/lower_bound
// Used to compute insertion index to keep queue sorted after insertion
function lowerBound(array, value, comparator) {
    let first = 0;
    let count = array.length;
    while (count > 0) {
        const step = Math.trunc(count / 2);
        let it = first + step;
        if (comparator(array[it], value) <= 0) {
            first = ++it;
            count -= step + 1;
        }
        else {
            count = step;
        }
    }
    return first;
}

class PriorityQueue {
    #queue = [];
    enqueue(run, options) {
        const { priority = 0, id, } = options ?? {};
        const element = {
            priority,
            id,
            run,
        };
        if (this.size === 0 || this.#queue[this.size - 1].priority >= priority) {
            this.#queue.push(element);
            return;
        }
        const index = lowerBound(this.#queue, element, (a, b) => b.priority - a.priority);
        this.#queue.splice(index, 0, element);
    }
    setPriority(id, priority) {
        const index = this.#queue.findIndex((element) => element.id === id);
        if (index === -1) {
            throw new ReferenceError(`No promise function with the id "${id}" exists in the queue.`);
        }
        const [item] = this.#queue.splice(index, 1);
        this.enqueue(item.run, { priority, id });
    }
    dequeue() {
        const item = this.#queue.shift();
        return item?.run;
    }
    filter(options) {
        return this.#queue.filter((element) => element.priority === options.priority).map((element) => element.run);
    }
    get size() {
        return this.#queue.length;
    }
}

/**
Promise queue with concurrency control.
*/
class PQueue extends EventEmitter {
    #carryoverIntervalCount;
    #isIntervalIgnored;
    #intervalCount = 0;
    #intervalCap;
    #rateLimitedInInterval = false;
    #rateLimitFlushScheduled = false;
    #interval;
    #intervalEnd = 0;
    #lastExecutionTime = 0;
    #intervalId;
    #timeoutId;
    #strict;
    // Circular buffer implementation for better performance
    #strictTicks = [];
    #strictTicksStartIndex = 0;
    #queue;
    #queueClass;
    #pending = 0;
    // The `!` is needed because of https://github.com/microsoft/TypeScript/issues/32194
    #concurrency;
    #isPaused;
    // Use to assign a unique identifier to a promise function, if not explicitly specified
    #idAssigner = 1n;
    // Track currently running tasks for debugging
    #runningTasks = new Map();
    /**
    Get or set the default timeout for all tasks. Can be changed at runtime.

    Operations will throw a `TimeoutError` if they don't complete within the specified time.

    The timeout begins when the operation is dequeued and starts execution, not while it's waiting in the queue.

    @example
    ```
    const queue = new PQueue({timeout: 5000});

    // Change timeout for all future tasks
    queue.timeout = 10000;
    ```
    */
    timeout;
    constructor(options) {
        super();
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        options = {
            carryoverIntervalCount: false,
            intervalCap: Number.POSITIVE_INFINITY,
            interval: 0,
            concurrency: Number.POSITIVE_INFINITY,
            autoStart: true,
            queueClass: PriorityQueue,
            strict: false,
            ...options,
        };
        if (!(typeof options.intervalCap === 'number' && options.intervalCap >= 1)) {
            throw new TypeError(`Expected \`intervalCap\` to be a number from 1 and up, got \`${options.intervalCap?.toString() ?? ''}\` (${typeof options.intervalCap})`);
        }
        if (options.interval === undefined || !(Number.isFinite(options.interval) && options.interval >= 0)) {
            throw new TypeError(`Expected \`interval\` to be a finite number >= 0, got \`${options.interval?.toString() ?? ''}\` (${typeof options.interval})`);
        }
        if (options.strict && options.interval === 0) {
            throw new TypeError('The `strict` option requires a non-zero `interval`');
        }
        if (options.strict && options.intervalCap === Number.POSITIVE_INFINITY) {
            throw new TypeError('The `strict` option requires a finite `intervalCap`');
        }
        // TODO: Remove this fallback in the next major version
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        this.#carryoverIntervalCount = options.carryoverIntervalCount ?? options.carryoverConcurrencyCount ?? false;
        this.#isIntervalIgnored = options.intervalCap === Number.POSITIVE_INFINITY || options.interval === 0;
        this.#intervalCap = options.intervalCap;
        this.#interval = options.interval;
        this.#strict = options.strict;
        this.#queue = new options.queueClass();
        this.#queueClass = options.queueClass;
        this.concurrency = options.concurrency;
        if (options.timeout !== undefined && !(Number.isFinite(options.timeout) && options.timeout > 0)) {
            throw new TypeError(`Expected \`timeout\` to be a positive finite number, got \`${options.timeout}\` (${typeof options.timeout})`);
        }
        this.timeout = options.timeout;
        this.#isPaused = options.autoStart === false;
        this.#setupRateLimitTracking();
    }
    #cleanupStrictTicks(now) {
        // Remove ticks outside the current interval window using circular buffer approach
        while (this.#strictTicksStartIndex < this.#strictTicks.length) {
            const oldestTick = this.#strictTicks[this.#strictTicksStartIndex];
            if (oldestTick !== undefined && now - oldestTick >= this.#interval) {
                this.#strictTicksStartIndex++;
            }
            else {
                break;
            }
        }
        // Compact the array when it becomes inefficient or fully consumed
        // Compact when: (start index is large AND more than half wasted) OR all ticks expired
        const shouldCompact = (this.#strictTicksStartIndex > 100 && this.#strictTicksStartIndex > this.#strictTicks.length / 2)
            || this.#strictTicksStartIndex === this.#strictTicks.length;
        if (shouldCompact) {
            this.#strictTicks = this.#strictTicks.slice(this.#strictTicksStartIndex);
            this.#strictTicksStartIndex = 0;
        }
    }
    // Helper methods for interval consumption
    #consumeIntervalSlot(now) {
        if (this.#strict) {
            this.#strictTicks.push(now);
        }
        else {
            this.#intervalCount++;
        }
    }
    #rollbackIntervalSlot() {
        if (this.#strict) {
            // Pop from the end of the actual data (not from start index)
            if (this.#strictTicks.length > this.#strictTicksStartIndex) {
                this.#strictTicks.pop();
            }
        }
        else if (this.#intervalCount > 0) {
            this.#intervalCount--;
        }
    }
    #getActiveTicksCount() {
        return this.#strictTicks.length - this.#strictTicksStartIndex;
    }
    get #doesIntervalAllowAnother() {
        if (this.#isIntervalIgnored) {
            return true;
        }
        if (this.#strict) {
            // Cleanup already done by #isIntervalPausedAt before this is called
            return this.#getActiveTicksCount() < this.#intervalCap;
        }
        return this.#intervalCount < this.#intervalCap;
    }
    get #doesConcurrentAllowAnother() {
        return this.#pending < this.#concurrency;
    }
    #next() {
        this.#pending--;
        if (this.#pending === 0) {
            this.emit('pendingZero');
        }
        this.#tryToStartAnother();
        this.emit('next');
    }
    #onResumeInterval() {
        // Clear timeout ID before processing to prevent race condition
        // Must clear before #onInterval to allow new timeouts to be scheduled
        this.#timeoutId = undefined;
        this.#onInterval();
        this.#initializeIntervalIfNeeded();
    }
    #isIntervalPausedAt(now) {
        // Strict mode: check if we need to wait for oldest tick to age out
        if (this.#strict) {
            this.#cleanupStrictTicks(now);
            // If at capacity, need to wait for oldest tick to age out
            const activeTicksCount = this.#getActiveTicksCount();
            if (activeTicksCount >= this.#intervalCap) {
                const oldestTick = this.#strictTicks[this.#strictTicksStartIndex];
                // After cleanup, remaining ticks are within interval, so delay is always > 0
                const delay = this.#interval - (now - oldestTick);
                this.#createIntervalTimeout(delay);
                return true;
            }
            return false;
        }
        // Fixed window mode (original logic)
        if (this.#intervalId === undefined) {
            const delay = this.#intervalEnd - now;
            if (delay < 0) {
                // If the interval has expired while idle, check if we should enforce the interval
                // from the last task execution. This ensures proper spacing between tasks even
                // when the queue becomes empty and then new tasks are added.
                if (this.#lastExecutionTime > 0) {
                    const timeSinceLastExecution = now - this.#lastExecutionTime;
                    if (timeSinceLastExecution < this.#interval) {
                        // Not enough time has passed since the last task execution
                        this.#createIntervalTimeout(this.#interval - timeSinceLastExecution);
                        return true;
                    }
                }
                // Enough time has passed or no previous execution, allow execution
                this.#intervalCount = (this.#carryoverIntervalCount) ? this.#pending : 0;
            }
            else {
                // Act as the interval is pending
                this.#createIntervalTimeout(delay);
                return true;
            }
        }
        return false;
    }
    #createIntervalTimeout(delay) {
        if (this.#timeoutId !== undefined) {
            return;
        }
        this.#timeoutId = setTimeout(() => {
            this.#onResumeInterval();
        }, delay);
    }
    #clearIntervalTimer() {
        if (this.#intervalId) {
            clearInterval(this.#intervalId);
            this.#intervalId = undefined;
        }
    }
    #clearTimeoutTimer() {
        if (this.#timeoutId) {
            clearTimeout(this.#timeoutId);
            this.#timeoutId = undefined;
        }
    }
    #tryToStartAnother() {
        if (this.#queue.size === 0) {
            // We can clear the interval ("pause")
            // Because we can redo it later ("resume")
            this.#clearIntervalTimer();
            this.emit('empty');
            if (this.#pending === 0) {
                // Clear timeout as well when completely idle
                this.#clearTimeoutTimer();
                // Compact strict ticks when idle to free memory
                if (this.#strict && this.#strictTicksStartIndex > 0) {
                    const now = Date.now();
                    this.#cleanupStrictTicks(now);
                }
                this.emit('idle');
            }
            return false;
        }
        let taskStarted = false;
        if (!this.#isPaused) {
            const now = Date.now();
            const canInitializeInterval = !this.#isIntervalPausedAt(now);
            if (this.#doesIntervalAllowAnother && this.#doesConcurrentAllowAnother) {
                const job = this.#queue.dequeue();
                if (!this.#isIntervalIgnored) {
                    this.#consumeIntervalSlot(now);
                    this.#scheduleRateLimitUpdate();
                }
                this.emit('active');
                job();
                if (canInitializeInterval) {
                    this.#initializeIntervalIfNeeded();
                }
                taskStarted = true;
            }
        }
        return taskStarted;
    }
    #initializeIntervalIfNeeded() {
        if (this.#isIntervalIgnored || this.#intervalId !== undefined) {
            return;
        }
        // Strict mode uses timeouts instead of interval timers
        if (this.#strict) {
            return;
        }
        this.#intervalId = setInterval(() => {
            this.#onInterval();
        }, this.#interval);
        this.#intervalEnd = Date.now() + this.#interval;
    }
    #onInterval() {
        // Non-strict mode uses interval timers and intervalCount
        if (!this.#strict) {
            if (this.#intervalCount === 0 && this.#pending === 0 && this.#intervalId) {
                this.#clearIntervalTimer();
            }
            this.#intervalCount = this.#carryoverIntervalCount ? this.#pending : 0;
        }
        this.#processQueue();
        this.#scheduleRateLimitUpdate();
    }
    /**
    Executes all queued functions until it reaches the limit.
    */
    #processQueue() {
        // eslint-disable-next-line no-empty
        while (this.#tryToStartAnother()) { }
    }
    get concurrency() {
        return this.#concurrency;
    }
    set concurrency(newConcurrency) {
        if (!(typeof newConcurrency === 'number' && newConcurrency >= 1)) {
            throw new TypeError(`Expected \`concurrency\` to be a number from 1 and up, got \`${newConcurrency}\` (${typeof newConcurrency})`);
        }
        this.#concurrency = newConcurrency;
        this.#processQueue();
    }
    /**
    Updates the priority of a promise function by its id, affecting its execution order. Requires a defined concurrency limit to take effect.

    For example, this can be used to prioritize a promise function to run earlier.

    ```js
    import PQueue from 'p-queue';

    const queue = new PQueue({concurrency: 1});

    queue.add(async () => '🦄', {priority: 1});
    queue.add(async () => '🦀', {priority: 0, id: '🦀'});
    queue.add(async () => '🦄', {priority: 1});
    queue.add(async () => '🦄', {priority: 1});

    queue.setPriority('🦀', 2);
    ```

    In this case, the promise function with `id: '🦀'` runs second.

    You can also deprioritize a promise function to delay its execution:

    ```js
    import PQueue from 'p-queue';

    const queue = new PQueue({concurrency: 1});

    queue.add(async () => '🦄', {priority: 1});
    queue.add(async () => '🦀', {priority: 1, id: '🦀'});
    queue.add(async () => '🦄');
    queue.add(async () => '🦄', {priority: 0});

    queue.setPriority('🦀', -1);
    ```
    Here, the promise function with `id: '🦀'` executes last.
    */
    setPriority(id, priority) {
        if (typeof priority !== 'number' || !Number.isFinite(priority)) {
            throw new TypeError(`Expected \`priority\` to be a finite number, got \`${priority}\` (${typeof priority})`);
        }
        this.#queue.setPriority(id, priority);
    }
    async add(function_, options = {}) {
        // Create a copy to avoid mutating the original options object
        options = {
            timeout: this.timeout,
            ...options,
            // Assign unique ID if not provided
            id: options.id ?? (this.#idAssigner++).toString(),
        };
        return new Promise((resolve, reject) => {
            // Create a unique symbol for tracking this task
            const taskSymbol = Symbol(`task-${options.id}`);
            this.#queue.enqueue(async () => {
                this.#pending++;
                // Track this running task
                this.#runningTasks.set(taskSymbol, {
                    id: options.id,
                    priority: options.priority ?? 0, // Match priority-queue default
                    startTime: Date.now(),
                    timeout: options.timeout,
                });
                let eventListener;
                try {
                    // Check abort signal - if aborted, need to decrement the counter
                    // that was incremented in tryToStartAnother
                    try {
                        options.signal?.throwIfAborted();
                    }
                    catch (error) {
                        this.#rollbackIntervalConsumption();
                        // Clean up tracking before throwing
                        this.#runningTasks.delete(taskSymbol);
                        throw error;
                    }
                    this.#lastExecutionTime = Date.now();
                    let operation = function_({ signal: options.signal });
                    if (options.timeout) {
                        operation = pTimeout(Promise.resolve(operation), {
                            milliseconds: options.timeout,
                            message: `Task timed out after ${options.timeout}ms (queue has ${this.#pending} running, ${this.#queue.size} waiting)`,
                        });
                    }
                    if (options.signal) {
                        const { signal } = options;
                        operation = Promise.race([operation, new Promise((_resolve, reject) => {
                                eventListener = () => {
                                    reject(signal.reason);
                                };
                                signal.addEventListener('abort', eventListener, { once: true });
                            })]);
                    }
                    const result = await operation;
                    resolve(result);
                    this.emit('completed', result);
                }
                catch (error) {
                    reject(error);
                    this.emit('error', error);
                }
                finally {
                    // Clean up abort event listener
                    if (eventListener) {
                        options.signal?.removeEventListener('abort', eventListener);
                    }
                    // Remove from running tasks
                    this.#runningTasks.delete(taskSymbol);
                    // Use queueMicrotask to prevent deep recursion while maintaining timing
                    queueMicrotask(() => {
                        this.#next();
                    });
                }
            }, options);
            this.emit('add');
            this.#tryToStartAnother();
        });
    }
    async addAll(functions, options) {
        return Promise.all(functions.map(async (function_) => this.add(function_, options)));
    }
    /**
    Start (or resume) executing enqueued tasks within concurrency limit. No need to call this if queue is not paused (via `options.autoStart = false` or by `.pause()` method.)
    */
    start() {
        if (!this.#isPaused) {
            return this;
        }
        this.#isPaused = false;
        this.#processQueue();
        return this;
    }
    /**
    Put queue execution on hold.
    */
    pause() {
        this.#isPaused = true;
    }
    /**
    Clear the queue.
    */
    clear() {
        this.#queue = new this.#queueClass();
        // Clear interval timer since queue is now empty (consistent with #tryToStartAnother)
        this.#clearIntervalTimer();
        // Note: We preserve strict mode rate-limiting state (ticks and timeout)
        // because clear() only clears queued tasks, not rate limit history.
        // This ensures that rate limits are still enforced after clearing the queue.
        // Note: We don't clear #runningTasks as those tasks are still running
        // They will be removed when they complete in the finally block
        // Force synchronous update since clear() should have immediate effect
        this.#updateRateLimitState();
        // Emit events so waiters (onEmpty, onIdle, onSizeLessThan) can resolve
        this.emit('empty');
        if (this.#pending === 0) {
            this.#clearTimeoutTimer();
            this.emit('idle');
        }
        this.emit('next');
    }
    /**
    Can be called multiple times. Useful if you for example add additional items at a later time.

    @returns A promise that settles when the queue becomes empty.
    */
    async onEmpty() {
        // Instantly resolve if the queue is empty
        if (this.#queue.size === 0) {
            return;
        }
        await this.#onEvent('empty');
    }
    /**
    @returns A promise that settles when the queue size is less than the given limit: `queue.size < limit`.

    If you want to avoid having the queue grow beyond a certain size you can `await queue.onSizeLessThan()` before adding a new item.

    Note that this only limits the number of items waiting to start. There could still be up to `concurrency` jobs already running that this call does not include in its calculation.
    */
    async onSizeLessThan(limit) {
        // Instantly resolve if the queue is empty.
        if (this.#queue.size < limit) {
            return;
        }
        await this.#onEvent('next', () => this.#queue.size < limit);
    }
    /**
    The difference with `.onEmpty` is that `.onIdle` guarantees that all work from the queue has finished. `.onEmpty` merely signals that the queue is empty, but it could mean that some promises haven't completed yet.

    @returns A promise that settles when the queue becomes empty, and all promises have completed; `queue.size === 0 && queue.pending === 0`.
    */
    async onIdle() {
        // Instantly resolve if none pending and if nothing else is queued
        if (this.#pending === 0 && this.#queue.size === 0) {
            return;
        }
        await this.#onEvent('idle');
    }
    /**
    The difference with `.onIdle` is that `.onPendingZero` only waits for currently running tasks to finish, ignoring queued tasks.

    @returns A promise that settles when all currently running tasks have completed; `queue.pending === 0`.
    */
    async onPendingZero() {
        if (this.#pending === 0) {
            return;
        }
        await this.#onEvent('pendingZero');
    }
    /**
    @returns A promise that settles when the queue becomes rate-limited due to intervalCap.
    */
    async onRateLimit() {
        if (this.isRateLimited) {
            return;
        }
        await this.#onEvent('rateLimit');
    }
    /**
    @returns A promise that settles when the queue is no longer rate-limited.
    */
    async onRateLimitCleared() {
        if (!this.isRateLimited) {
            return;
        }
        await this.#onEvent('rateLimitCleared');
    }
    /**
    @returns A promise that rejects when any task in the queue errors.

    Use with `Promise.race([queue.onError(), queue.onIdle()])` to fail fast on the first error while still resolving normally when the queue goes idle.

    Important: The promise returned by `add()` still rejects. You must handle each `add()` promise (for example, `.catch(() => {})`) to avoid unhandled rejections.

    @example
    ```
    import PQueue from 'p-queue';

    const queue = new PQueue({concurrency: 2});

    queue.add(() => fetchData(1)).catch(() => {});
    queue.add(() => fetchData(2)).catch(() => {});
    queue.add(() => fetchData(3)).catch(() => {});

    // Stop processing on first error
    try {
        await Promise.race([
            queue.onError(),
            queue.onIdle()
        ]);
    } catch (error) {
        queue.pause(); // Stop processing remaining tasks
        console.error('Queue failed:', error);
    }
    ```
    */
    // eslint-disable-next-line @typescript-eslint/promise-function-async
    onError() {
        return new Promise((_resolve, reject) => {
            const handleError = (error) => {
                this.off('error', handleError);
                reject(error);
            };
            this.on('error', handleError);
        });
    }
    async #onEvent(event, filter) {
        return new Promise(resolve => {
            const listener = () => {
                if (filter && !filter()) {
                    return;
                }
                this.off(event, listener);
                resolve();
            };
            this.on(event, listener);
        });
    }
    /**
    Size of the queue, the number of queued items waiting to run.
    */
    get size() {
        return this.#queue.size;
    }
    /**
    Size of the queue, filtered by the given options.

    For example, this can be used to find the number of items remaining in the queue with a specific priority level.
    */
    sizeBy(options) {
        // eslint-disable-next-line unicorn/no-array-callback-reference
        return this.#queue.filter(options).length;
    }
    /**
    Number of running items (no longer in the queue).
    */
    get pending() {
        return this.#pending;
    }
    /**
    Whether the queue is currently paused.
    */
    get isPaused() {
        return this.#isPaused;
    }
    #setupRateLimitTracking() {
        // Only schedule updates when rate limiting is enabled
        if (this.#isIntervalIgnored) {
            return;
        }
        // Wire up to lifecycle events that affect rate limit state
        // Only 'add' and 'next' can actually change rate limit state
        this.on('add', () => {
            if (this.#queue.size > 0) {
                this.#scheduleRateLimitUpdate();
            }
        });
        this.on('next', () => {
            this.#scheduleRateLimitUpdate();
        });
    }
    #scheduleRateLimitUpdate() {
        // Skip if rate limiting is not enabled or already scheduled
        if (this.#isIntervalIgnored || this.#rateLimitFlushScheduled) {
            return;
        }
        this.#rateLimitFlushScheduled = true;
        queueMicrotask(() => {
            this.#rateLimitFlushScheduled = false;
            this.#updateRateLimitState();
        });
    }
    #rollbackIntervalConsumption() {
        if (this.#isIntervalIgnored) {
            return;
        }
        this.#rollbackIntervalSlot();
        this.#scheduleRateLimitUpdate();
    }
    #updateRateLimitState() {
        const previous = this.#rateLimitedInInterval;
        // Early exit if rate limiting is disabled or queue is empty
        if (this.#isIntervalIgnored || this.#queue.size === 0) {
            if (previous) {
                this.#rateLimitedInInterval = false;
                this.emit('rateLimitCleared');
            }
            return;
        }
        // Get the current count based on mode
        let count;
        if (this.#strict) {
            const now = Date.now();
            this.#cleanupStrictTicks(now);
            count = this.#getActiveTicksCount();
        }
        else {
            count = this.#intervalCount;
        }
        const shouldBeRateLimited = count >= this.#intervalCap;
        if (shouldBeRateLimited !== previous) {
            this.#rateLimitedInInterval = shouldBeRateLimited;
            this.emit(shouldBeRateLimited ? 'rateLimit' : 'rateLimitCleared');
        }
    }
    /**
    Whether the queue is currently rate-limited due to intervalCap.
    */
    get isRateLimited() {
        return this.#rateLimitedInInterval;
    }
    /**
    Whether the queue is saturated. Returns `true` when:
    - All concurrency slots are occupied and tasks are waiting, OR
    - The queue is rate-limited and tasks are waiting

    Useful for detecting backpressure and potential hanging tasks.

    ```js
    import PQueue from 'p-queue';

    const queue = new PQueue({concurrency: 2});

    // Backpressure handling
    if (queue.isSaturated) {
        console.log('Queue is saturated, waiting for capacity...');
        await queue.onSizeLessThan(queue.concurrency);
    }

    // Monitoring for stuck tasks
    setInterval(() => {
        if (queue.isSaturated) {
            console.warn(`Queue saturated: ${queue.pending} running, ${queue.size} waiting`);
        }
    }, 60000);
    ```
    */
    get isSaturated() {
        return (this.#pending === this.#concurrency && this.#queue.size > 0)
            || (this.isRateLimited && this.#queue.size > 0);
    }
    /**
    The tasks currently being executed. Each task includes its `id`, `priority`, `startTime`, and `timeout` (if set).

    Returns an array of task info objects.

    ```js
    import PQueue from 'p-queue';

    const queue = new PQueue({concurrency: 2});

    // Add tasks with IDs for better debugging
    queue.add(() => fetchUser(123), {id: 'user-123'});
    queue.add(() => fetchPosts(456), {id: 'posts-456', priority: 1});

    // Check what's running
    console.log(queue.runningTasks);
    // => [{
    //   id: 'user-123',
    //   priority: 0,
    //   startTime: 1759253001716,
    //   timeout: undefined
    // }, {
    //   id: 'posts-456',
    //   priority: 1,
    //   startTime: 1759253001916,
    //   timeout: undefined
    // }]
    ```
    */
    get runningTasks() {
        // Return fresh array with fresh objects to prevent mutations
        return [...this.#runningTasks.values()].map(task => ({ ...task }));
    }
}

async function getBeasties(outDir, options = {}) {
  try {
    const BeastiesClass = (await import('beasties')).default;
    return new BeastiesClass({
      path: outDir,
      logLevel: "warn",
      external: true,
      inlineFonts: true,
      preloadFonts: true,
      ...options
    });
  } catch {
  }
}

function renderPreloadLinks(document, modules, ssrManifest) {
  const seen = /* @__PURE__ */ new Set();
  const preloadLinks = [];
  Array.from(modules).forEach((id) => {
    const files = ssrManifest[id] || [];
    files.forEach((file) => {
      if (!preloadLinks.includes(file))
        preloadLinks.push(file);
    });
  });
  if (preloadLinks) {
    preloadLinks.forEach((file) => {
      if (!seen.has(file)) {
        seen.add(file);
        renderPreloadLink(document, file);
      }
    });
  }
}
function renderPreloadLink(document, file) {
  if (file.endsWith(".js")) {
    appendLink(document, {
      rel: "modulepreload",
      crossOrigin: "",
      href: file
    });
  } else if (file.endsWith(".css")) {
    appendLink(document, {
      rel: "stylesheet",
      href: file
    });
  }
}
function createLink(document) {
  return document.createElement("link");
}
function setAttrs(el, attrs) {
  const keys = Object.keys(attrs);
  for (const key of keys)
    el.setAttribute(key, attrs[key]);
}
function appendLink(document, attrs) {
  const exits = document.head.querySelector(`link[href='${attrs.file}']`);
  if (exits)
    return;
  const link = createLink(document);
  setAttrs(link, attrs);
  document.head.appendChild(link);
}

function buildLog(text, count) {
  console.log(`
${gray("[vite-ssg]")} ${yellow(text)}${count ? blue(` (${count})`) : ""}`);
}
function getSize(str) {
  return `${(str.length / 1024).toFixed(2)} KiB`;
}
async function prepareHtmlFileName(filename, htmlFileName) {
  filename = filename.replace(/\\/g, "/");
  if (!htmlFileName)
    return filename;
  const newFileName = await htmlFileName(filename);
  return newFileName || filename;
}
function routesToPaths(routes) {
  if (!routes)
    return ["/"];
  const paths = /* @__PURE__ */ new Set();
  const getPaths = (routes2, prefix = "") => {
    prefix = prefix.replace(/\/$/g, "");
    for (const route of routes2) {
      let path = route.path;
      if (route.path != null) {
        path = prefix && !route.path.startsWith("/") ? `${prefix}${route.path ? `/${route.path}` : ""}` : route.path;
        paths.add(path);
      }
      if (Array.isArray(route.children))
        getPaths(route.children, path);
    }
  };
  getPaths(routes);
  return Array.from(paths);
}

function DefaultIncludedRoutes(paths, _routes) {
  return paths.filter((i) => !i.includes(":") && !i.includes("*"));
}
async function build(ssgOptions = {}, viteConfig = {}) {
  const nodeEnv = process.env.NODE_ENV || "production";
  const mode = process.env.MODE || ssgOptions.mode || nodeEnv;
  const config = await resolveConfig(viteConfig, "build", mode, nodeEnv);
  const cwd = process.cwd();
  const root = config.root || cwd;
  const ssgOutTempFolder = resolve(root, ".vite-ssg-temp");
  const ssgOut = resolve(ssgOutTempFolder, Math.random().toString(36).substring(2, 12));
  const outDir = config.build.outDir || "dist";
  const out = isAbsolute(outDir) ? outDir : resolve(root, outDir);
  const mergedOptions = Object.assign({}, config.ssgOptions || {}, ssgOptions);
  const {
    script = "sync",
    mock = false,
    entry = await detectEntry(root),
    formatting = "none",
    includedRoutes: configIncludedRoutes = DefaultIncludedRoutes,
    onBeforePageRender,
    onPageRendered,
    onFinished,
    dirStyle = "flat",
    includeAllRoutes = false,
    concurrency = 20,
    rootContainerId = "app",
    base,
    htmlFileName
  } = mergedOptions;
  const beastiesOptions = mergedOptions.beastiesOptions ?? {};
  if (existsSync(ssgOutTempFolder))
    await fs.rm(ssgOutTempFolder, { recursive: true });
  buildLog("Build for client...");
  await build$1(mergeConfig(viteConfig, {
    base,
    build: {
      ssrManifest: true,
      rollupOptions: {
        input: {
          app: resolve(root, "./index.html")
        }
      }
    },
    mode: config.mode
  }));
  if (mock) {
    const { jsdomGlobal } = await import('../chunks/jsdomGlobal.mjs');
    jsdomGlobal();
  }
  buildLog("Build for server...");
  process.env.VITE_SSG = "true";
  const ssrEntry = await resolveAlias(config, entry);
  await build$1(mergeConfig(viteConfig, {
    base,
    build: {
      ssr: ssrEntry,
      outDir: ssgOut,
      minify: false,
      cssCodeSplit: false,
      rollupOptions: {
        output: {
          entryFileNames: "[name].mjs",
          format: "esm"
        }
      }
    },
    mode: config.mode,
    ssr: {
      noExternal: ["vite-ssg"]
    }
  }));
  const serverEntry = pathToFileURL(resolve(ssgOut, `${parse(ssrEntry).name}.mjs`)).href;
  const {
    createApp,
    includedRoutes: serverEntryIncludedRoutes
  } = await import(serverEntry);
  const includedRoutes = serverEntryIncludedRoutes || configIncludedRoutes;
  const { routes } = await createApp();
  let routesPaths = includeAllRoutes ? routesToPaths(routes) : await includedRoutes(routesToPaths(routes), routes || []);
  routesPaths = Array.from(new Set(routesPaths));
  buildLog("Rendering Pages...", routesPaths.length);
  const beasties = beastiesOptions !== false ? await getBeasties(outDir, beastiesOptions) : void 0;
  if (beasties)
    console.log(`${gray("[vite-ssg]")} ${blue("Critical CSS generation enabled via `beasties`")}`);
  const {
    path: _ssrManifestPath,
    content: ssrManifestRaw
  } = await readFiles(
    resolve(out, ".vite", "ssr-manifest.json"),
    // Vite 5
    resolve(out, "ssr-manifest.json")
    // Vite 4 and below
  );
  const ssrManifest = JSON.parse(ssrManifestRaw);
  let indexHTML = await fs.readFile(resolve(out, "index.html"), "utf-8");
  indexHTML = rewriteScripts(indexHTML, script);
  const { renderToString } = await import('vue/server-renderer');
  const queue = new PQueue({ concurrency });
  for (const route of routesPaths) {
    queue.add(async () => {
      try {
        const appCtx = await createApp(route);
        const { app, router, head, initialState, triggerOnSSRAppRendered, transformState = serializeState } = appCtx;
        if (router) {
          await router.push(route);
          await router.isReady();
        }
        const transformedIndexHTML = await onBeforePageRender?.(route, indexHTML, appCtx) || indexHTML;
        const ctx = {};
        const appHTML = await renderToString(app, ctx);
        await triggerOnSSRAppRendered?.(route, appHTML, appCtx);
        const renderedHTML = await renderHTML({
          rootContainerId,
          indexHTML: transformedIndexHTML,
          appHTML,
          initialState: transformState(initialState)
        });
        const jsdom = new JSDOM(renderedHTML);
        renderPreloadLinks(jsdom.window.document, ctx.modules || /* @__PURE__ */ new Set(), ssrManifest);
        if (head)
          await renderDOMHead(head, { document: jsdom.window.document });
        const html = jsdom.serialize();
        let transformed = await onPageRendered?.(route, html, appCtx) || html;
        if (beasties)
          transformed = await beasties.process(transformed);
        const formatted = await formatHtml(transformed, formatting);
        const relativeRouteFile = `${(route.endsWith("/") ? `${route}index` : route).replace(/^\//g, "")}.html`;
        const filename = await prepareHtmlFileName(
          dirStyle === "nested" ? join(route.replace(/^\//g, ""), "index.html") : relativeRouteFile,
          htmlFileName
        );
        await fs.mkdir(resolve(out, dirname(filename)), { recursive: true });
        await fs.writeFile(resolve(out, filename), formatted, "utf-8");
        config.logger.info(
          `${dim(`${outDir}/`)}${cyan(filename.padEnd(15, " "))}  ${dim(getSize(formatted))}`
        );
      } catch (err) {
        throw new Error(`${gray("[vite-ssg]")} ${red(`Error on page: ${cyan(route)}`)}
${err.stack}`);
      }
    });
  }
  await queue.start().onIdle();
  await fs.rm(ssgOutTempFolder, { recursive: true, force: true });
  const pwaPlugin = config.plugins.find((i) => i.name === "vite-plugin-pwa")?.api;
  if (pwaPlugin && !pwaPlugin.disabled && pwaPlugin.generateSW) {
    buildLog("Regenerate PWA...");
    await pwaPlugin.generateSW();
  }
  console.log(`
${gray("[vite-ssg]")} ${green("Build finished.")}`);
  await onFinished?.();
}
async function detectEntry(root) {
  const scriptSrcReg = /<script.*?src=["'](.+?)["'](?!<).*>\s*<\/script>/gi;
  const html = await fs.readFile(resolve(root, "index.html"), "utf-8");
  const scripts = [...html.matchAll(scriptSrcReg)];
  const [, entry] = scripts.find((matchResult) => {
    const [script] = matchResult;
    const [, scriptType] = script.match(/.*\stype=(?:'|")?([^>'"\s]+)/i) || [];
    return scriptType === "module";
  }) || [];
  return entry || "src/main.ts";
}
async function resolveAlias(config, entry) {
  const resolver = config.createResolver();
  const result = await resolver(entry, config.root);
  return result || resolve(config.root, entry);
}
function rewriteScripts(indexHTML, mode) {
  if (!mode || mode === "sync")
    return indexHTML;
  return indexHTML.replace(/<script type="module" /g, `<script type="module" ${mode} `);
}
async function renderHTML({
  rootContainerId,
  indexHTML,
  appHTML,
  initialState
}) {
  const stateScript = initialState ? `
<script>window.__INITIAL_STATE__=${initialState}<\/script>` : "";
  const container = `<div id="${rootContainerId}"></div>`;
  if (indexHTML.includes(container)) {
    return indexHTML.replace(
      container,
      () => `<div id="${rootContainerId}" data-server-rendered="true">${appHTML}</div>${stateScript}`
    );
  }
  const html5Parser = await import('html5parser');
  const ast = html5Parser.parse(indexHTML);
  let renderedOutput;
  html5Parser.walk(ast, {
    enter: (node) => {
      if (!renderedOutput && node?.type === html5Parser.SyntaxKind.Tag && Array.isArray(node.attributes) && node.attributes.length > 0 && node.attributes.some((attr) => attr.name.value === "id" && attr.value?.value === rootContainerId)) {
        const attributesStringified = [...node.attributes.map(({ name: { value: name }, value }) => `${name}="${value.value}"`)].join(" ");
        const indexHTMLBefore = indexHTML.slice(0, node.start);
        const indexHTMLAfter = indexHTML.slice(node.end);
        renderedOutput = `${indexHTMLBefore}<${node.name} ${attributesStringified} data-server-rendered="true">${appHTML}</${node.name}>${stateScript}${indexHTMLAfter}`;
      }
    }
  });
  if (!renderedOutput)
    throw new Error(`Could not find a tag with id="${rootContainerId}" to replace it with server-side rendered HTML`);
  return renderedOutput;
}
async function formatHtml(html, formatting) {
  if (formatting === "minify") {
    const htmlMinifier = await import('html-minifier-terser');
    return await htmlMinifier.minify(html, {
      collapseWhitespace: true,
      caseSensitive: true,
      collapseInlineTagWhitespace: false,
      minifyJS: true,
      minifyCSS: true
    });
  } else if (formatting === "prettify") {
    const prettier = (await import('prettier')).default;
    return await prettier.format(html, { semi: false, parser: "html" });
  }
  return html;
}
async function readFiles(...paths) {
  for (const path of paths) {
    if (existsSync(path)) {
      return {
        path,
        content: await fs.readFile(path, "utf-8")
      };
    }
  }
  throw new Error(`Could not find any of the following files: ${paths.join(", ")}`);
}

export { build as b };
