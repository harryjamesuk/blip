import * as util from "util";

/**
 * Object that can be optionally passed to the {@link BlipError} constructor to configure the error.
 * @see {@link BlipError}
 */
export type BlipOptions = {
    /**
     * {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Status | HTTP Status code} between 100 and 599 inclusive.
     */
    statusCode?: number;
    /**
     * The root error that caused this error.
     */
    rootErr?: Error;
    /**
     * Additional metadata to attach to the error.
     */
    data?: object;
}

/**
 * Base class for all Blip Errors.
 * @private
 * @privateRemarks
 * This class contains shared functionality that will be used by the client and the server.
 */
class BlipBase extends Error {
    /**
     * Name of the Error - always `'BlipError'`.
     */
    readonly name = 'BlipError';
    /**
     * A `message` associated with the error.
     * @defaultValue ''
     *
     * @remarks This is designed to be public-facing.
     */
    readonly message: string;
    /**
     * Stack trace associated with the `Error`.
     * @defaultValue
     * The default is the stack trace of `rootErr` if provided in {@link BlipOptions}, otherwise the stack trace
     * of the {@link BlipError} which is automatically generated.
     */
    readonly stack: string|undefined;
    /**
     * {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Status | HTTP Status code} associated with the error.
     * @see {@link BlipOptions}
     */
    readonly statusCode: number;
    /**
     * Metadata associated with the error.
     * @see {@link BlipOptions}
     */
    readonly data: object|undefined;
    /**
     * truthy when the error is a server error (status code >= 500), otherwise falsy.
     */
    readonly server: boolean;
    /**
     * @internal
     * For internal use - use {@link BlipError.rootErr} instead.
     *
     * @privateRemarks
     * Used by `BlipError` in `get rootErr()`.
     * Used by `BlipInspectionError` to expose a non-error object 'rootErr' for inspection without
     * a repeated stack trace. We must also use `_rootErr` for this reason because the key
     * in inspection should be `rootErr`, and we can't have conflicting properties.
     */
    readonly _rootErr: Error|undefined;
    /**
     * @private
     * @privateRemarks
     * Used to store the original stack trace of the `BlipError`.
     * Not for public use - use `get originalStack()` instead.
     */
    private readonly _stack?: string;

    constructor(message?: string, options?: BlipOptions) {
        super(message);
        this.name = 'BlipError';
        this.message = message || '';
        this.statusCode = options?.statusCode || 500;
        this.data = options?.data;
        this._rootErr = options?.rootErr;

        if (this.statusCode < 100 || this.statusCode > 599) {
            throw new Error(`Invalid status code: ${this.statusCode}`);
        } else {
            this.server = this.statusCode >= 500; // set server flag
        }

        if (options?.rootErr?.stack) {
            // Override stack trace if a rootErr is provided.
            this._stack = this.stack;
            this.stack = options.rootErr.stack;
        }

        Object.keys(this).forEach(key => {
            Object.defineProperty(this, key, { enumerable: false });
        });
    }

    /**
     * Used to obtain the original `stack` when a `rootErr` was provided.
     * (If a `rootErr.stack` is present, it will take the place of the {@link BlipError} `stack`).
     */
    get originalStack() {
        return this._stack ?? this.stack;
    }

    /**
     * Alias for {@link statusCode}.
     * @alias {@link statusCode}
     */
    get code() {
        return this.statusCode;
    }
    /**
     * Alias for {@link statusCode}.
     * @alias {@link statusCode}
     */
    get status() {
        return this.statusCode
    }
}

/**
 * A `BlipError` is an error constructed with special considerations for HTTP clients.
 *
 * A `BlipError` is safe for public APIs by default. It will not expose any sensitive information used directly.
 * @see {@link inspection} for remarks on using the error for inspection on server-side.
 * @public
 */
export default class BlipError extends BlipBase {
    /**
     * A special representation of {@link BlipError} that can be inspected by the `console`
     * or used in custom logging solutions.
     *
     * @see {@link BlipInspectionError} for more information and remarks.
     */
    readonly inspection: BlipInspectionError;
    /**
     * @private
     * @privateRemarks
     * Enumerable property that will be exposed as the value of a {@link BlipError}.
     * This is what the end-user will see on public APIs when writing a `res.json(blipErr)`.
     */
    private readonly err;

    /**
     * Creates a new {@link BlipError}.
     * @constructor
     * @param {string} [message=''] - The error message.
     * @param {BlipOptions} [options] - An object containing options for the error.
     */
    constructor(message?: string, options?: BlipOptions) {
        super(message, options);
        this.inspection = new BlipInspectionError(this.message, options);
        this.err = {
            message: this.message,
            statusCode: this.statusCode
        }

        Object.defineProperty(this, 'inspection', { enumerable: false });
    }

    /** @private */
    [util.inspect.custom]() {
        return this.inspection;
    }

    /**
     * Returns the root error that caused this error, if one was provided as {@link BlipOptions}' `rootErr`.
     */
    get rootErr() {
        return this._rootErr;
    }

    /**
     * Alias for {@link inspection}.
     * @alias {@link inspection}
     */
    get log() {
        return this.inspection;
    }

    /**
     * Alias for {@link inspection}.
     * @alias {@link inspection}
     */
    get inspect() {
        return this.inspection;
    }
}

/**
 * A `BlipInspectionError` is a special representation of {@link BlipError} that can
 * be inspected by the `console` or used in custom logging solutions.
 *
 * @remarks
 * {@link BlipError} instances can be inspected directly when using the `console` in Node.js,
 * without the need to use `.inspection`.
 * Some custom logging solutions such as {@link https://github.com/pinojs/pino | Pino}
 * and {@link https://github.com/winstonjs/winston | Winston} may omit/repeat data and
 * require the use of `.inspection` to be represented correctly.
 * For example, `rootErr` may be omitted from the logs without `.inspection`.
 */
export class BlipInspectionError extends BlipBase {
    /**
     * @private
     * @privateRemarks
     * Used in the transformation of this._rootErr to expose a non-error object `rootErr`
     * for inspection without a repeated stack trace.
     */
    private readonly rootErr?: { name: string; message: string; };

    /**
     * @internal Should not be used directly.
     * @constructor
     * @param {string} [message=''] - The error message.
     * @param {BlipOptions} [options] - An object containing options for the error.
     */
    constructor(message?: string, options?: BlipOptions) {
        super(message, options);

        if (this._rootErr) {
            this.rootErr = {
                name: this._rootErr.name,
                message: this._rootErr.message,
            }
        }

        Object.defineProperty(this, 'statusCode', { enumerable: true });
        Object.defineProperty(this, 'server', { enumerable: true });
        Object.defineProperty(this, 'data', { enumerable: true });
    }

    /** @private */
    [util.inspect.custom]() {
        console.log(`${this.name}: ${this.message}:`);
        return this;
    }
}
