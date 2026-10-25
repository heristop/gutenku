import { AbstractStreamReader } from './AbstractStreamReader.js';
import { Deferred } from './Deferred.js';
import { AbortError } from './Errors.js';
/**
 * Node.js Readable Stream Reader
 * Ref: https://nodejs.org/api/stream.html#readable-streams
 */
export class StreamReader extends AbstractStreamReader {
    constructor(s) {
        super();
        this.s = s;
        /**
         * Pending requests waiting for data, tracked until completion or cancellation
         */
        this.pendingRequests = new Set();
        if (!s.read || !s.once) {
            throw new Error('Expected an instance of stream.Readable');
        }
        this.s.once('end', () => {
            this.endOfStream = true;
            for (const request of this.pendingRequests) {
                this.removeRequest(request);
                request.deferred.resolve(0);
            }
        });
        this.s.once('error', err => this.reject(err));
        this.s.once('close', () => {
            // Normal EOF may leave peeked bytes that the caller still needs to consume.
            if (!this.endOfStream) {
                void this.abort();
            }
        });
    }
    /**
     * Read chunk from stream
     * @param buffer Target Uint8Array (or Buffer) to store data read from stream in
     * @param mayBeLess - If true, may fill the buffer partially
     * @returns Number of bytes read
     */
    async readFromStream(buffer, mayBeLess) {
        if (buffer.length === 0) {
            return 0;
        }
        const readBuffer = this.s.read(buffer.length);
        if (readBuffer) {
            buffer.set(readBuffer);
            return readBuffer.length;
        }
        const request = {
            buffer,
            mayBeLess,
            deferred: new Deferred(),
            onReadable: () => this.readDeferred(request)
        };
        this.pendingRequests.add(request);
        this.s.once('readable', request.onReadable);
        return request.deferred.promise;
    }
    /**
     * Process deferred read request
     * @param request Deferred read request
     */
    readDeferred(request) {
        if (this.interrupted || !this.pendingRequests.has(request)) {
            return;
        }
        try {
            const readBuffer = this.s.read(request.buffer.length);
            // Reading may synchronously emit an error or close event that cancels the request.
            if (!this.pendingRequests.has(request)) {
                return;
            }
            if (readBuffer) {
                request.buffer.set(readBuffer);
                this.removeRequest(request);
                request.deferred.resolve(readBuffer.length);
            }
            else {
                this.s.once('readable', request.onReadable);
            }
        }
        catch (error) {
            this.reject(error instanceof Error ? error : new Error(String(error)));
        }
    }
    removeRequest(request) {
        this.s.removeListener('readable', request.onReadable);
        this.pendingRequests.delete(request);
    }
    reject(err) {
        this.interrupted = true;
        this.peekQueue = [];
        for (const request of this.pendingRequests) {
            this.removeRequest(request);
            request.deferred.reject(err);
        }
    }
    async abort() {
        this.reject(new AbortError());
    }
    async close() {
        return this.abort();
    }
}
