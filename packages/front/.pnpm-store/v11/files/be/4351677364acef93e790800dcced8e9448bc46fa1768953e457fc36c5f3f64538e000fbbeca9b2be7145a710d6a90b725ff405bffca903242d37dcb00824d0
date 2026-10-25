import { CLIENT_KILL_FILTERS } from './CLIENT_KILL';
import { FAILOVER_MODES } from './CLUSTER_FAILOVER';
import { CLUSTER_SLOT_STATES } from './CLUSTER_SETSLOT';
import { COMMAND_LIST_FILTER_BY } from './COMMAND_LIST';
import { REDIS_FLUSH_MODES } from './FLUSHALL';
export { CLIENT_KILL_FILTERS, FAILOVER_MODES, CLUSTER_SLOT_STATES, COMMAND_LIST_FILTER_BY, REDIS_FLUSH_MODES };
export { SetOptions } from './SET';
declare const _default: {
    readonly ACL_CAT: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, categoryName?: import("../RESP/types").RedisArgument | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly aclCat: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, categoryName?: import("../RESP/types").RedisArgument | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly ACL_DELUSER: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, username: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly aclDelUser: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, username: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly ACL_DRYRUN: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, username: import("../RESP/types").RedisArgument, command: import("../RESP/types").RedisArgument[]) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string> | import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly aclDryRun: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, username: import("../RESP/types").RedisArgument, command: import("../RESP/types").RedisArgument[]) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string> | import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly ACL_GENPASS: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, bits?: number | undefined) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    readonly aclGenPass: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, bits?: number | undefined) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    readonly ACL_GETUSER: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, username: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: {
            readonly 2: (reply: [import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<42, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>, import("../RESP/types").BlobStringReply<"passwords">, import("../RESP/types").RespType<42, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>, import("../RESP/types").BlobStringReply<"commands">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"keys">, import("../RESP/types").BlobStringReply<string> | import("../RESP/types").RespType<42, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>, import("../RESP/types").BlobStringReply<"channels">, import("../RESP/types").BlobStringReply<string> | import("../RESP/types").RespType<42, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>, import("../RESP/types").BlobStringReply<"selectors">, import("../RESP/types").RespType<42, import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"commands">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"keys">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"channels">, import("../RESP/types").BlobStringReply<string>], never, [import("../RESP/types").BlobStringReply<"commands">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"keys">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"channels">, import("../RESP/types").BlobStringReply<string>]>[], never, import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"commands">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"keys">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"channels">, import("../RESP/types").BlobStringReply<string>], never, [import("../RESP/types").BlobStringReply<"commands">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"keys">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"channels">, import("../RESP/types").BlobStringReply<string>]>[]>]) => {
                flags: import("../RESP/types").RespType<42, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>;
                passwords: import("../RESP/types").RespType<42, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>;
                commands: import("../RESP/types").BlobStringReply<string>;
                keys: import("../RESP/types").BlobStringReply<string> | import("../RESP/types").RespType<42, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>;
                channels: import("../RESP/types").BlobStringReply<string> | import("../RESP/types").RespType<42, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>;
                selectors: {
                    commands: import("../RESP/types").BlobStringReply<string>;
                    keys: import("../RESP/types").BlobStringReply<string>;
                    channels: import("../RESP/types").BlobStringReply<string>;
                }[];
            };
            readonly 3: () => import("../RESP/types").TuplesToMapReply<[[import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>], [import("../RESP/types").BlobStringReply<"passwords">, import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>], [import("../RESP/types").BlobStringReply<"commands">, import("../RESP/types").BlobStringReply<string>], [import("../RESP/types").BlobStringReply<"keys">, import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>> | import("../RESP/types").BlobStringReply<string>], [import("../RESP/types").BlobStringReply<"channels">, import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>> | import("../RESP/types").BlobStringReply<string>], [import("../RESP/types").BlobStringReply<"selectors">, import("../RESP/types").ArrayReply<import("../RESP/types").TuplesToMapReply<[[import("../RESP/types").BlobStringReply<"commands">, import("../RESP/types").BlobStringReply<string>], [import("../RESP/types").BlobStringReply<"keys">, import("../RESP/types").BlobStringReply<string>], [import("../RESP/types").BlobStringReply<"channels">, import("../RESP/types").BlobStringReply<string>]]>>]]>;
        };
    };
    readonly aclGetUser: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, username: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: {
            readonly 2: (reply: [import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<42, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>, import("../RESP/types").BlobStringReply<"passwords">, import("../RESP/types").RespType<42, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>, import("../RESP/types").BlobStringReply<"commands">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"keys">, import("../RESP/types").BlobStringReply<string> | import("../RESP/types").RespType<42, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>, import("../RESP/types").BlobStringReply<"channels">, import("../RESP/types").BlobStringReply<string> | import("../RESP/types").RespType<42, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>, import("../RESP/types").BlobStringReply<"selectors">, import("../RESP/types").RespType<42, import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"commands">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"keys">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"channels">, import("../RESP/types").BlobStringReply<string>], never, [import("../RESP/types").BlobStringReply<"commands">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"keys">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"channels">, import("../RESP/types").BlobStringReply<string>]>[], never, import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"commands">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"keys">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"channels">, import("../RESP/types").BlobStringReply<string>], never, [import("../RESP/types").BlobStringReply<"commands">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"keys">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"channels">, import("../RESP/types").BlobStringReply<string>]>[]>]) => {
                flags: import("../RESP/types").RespType<42, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>;
                passwords: import("../RESP/types").RespType<42, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>;
                commands: import("../RESP/types").BlobStringReply<string>;
                keys: import("../RESP/types").BlobStringReply<string> | import("../RESP/types").RespType<42, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>;
                channels: import("../RESP/types").BlobStringReply<string> | import("../RESP/types").RespType<42, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>;
                selectors: {
                    commands: import("../RESP/types").BlobStringReply<string>;
                    keys: import("../RESP/types").BlobStringReply<string>;
                    channels: import("../RESP/types").BlobStringReply<string>;
                }[];
            };
            readonly 3: () => import("../RESP/types").TuplesToMapReply<[[import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>], [import("../RESP/types").BlobStringReply<"passwords">, import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>], [import("../RESP/types").BlobStringReply<"commands">, import("../RESP/types").BlobStringReply<string>], [import("../RESP/types").BlobStringReply<"keys">, import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>> | import("../RESP/types").BlobStringReply<string>], [import("../RESP/types").BlobStringReply<"channels">, import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>> | import("../RESP/types").BlobStringReply<string>], [import("../RESP/types").BlobStringReply<"selectors">, import("../RESP/types").ArrayReply<import("../RESP/types").TuplesToMapReply<[[import("../RESP/types").BlobStringReply<"commands">, import("../RESP/types").BlobStringReply<string>], [import("../RESP/types").BlobStringReply<"keys">, import("../RESP/types").BlobStringReply<string>], [import("../RESP/types").BlobStringReply<"channels">, import("../RESP/types").BlobStringReply<string>]]>>]]>;
        };
    };
    readonly ACL_LIST: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly aclList: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly ACL_LOAD: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly aclLoad: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly ACL_LOG_RESET: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly aclLogReset: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly ACL_LOG: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, count?: number | undefined) => void;
        readonly transformReply: {
            readonly 2: (reply: import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"count">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"reason">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"context">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"object">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"username">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"age-seconds">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"client-info">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"entry-id">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"timestamp-created">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"timestamp-last-updated">, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").BlobStringReply<"count">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"reason">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"context">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"object">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"username">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"age-seconds">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"client-info">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"entry-id">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"timestamp-created">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"timestamp-last-updated">, import("../RESP/types").NumberReply<number>]>[], preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
                count: import("../RESP/types").NumberReply<number>;
                reason: import("../RESP/types").BlobStringReply<string>;
                context: import("../RESP/types").BlobStringReply<string>;
                object: import("../RESP/types").BlobStringReply<string>;
                username: import("../RESP/types").BlobStringReply<string>;
                'age-seconds': import("../RESP/types").DoubleReply<number>;
                'client-info': import("../RESP/types").BlobStringReply<string>;
                'entry-id': import("../RESP/types").NumberReply<number>;
                'timestamp-created': import("../RESP/types").NumberReply<number>;
                'timestamp-last-updated': import("../RESP/types").NumberReply<number>;
            }[];
            readonly 3: () => import("./ACL_LOG").AclLogReply;
        };
    };
    readonly aclLog: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, count?: number | undefined) => void;
        readonly transformReply: {
            readonly 2: (reply: import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"count">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"reason">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"context">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"object">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"username">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"age-seconds">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"client-info">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"entry-id">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"timestamp-created">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"timestamp-last-updated">, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").BlobStringReply<"count">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"reason">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"context">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"object">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"username">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"age-seconds">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"client-info">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"entry-id">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"timestamp-created">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"timestamp-last-updated">, import("../RESP/types").NumberReply<number>]>[], preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
                count: import("../RESP/types").NumberReply<number>;
                reason: import("../RESP/types").BlobStringReply<string>;
                context: import("../RESP/types").BlobStringReply<string>;
                object: import("../RESP/types").BlobStringReply<string>;
                username: import("../RESP/types").BlobStringReply<string>;
                'age-seconds': import("../RESP/types").DoubleReply<number>;
                'client-info': import("../RESP/types").BlobStringReply<string>;
                'entry-id': import("../RESP/types").NumberReply<number>;
                'timestamp-created': import("../RESP/types").NumberReply<number>;
                'timestamp-last-updated': import("../RESP/types").NumberReply<number>;
            }[];
            readonly 3: () => import("./ACL_LOG").AclLogReply;
        };
    };
    readonly ACL_SAVE: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly aclSave: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly ACL_SETUSER: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, username: import("../RESP/types").RedisArgument, rule: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly aclSetUser: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, username: import("../RESP/types").RedisArgument, rule: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly ACL_USERS: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly aclUsers: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly ACL_WHOAMI: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    readonly aclWhoAmI: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    readonly APPEND: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, value: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly append: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, value: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly ASKING: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly asking: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly AUTH: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, { username, password }: import("./AUTH").AuthOptions) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly auth: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, { username, password }: import("./AUTH").AuthOptions) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly BGREWRITEAOF: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    readonly bgRewriteAof: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    readonly BGSAVE: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, options?: import("./BGSAVE").BgSaveOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    readonly bgSave: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, options?: import("./BGSAVE").BgSaveOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    readonly BITCOUNT: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, range?: import("./BITCOUNT").BitCountRange | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly bitCount: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, range?: import("./BITCOUNT").BitCountRange | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly BITFIELD_RO: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, operations: import("./BITFIELD_RO").BitFieldRoOperations) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").NumberReply<number>>;
    };
    readonly bitFieldRo: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, operations: import("./BITFIELD_RO").BitFieldRoOperations) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").NumberReply<number>>;
    };
    readonly BITFIELD: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, operations: import("./BITFIELD").BitFieldOperations) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").NullReply | import("../RESP/types").NumberReply<number>>;
    };
    readonly bitField: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, operations: import("./BITFIELD").BitFieldOperations) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").NullReply | import("../RESP/types").NumberReply<number>>;
    };
    readonly BITOP: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, operation: import("./BITOP").BitOperations, destKey: import("../RESP/types").RedisArgument, key: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly bitOp: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, operation: import("./BITOP").BitOperations, destKey: import("../RESP/types").RedisArgument, key: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly BITPOS: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, bit: import("./generic-transformers").BitValue, start?: number | undefined, end?: number | undefined, mode?: "BYTE" | "BIT" | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly bitPos: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, bit: import("./generic-transformers").BitValue, start?: number | undefined, end?: number | undefined, mode?: "BYTE" | "BIT" | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly BLMOVE: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, source: import("../RESP/types").RedisArgument, destination: import("../RESP/types").RedisArgument, sourceSide: import("./generic-transformers").ListSide, destinationSide: import("./generic-transformers").ListSide, timeout: number) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    readonly blMove: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, source: import("../RESP/types").RedisArgument, destination: import("../RESP/types").RedisArgument, sourceSide: import("./generic-transformers").ListSide, destinationSide: import("./generic-transformers").ListSide, timeout: number) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    readonly BLMPOP: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, timeout: number, keys: import("./generic-transformers").RedisVariadicArgument, side: import("./generic-transformers").ListSide, options?: import("./LMPOP").LMPopOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").TuplesReply<[key: import("../RESP/types").BlobStringReply<string>, elements: import("../RESP/types").BlobStringReply<string>[]]>;
    };
    readonly blmPop: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, timeout: number, keys: import("./generic-transformers").RedisVariadicArgument, side: import("./generic-transformers").ListSide, options?: import("./LMPOP").LMPopOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").TuplesReply<[key: import("../RESP/types").BlobStringReply<string>, elements: import("../RESP/types").BlobStringReply<string>[]]>;
    };
    readonly BLPOP: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("./generic-transformers").RedisVariadicArgument, timeout: number) => void;
        readonly transformReply: (this: void, reply: import("../RESP/types").UnwrapReply<import("../RESP/types").NullReply | import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>]>>) => {
            key: import("../RESP/types").BlobStringReply<string>;
            element: import("../RESP/types").BlobStringReply<string>;
        } | null;
    };
    readonly blPop: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("./generic-transformers").RedisVariadicArgument, timeout: number) => void;
        readonly transformReply: (this: void, reply: import("../RESP/types").UnwrapReply<import("../RESP/types").NullReply | import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>]>>) => {
            key: import("../RESP/types").BlobStringReply<string>;
            element: import("../RESP/types").BlobStringReply<string>;
        } | null;
    };
    readonly BRPOP: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("./generic-transformers").RedisVariadicArgument, timeout: number) => void;
        readonly transformReply: (this: void, reply: import("../RESP/types").UnwrapReply<import("../RESP/types").NullReply | import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>]>>) => {
            key: import("../RESP/types").BlobStringReply<string>;
            element: import("../RESP/types").BlobStringReply<string>;
        } | null;
    };
    readonly brPop: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("./generic-transformers").RedisVariadicArgument, timeout: number) => void;
        readonly transformReply: (this: void, reply: import("../RESP/types").UnwrapReply<import("../RESP/types").NullReply | import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>]>>) => {
            key: import("../RESP/types").BlobStringReply<string>;
            element: import("../RESP/types").BlobStringReply<string>;
        } | null;
    };
    readonly BRPOPLPUSH: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, source: import("../RESP/types").RedisArgument, destination: import("../RESP/types").RedisArgument, timeout: number) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    readonly brPopLPush: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, source: import("../RESP/types").RedisArgument, destination: import("../RESP/types").RedisArgument, timeout: number) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    readonly BZMPOP: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, timeout: number, keys: import("./generic-transformers").RedisVariadicArgument, side: import("./generic-transformers").SortedSetSide, options?: import("./ZMPOP").ZMPopOptions | undefined) => void;
        readonly transformReply: {
            readonly 2: (this: void, reply: import("../RESP/types").UnwrapReply<import("../RESP/types").Resp2Reply<import("./ZMPOP").ZMPopRawReply>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
                key: import("../RESP/types").BlobStringReply<string>;
                members: {
                    value: import("../RESP/types").BlobStringReply<string>;
                    score: import("../RESP/types").DoubleReply<number>;
                }[];
            } | null;
            readonly 3: (this: void, reply: import("../RESP/types").UnwrapReply<import("./ZMPOP").ZMPopRawReply>) => {
                key: import("../RESP/types").BlobStringReply<string>;
                members: {
                    value: import("../RESP/types").BlobStringReply<string>;
                    score: import("../RESP/types").DoubleReply<number>;
                }[];
            } | null;
        };
    };
    readonly bzmPop: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, timeout: number, keys: import("./generic-transformers").RedisVariadicArgument, side: import("./generic-transformers").SortedSetSide, options?: import("./ZMPOP").ZMPopOptions | undefined) => void;
        readonly transformReply: {
            readonly 2: (this: void, reply: import("../RESP/types").UnwrapReply<import("../RESP/types").Resp2Reply<import("./ZMPOP").ZMPopRawReply>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
                key: import("../RESP/types").BlobStringReply<string>;
                members: {
                    value: import("../RESP/types").BlobStringReply<string>;
                    score: import("../RESP/types").DoubleReply<number>;
                }[];
            } | null;
            readonly 3: (this: void, reply: import("../RESP/types").UnwrapReply<import("./ZMPOP").ZMPopRawReply>) => {
                key: import("../RESP/types").BlobStringReply<string>;
                members: {
                    value: import("../RESP/types").BlobStringReply<string>;
                    score: import("../RESP/types").DoubleReply<number>;
                }[];
            } | null;
        };
    };
    readonly BZPOPMAX: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").RedisVariadicArgument, timeout: number) => void;
        readonly transformReply: {
            readonly 2: (this: void, reply: import("../RESP/types").UnwrapReply<import("../RESP/types").NullReply | import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>]>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
                key: import("../RESP/types").BlobStringReply<string>;
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            } | null;
            readonly 3: (this: void, reply: import("../RESP/types").UnwrapReply<import("../RESP/types").NullReply | import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").DoubleReply<number>]>>) => {
                key: import("../RESP/types").BlobStringReply<string>;
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            } | null;
        };
    };
    readonly bzPopMax: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").RedisVariadicArgument, timeout: number) => void;
        readonly transformReply: {
            readonly 2: (this: void, reply: import("../RESP/types").UnwrapReply<import("../RESP/types").NullReply | import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>]>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
                key: import("../RESP/types").BlobStringReply<string>;
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            } | null;
            readonly 3: (this: void, reply: import("../RESP/types").UnwrapReply<import("../RESP/types").NullReply | import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").DoubleReply<number>]>>) => {
                key: import("../RESP/types").BlobStringReply<string>;
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            } | null;
        };
    };
    readonly BZPOPMIN: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").RedisVariadicArgument, timeout: number) => void;
        readonly transformReply: {
            readonly 2: (this: void, reply: import("../RESP/types").UnwrapReply<import("../RESP/types").NullReply | import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>]>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
                key: import("../RESP/types").BlobStringReply<string>;
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            } | null;
            readonly 3: (this: void, reply: import("../RESP/types").UnwrapReply<import("../RESP/types").NullReply | import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").DoubleReply<number>]>>) => {
                key: import("../RESP/types").BlobStringReply<string>;
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            } | null;
        };
    };
    readonly bzPopMin: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").RedisVariadicArgument, timeout: number) => void;
        readonly transformReply: {
            readonly 2: (this: void, reply: import("../RESP/types").UnwrapReply<import("../RESP/types").NullReply | import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>]>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
                key: import("../RESP/types").BlobStringReply<string>;
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            } | null;
            readonly 3: (this: void, reply: import("../RESP/types").UnwrapReply<import("../RESP/types").NullReply | import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").DoubleReply<number>]>>) => {
                key: import("../RESP/types").BlobStringReply<string>;
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            } | null;
        };
    };
    readonly CLIENT_CACHING: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, value: boolean) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly clientCaching: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, value: boolean) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly CLIENT_GETNAME: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    readonly clientGetName: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    readonly CLIENT_GETREDIR: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly clientGetRedir: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly CLIENT_ID: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly clientId: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly CLIENT_INFO: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: (this: void, rawReply: import("../RESP/types").VerbatimStringReply<string>) => import("./CLIENT_INFO").ClientInfoReply;
    };
    readonly clientInfo: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: (this: void, rawReply: import("../RESP/types").VerbatimStringReply<string>) => import("./CLIENT_INFO").ClientInfoReply;
    };
    readonly CLIENT_KILL: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, filters: import("./CLIENT_KILL").ClientKillFilter | import("./CLIENT_KILL").ClientKillFilter[]) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly clientKill: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, filters: import("./CLIENT_KILL").ClientKillFilter | import("./CLIENT_KILL").ClientKillFilter[]) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly CLIENT_LIST: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, filter?: import("./CLIENT_LIST").ListFilter | undefined) => void;
        readonly transformReply: (this: void, rawReply: import("../RESP/types").VerbatimStringReply<string>) => import("./CLIENT_INFO").ClientInfoReply[];
    };
    readonly clientList: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, filter?: import("./CLIENT_LIST").ListFilter | undefined) => void;
        readonly transformReply: (this: void, rawReply: import("../RESP/types").VerbatimStringReply<string>) => import("./CLIENT_INFO").ClientInfoReply[];
    };
    readonly 'CLIENT_NO-EVICT': {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, value: boolean) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly clientNoEvict: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, value: boolean) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly 'CLIENT_NO-TOUCH': {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, value: boolean) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly clientNoTouch: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, value: boolean) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly CLIENT_PAUSE: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, timeout: number, mode?: "WRITE" | "ALL" | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly clientPause: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, timeout: number, mode?: "WRITE" | "ALL" | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly CLIENT_SETNAME: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, name: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly clientSetName: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, name: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly CLIENT_TRACKING: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: <M extends boolean>(parser: import("../..").CommandParser, mode: M, options?: (M extends true ? import("./CLIENT_TRACKING").ClientTrackingOptions : never) | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly clientTracking: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: <M extends boolean>(parser: import("../..").CommandParser, mode: M, options?: (M extends true ? import("./CLIENT_TRACKING").ClientTrackingOptions : never) | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly CLIENT_TRACKINGINFO: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: {
            readonly 2: (reply: [import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>, import("../RESP/types").BlobStringReply<"redirect">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"prefixes">, import("../RESP/types").RespType<42, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>]) => {
                flags: import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>;
                redirect: import("../RESP/types").NumberReply<number>;
                prefixes: import("../RESP/types").RespType<42, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>;
            };
            readonly 3: () => import("../RESP/types").TuplesToMapReply<[[import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").SetReply<import("../RESP/types").BlobStringReply<string>>], [import("../RESP/types").BlobStringReply<"redirect">, import("../RESP/types").NumberReply<number>], [import("../RESP/types").BlobStringReply<"prefixes">, import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>]]>;
        };
    };
    readonly clientTrackingInfo: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: {
            readonly 2: (reply: [import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>, import("../RESP/types").BlobStringReply<"redirect">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"prefixes">, import("../RESP/types").RespType<42, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>]) => {
                flags: import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>;
                redirect: import("../RESP/types").NumberReply<number>;
                prefixes: import("../RESP/types").RespType<42, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>;
            };
            readonly 3: () => import("../RESP/types").TuplesToMapReply<[[import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").SetReply<import("../RESP/types").BlobStringReply<string>>], [import("../RESP/types").BlobStringReply<"redirect">, import("../RESP/types").NumberReply<number>], [import("../RESP/types").BlobStringReply<"prefixes">, import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>]]>;
        };
    };
    readonly CLIENT_UNPAUSE: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly clientUnpause: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly CLUSTER_ADDSLOTS: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, slots: number | number[]) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly clusterAddSlots: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, slots: number | number[]) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly CLUSTER_ADDSLOTSRANGE: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, ranges: import("./generic-transformers").SlotRange | import("./generic-transformers").SlotRange[]) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly clusterAddSlotsRange: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, ranges: import("./generic-transformers").SlotRange | import("./generic-transformers").SlotRange[]) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly CLUSTER_BUMPEPOCH: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"BUMPED" | "STILL">;
    };
    readonly clusterBumpEpoch: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"BUMPED" | "STILL">;
    };
    readonly 'CLUSTER_COUNT-FAILURE-REPORTS': {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, nodeId: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly clusterCountFailureReports: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, nodeId: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly CLUSTER_COUNTKEYSINSLOT: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, slot: number) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly clusterCountKeysInSlot: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, slot: number) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly CLUSTER_DELSLOTS: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, slots: number | number[]) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly clusterDelSlots: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, slots: number | number[]) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly CLUSTER_DELSLOTSRANGE: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, ranges: import("./generic-transformers").SlotRange | import("./generic-transformers").SlotRange[]) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly clusterDelSlotsRange: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, ranges: import("./generic-transformers").SlotRange | import("./generic-transformers").SlotRange[]) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly CLUSTER_FAILOVER: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, options?: import("./CLUSTER_FAILOVER").ClusterFailoverOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly clusterFailover: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, options?: import("./CLUSTER_FAILOVER").ClusterFailoverOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly CLUSTER_FLUSHSLOTS: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly clusterFlushSlots: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly CLUSTER_FORGET: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, nodeId: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly clusterForget: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, nodeId: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly CLUSTER_GETKEYSINSLOT: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, slot: number, count: number) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly clusterGetKeysInSlot: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, slot: number, count: number) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly CLUSTER_INFO: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").VerbatimStringReply<string>;
    };
    readonly clusterInfo: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").VerbatimStringReply<string>;
    };
    readonly CLUSTER_KEYSLOT: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly clusterKeySlot: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly CLUSTER_LINKS: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: {
            readonly 2: (reply: import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"direction">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"node">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"create-time">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"events">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"send-buffer-allocated">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"send-buffer-used">, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").BlobStringReply<"direction">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"node">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"create-time">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"events">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"send-buffer-allocated">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"send-buffer-used">, import("../RESP/types").NumberReply<number>]>[]) => {
                direction: import("../RESP/types").BlobStringReply<string>;
                node: import("../RESP/types").BlobStringReply<string>;
                'create-time': import("../RESP/types").NumberReply<number>;
                events: import("../RESP/types").BlobStringReply<string>;
                'send-buffer-allocated': import("../RESP/types").NumberReply<number>;
                'send-buffer-used': import("../RESP/types").NumberReply<number>;
            }[];
            readonly 3: () => import("../RESP/types").ArrayReply<import("../RESP/types").TuplesToMapReply<[[import("../RESP/types").BlobStringReply<"direction">, import("../RESP/types").BlobStringReply<string>], [import("../RESP/types").BlobStringReply<"node">, import("../RESP/types").BlobStringReply<string>], [import("../RESP/types").BlobStringReply<"create-time">, import("../RESP/types").NumberReply<number>], [import("../RESP/types").BlobStringReply<"events">, import("../RESP/types").BlobStringReply<string>], [import("../RESP/types").BlobStringReply<"send-buffer-allocated">, import("../RESP/types").NumberReply<number>], [import("../RESP/types").BlobStringReply<"send-buffer-used">, import("../RESP/types").NumberReply<number>]]>>;
        };
    };
    readonly clusterLinks: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: {
            readonly 2: (reply: import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"direction">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"node">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"create-time">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"events">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"send-buffer-allocated">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"send-buffer-used">, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").BlobStringReply<"direction">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"node">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"create-time">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"events">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"send-buffer-allocated">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"send-buffer-used">, import("../RESP/types").NumberReply<number>]>[]) => {
                direction: import("../RESP/types").BlobStringReply<string>;
                node: import("../RESP/types").BlobStringReply<string>;
                'create-time': import("../RESP/types").NumberReply<number>;
                events: import("../RESP/types").BlobStringReply<string>;
                'send-buffer-allocated': import("../RESP/types").NumberReply<number>;
                'send-buffer-used': import("../RESP/types").NumberReply<number>;
            }[];
            readonly 3: () => import("../RESP/types").ArrayReply<import("../RESP/types").TuplesToMapReply<[[import("../RESP/types").BlobStringReply<"direction">, import("../RESP/types").BlobStringReply<string>], [import("../RESP/types").BlobStringReply<"node">, import("../RESP/types").BlobStringReply<string>], [import("../RESP/types").BlobStringReply<"create-time">, import("../RESP/types").NumberReply<number>], [import("../RESP/types").BlobStringReply<"events">, import("../RESP/types").BlobStringReply<string>], [import("../RESP/types").BlobStringReply<"send-buffer-allocated">, import("../RESP/types").NumberReply<number>], [import("../RESP/types").BlobStringReply<"send-buffer-used">, import("../RESP/types").NumberReply<number>]]>>;
        };
    };
    readonly CLUSTER_MEET: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, host: string, port: number) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly clusterMeet: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, host: string, port: number) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly CLUSTER_MYID: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    readonly clusterMyId: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    readonly CLUSTER_MYSHARDID: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    readonly clusterMyShardId: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    readonly CLUSTER_NODES: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").VerbatimStringReply<string>;
    };
    readonly clusterNodes: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").VerbatimStringReply<string>;
    };
    readonly CLUSTER_REPLICAS: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, nodeId: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly clusterReplicas: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, nodeId: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly CLUSTER_REPLICATE: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, nodeId: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    readonly clusterReplicate: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, nodeId: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    readonly CLUSTER_RESET: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, options?: import("./CLUSTER_RESET").ClusterResetOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly clusterReset: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, options?: import("./CLUSTER_RESET").ClusterResetOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly CLUSTER_SAVECONFIG: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly clusterSaveConfig: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly 'CLUSTER_SET-CONFIG-EPOCH': {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, configEpoch: number) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly clusterSetConfigEpoch: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, configEpoch: number) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly CLUSTER_SETSLOT: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, slot: number, state: import("./CLUSTER_SETSLOT").ClusterSlotState, nodeId?: import("../RESP/types").RedisArgument | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly clusterSetSlot: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, slot: number, state: import("./CLUSTER_SETSLOT").ClusterSlotState, nodeId?: import("../RESP/types").RedisArgument | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly CLUSTER_SLOTS: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: (this: void, reply: [from: import("../RESP/types").NumberReply<number>, to: import("../RESP/types").NumberReply<number>, master: import("../RESP/types").TuplesReply<[host: import("../RESP/types").BlobStringReply<string>, port: import("../RESP/types").NumberReply<number>, id: import("../RESP/types").BlobStringReply<string>]>, ...replicas: import("../RESP/types").TuplesReply<[host: import("../RESP/types").BlobStringReply<string>, port: import("../RESP/types").NumberReply<number>, id: import("../RESP/types").BlobStringReply<string>]>[]][]) => {
            from: import("../RESP/types").NumberReply<number>;
            to: import("../RESP/types").NumberReply<number>;
            master: {
                host: import("../RESP/types").BlobStringReply<string>;
                port: import("../RESP/types").NumberReply<number>;
                id: import("../RESP/types").BlobStringReply<string>;
            };
            replicas: {
                host: import("../RESP/types").BlobStringReply<string>;
                port: import("../RESP/types").NumberReply<number>;
                id: import("../RESP/types").BlobStringReply<string>;
            }[];
        }[];
    };
    readonly clusterSlots: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: (this: void, reply: [from: import("../RESP/types").NumberReply<number>, to: import("../RESP/types").NumberReply<number>, master: import("../RESP/types").TuplesReply<[host: import("../RESP/types").BlobStringReply<string>, port: import("../RESP/types").NumberReply<number>, id: import("../RESP/types").BlobStringReply<string>]>, ...replicas: import("../RESP/types").TuplesReply<[host: import("../RESP/types").BlobStringReply<string>, port: import("../RESP/types").NumberReply<number>, id: import("../RESP/types").BlobStringReply<string>]>[]][]) => {
            from: import("../RESP/types").NumberReply<number>;
            to: import("../RESP/types").NumberReply<number>;
            master: {
                host: import("../RESP/types").BlobStringReply<string>;
                port: import("../RESP/types").NumberReply<number>;
                id: import("../RESP/types").BlobStringReply<string>;
            };
            replicas: {
                host: import("../RESP/types").BlobStringReply<string>;
                port: import("../RESP/types").NumberReply<number>;
                id: import("../RESP/types").BlobStringReply<string>;
            }[];
        }[];
    };
    readonly COMMAND_COUNT: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly commandCount: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly COMMAND_GETKEYS: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, args: import("../RESP/types").RedisArgument[]) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly commandGetKeys: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, args: import("../RESP/types").RedisArgument[]) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly COMMAND_GETKEYSANDFLAGS: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, args: import("../RESP/types").RedisArgument[]) => void;
        readonly transformReply: (this: void, reply: import("../RESP/types").TuplesReply<[key: import("../RESP/types").BlobStringReply<string>, flags: import("../RESP/types").SetReply<import("../RESP/types").BlobStringReply<string>>]>[]) => {
            key: import("../RESP/types").BlobStringReply<string>;
            flags: import("../RESP/types").SetReply<import("../RESP/types").BlobStringReply<string>>;
        }[];
    };
    readonly commandGetKeysAndFlags: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, args: import("../RESP/types").RedisArgument[]) => void;
        readonly transformReply: (this: void, reply: import("../RESP/types").TuplesReply<[key: import("../RESP/types").BlobStringReply<string>, flags: import("../RESP/types").SetReply<import("../RESP/types").BlobStringReply<string>>]>[]) => {
            key: import("../RESP/types").BlobStringReply<string>;
            flags: import("../RESP/types").SetReply<import("../RESP/types").BlobStringReply<string>>;
        }[];
    };
    readonly COMMAND_INFO: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, commands: string[]) => void;
        readonly transformReply: (this: void, reply: import("./generic-transformers").CommandRawReply[]) => (import("./generic-transformers").CommandReply | null)[];
    };
    readonly commandInfo: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, commands: string[]) => void;
        readonly transformReply: (this: void, reply: import("./generic-transformers").CommandRawReply[]) => (import("./generic-transformers").CommandReply | null)[];
    };
    readonly COMMAND_LIST: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, options?: import("./COMMAND_LIST").CommandListOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly commandList: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, options?: import("./COMMAND_LIST").CommandListOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly COMMAND: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: (this: void, reply: import("./generic-transformers").CommandRawReply[]) => import("./generic-transformers").CommandReply[];
    };
    readonly command: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: (this: void, reply: import("./generic-transformers").CommandRawReply[]) => import("./generic-transformers").CommandReply[];
    };
    readonly CONFIG_GET: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, parameters: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: {
            readonly 2: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => import("../RESP/types").MapReply<import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>>;
            readonly 3: () => import("../RESP/types").MapReply<import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>>;
        };
    };
    readonly configGet: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, parameters: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: {
            readonly 2: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => import("../RESP/types").MapReply<import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>>;
            readonly 3: () => import("../RESP/types").MapReply<import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>>;
        };
    };
    readonly CONFIG_RESETASTAT: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    readonly configResetStat: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    readonly CONFIG_REWRITE: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    readonly configRewrite: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    readonly CONFIG_SET: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, ...[parameterOrConfig, value]: [parameter: import("../RESP/types").RedisArgument, value: import("../RESP/types").RedisArgument] | [config: Record<string, import("../RESP/types").RedisArgument>]) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    readonly configSet: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, ...[parameterOrConfig, value]: [parameter: import("../RESP/types").RedisArgument, value: import("../RESP/types").RedisArgument] | [config: Record<string, import("../RESP/types").RedisArgument>]) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    readonly COPY: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, source: import("../RESP/types").RedisArgument, destination: import("../RESP/types").RedisArgument, options?: import("./COPY").CopyCommandOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly copy: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, source: import("../RESP/types").RedisArgument, destination: import("../RESP/types").RedisArgument, options?: import("./COPY").CopyCommandOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly DBSIZE: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly dbSize: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly DECR: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly decr: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly DECRBY: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, decrement: number) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly decrBy: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, decrement: number) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly DEL: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly del: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly DELEX: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, options?: {
            condition: "IFEQ" | "IFNE" | "IFDEQ" | "IFDNE";
            matchValue: import("../RESP/types").RedisArgument;
        } | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<0 | 1>;
    };
    readonly delEx: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, options?: {
            condition: "IFEQ" | "IFNE" | "IFDEQ" | "IFDNE";
            matchValue: import("../RESP/types").RedisArgument;
        } | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<0 | 1>;
    };
    readonly DIGEST: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    readonly digest: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    readonly DUMP: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    readonly dump: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    readonly ECHO: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, message: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    readonly echo: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, message: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    readonly EVAL_RO: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, script: import("../RESP/types").RedisArgument, options?: import("./EVAL").EvalOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ReplyUnion;
    };
    readonly evalRo: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, script: import("../RESP/types").RedisArgument, options?: import("./EVAL").EvalOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ReplyUnion;
    };
    readonly EVAL: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, script: import("../RESP/types").RedisArgument, options?: import("./EVAL").EvalOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ReplyUnion;
    };
    readonly eval: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, script: import("../RESP/types").RedisArgument, options?: import("./EVAL").EvalOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ReplyUnion;
    };
    readonly EVALSHA_RO: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, script: import("../RESP/types").RedisArgument, options?: import("./EVAL").EvalOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ReplyUnion;
    };
    readonly evalShaRo: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, script: import("../RESP/types").RedisArgument, options?: import("./EVAL").EvalOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ReplyUnion;
    };
    readonly EVALSHA: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, script: import("../RESP/types").RedisArgument, options?: import("./EVAL").EvalOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ReplyUnion;
    };
    readonly evalSha: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, script: import("../RESP/types").RedisArgument, options?: import("./EVAL").EvalOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ReplyUnion;
    };
    readonly EXISTS: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly exists: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly EXPIRE: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, seconds: number, mode?: "NX" | "XX" | "GT" | "LT" | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly expire: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, seconds: number, mode?: "NX" | "XX" | "GT" | "LT" | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly EXPIREAT: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, timestamp: number | Date, mode?: "NX" | "XX" | "GT" | "LT" | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly expireAt: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, timestamp: number | Date, mode?: "NX" | "XX" | "GT" | "LT" | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly EXPIRETIME: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly expireTime: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly FLUSHALL: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, mode?: import("./FLUSHALL").RedisFlushMode | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    readonly flushAll: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, mode?: import("./FLUSHALL").RedisFlushMode | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    readonly FLUSHDB: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, mode?: import("./FLUSHALL").RedisFlushMode | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    readonly flushDb: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, mode?: import("./FLUSHALL").RedisFlushMode | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    readonly FCALL: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, script: import("../RESP/types").RedisArgument, options?: import("./EVAL").EvalOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ReplyUnion;
    };
    readonly fCall: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, script: import("../RESP/types").RedisArgument, options?: import("./EVAL").EvalOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ReplyUnion;
    };
    readonly FCALL_RO: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, script: import("../RESP/types").RedisArgument, options?: import("./EVAL").EvalOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ReplyUnion;
    };
    readonly fCallRo: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, script: import("../RESP/types").RedisArgument, options?: import("./EVAL").EvalOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ReplyUnion;
    };
    readonly FUNCTION_DELETE: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, library: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    readonly functionDelete: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, library: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    readonly FUNCTION_DUMP: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    readonly functionDump: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    readonly FUNCTION_FLUSH: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, mode?: import("./FLUSHALL").RedisFlushMode | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly functionFlush: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, mode?: import("./FLUSHALL").RedisFlushMode | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly FUNCTION_KILL: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    readonly functionKill: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    readonly FUNCTION_LIST_WITHCODE: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, options?: import("./FUNCTION_LIST").FunctionListOptions | undefined) => void;
        readonly transformReply: {
            readonly 2: (reply: import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"library_name">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"engine">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"functions">, import("../RESP/types").RespType<42, import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>], never, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>]>[], never, import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>], never, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>]>[]>, import("../RESP/types").BlobStringReply<"library_code">, import("../RESP/types").BlobStringReply<string>], never, [import("../RESP/types").BlobStringReply<"library_name">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"engine">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"functions">, import("../RESP/types").RespType<42, import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>], never, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>]>[], never, import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>], never, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>]>[]>, import("../RESP/types").BlobStringReply<"library_code">, import("../RESP/types").BlobStringReply<string>]>[]) => {
                library_name: import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
                engine: import("../RESP/types").BlobStringReply<string>;
                functions: {
                    name: import("../RESP/types").BlobStringReply<string>;
                    description: import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
                    flags: import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>;
                }[];
                library_code: import("../RESP/types").BlobStringReply<string>;
            }[];
            readonly 3: () => import("./FUNCTION_LIST_WITHCODE").FunctionListWithCodeReply;
        };
    };
    readonly functionListWithCode: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, options?: import("./FUNCTION_LIST").FunctionListOptions | undefined) => void;
        readonly transformReply: {
            readonly 2: (reply: import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"library_name">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"engine">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"functions">, import("../RESP/types").RespType<42, import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>], never, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>]>[], never, import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>], never, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>]>[]>, import("../RESP/types").BlobStringReply<"library_code">, import("../RESP/types").BlobStringReply<string>], never, [import("../RESP/types").BlobStringReply<"library_name">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"engine">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"functions">, import("../RESP/types").RespType<42, import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>], never, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>]>[], never, import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>], never, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>]>[]>, import("../RESP/types").BlobStringReply<"library_code">, import("../RESP/types").BlobStringReply<string>]>[]) => {
                library_name: import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
                engine: import("../RESP/types").BlobStringReply<string>;
                functions: {
                    name: import("../RESP/types").BlobStringReply<string>;
                    description: import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
                    flags: import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>;
                }[];
                library_code: import("../RESP/types").BlobStringReply<string>;
            }[];
            readonly 3: () => import("./FUNCTION_LIST_WITHCODE").FunctionListWithCodeReply;
        };
    };
    readonly FUNCTION_LIST: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, options?: import("./FUNCTION_LIST").FunctionListOptions | undefined) => void;
        readonly transformReply: {
            readonly 2: (reply: import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"library_name">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"engine">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"functions">, import("../RESP/types").RespType<42, import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>], never, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>]>[], never, import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>], never, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>]>[]>], never, [import("../RESP/types").BlobStringReply<"library_name">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"engine">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"functions">, import("../RESP/types").RespType<42, import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>], never, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>]>[], never, import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>], never, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>]>[]>]>[]) => {
                library_name: import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
                engine: import("../RESP/types").BlobStringReply<string>;
                functions: {
                    name: import("../RESP/types").BlobStringReply<string>;
                    description: import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
                    flags: import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>;
                }[];
            }[];
            readonly 3: () => import("./FUNCTION_LIST").FunctionListReply;
        };
    };
    readonly functionList: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, options?: import("./FUNCTION_LIST").FunctionListOptions | undefined) => void;
        readonly transformReply: {
            readonly 2: (reply: import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"library_name">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"engine">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"functions">, import("../RESP/types").RespType<42, import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>], never, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>]>[], never, import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>], never, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>]>[]>], never, [import("../RESP/types").BlobStringReply<"library_name">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"engine">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"functions">, import("../RESP/types").RespType<42, import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>], never, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>]>[], never, import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>], never, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>]>[]>]>[]) => {
                library_name: import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
                engine: import("../RESP/types").BlobStringReply<string>;
                functions: {
                    name: import("../RESP/types").BlobStringReply<string>;
                    description: import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
                    flags: import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>;
                }[];
            }[];
            readonly 3: () => import("./FUNCTION_LIST").FunctionListReply;
        };
    };
    readonly FUNCTION_LOAD: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, code: import("../RESP/types").RedisArgument, options?: import("./FUNCTION_LOAD").FunctionLoadOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    readonly functionLoad: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, code: import("../RESP/types").RedisArgument, options?: import("./FUNCTION_LOAD").FunctionLoadOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    readonly FUNCTION_RESTORE: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, dump: import("../RESP/types").RedisArgument, options?: import("./FUNCTION_RESTORE").FunctionRestoreOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly functionRestore: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, dump: import("../RESP/types").RedisArgument, options?: import("./FUNCTION_RESTORE").FunctionRestoreOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly FUNCTION_STATS: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: {
            readonly 2: (reply: [import("../RESP/types").BlobStringReply<"running_script">, import("../RESP/types").NullReply | import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"command">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"duration_ms">, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"command">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"duration_ms">, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").BlobStringReply<"engines">, import("../RESP/types").RespType<42, (import("../RESP/types").BlobStringReply<string> | import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"libraries_count">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"functions_count">, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").BlobStringReply<"libraries_count">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"functions_count">, import("../RESP/types").NumberReply<number>]>)[], never, (import("../RESP/types").BlobStringReply<string> | import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"libraries_count">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"functions_count">, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").BlobStringReply<"libraries_count">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"functions_count">, import("../RESP/types").NumberReply<number>]>)[]>]) => {
                running_script: {
                    name: import("../RESP/types").BlobStringReply<string>;
                    command: import("../RESP/types").BlobStringReply<string>;
                    duration_ms: import("../RESP/types").NumberReply<number>;
                } | null;
                engines: Record<string, {
                    libraries_count: import("../RESP/types").NumberReply<number>;
                    functions_count: import("../RESP/types").NumberReply<number>;
                }>;
            };
            readonly 3: () => import("../RESP/types").TuplesToMapReply<[[import("../RESP/types").BlobStringReply<"running_script">, import("../RESP/types").NullReply | import("../RESP/types").TuplesToMapReply<[[import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>], [import("../RESP/types").BlobStringReply<"command">, import("../RESP/types").BlobStringReply<string>], [import("../RESP/types").BlobStringReply<"duration_ms">, import("../RESP/types").NumberReply<number>]]>], [import("../RESP/types").BlobStringReply<"engines">, import("../RESP/types").MapReply<import("../RESP/types").BlobStringReply<string>, import("../RESP/types").TuplesToMapReply<[[import("../RESP/types").BlobStringReply<"libraries_count">, import("../RESP/types").NumberReply<number>], [import("../RESP/types").BlobStringReply<"functions_count">, import("../RESP/types").NumberReply<number>]]>>]]>;
        };
    };
    readonly functionStats: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: {
            readonly 2: (reply: [import("../RESP/types").BlobStringReply<"running_script">, import("../RESP/types").NullReply | import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"command">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"duration_ms">, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"command">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"duration_ms">, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").BlobStringReply<"engines">, import("../RESP/types").RespType<42, (import("../RESP/types").BlobStringReply<string> | import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"libraries_count">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"functions_count">, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").BlobStringReply<"libraries_count">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"functions_count">, import("../RESP/types").NumberReply<number>]>)[], never, (import("../RESP/types").BlobStringReply<string> | import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"libraries_count">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"functions_count">, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").BlobStringReply<"libraries_count">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"functions_count">, import("../RESP/types").NumberReply<number>]>)[]>]) => {
                running_script: {
                    name: import("../RESP/types").BlobStringReply<string>;
                    command: import("../RESP/types").BlobStringReply<string>;
                    duration_ms: import("../RESP/types").NumberReply<number>;
                } | null;
                engines: Record<string, {
                    libraries_count: import("../RESP/types").NumberReply<number>;
                    functions_count: import("../RESP/types").NumberReply<number>;
                }>;
            };
            readonly 3: () => import("../RESP/types").TuplesToMapReply<[[import("../RESP/types").BlobStringReply<"running_script">, import("../RESP/types").NullReply | import("../RESP/types").TuplesToMapReply<[[import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>], [import("../RESP/types").BlobStringReply<"command">, import("../RESP/types").BlobStringReply<string>], [import("../RESP/types").BlobStringReply<"duration_ms">, import("../RESP/types").NumberReply<number>]]>], [import("../RESP/types").BlobStringReply<"engines">, import("../RESP/types").MapReply<import("../RESP/types").BlobStringReply<string>, import("../RESP/types").TuplesToMapReply<[[import("../RESP/types").BlobStringReply<"libraries_count">, import("../RESP/types").NumberReply<number>], [import("../RESP/types").BlobStringReply<"functions_count">, import("../RESP/types").NumberReply<number>]]>>]]>;
        };
    };
    readonly GEOADD: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, toAdd: import("./GEOADD").GeoMember | import("./GEOADD").GeoMember[], options?: import("./GEOADD").GeoAddOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly geoAdd: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, toAdd: import("./GEOADD").GeoMember | import("./GEOADD").GeoMember[], options?: import("./GEOADD").GeoAddOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly GEODIST: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, member1: import("../RESP/types").RedisArgument, member2: import("../RESP/types").RedisArgument, unit?: import("./GEOSEARCH").GeoUnits | undefined) => void;
        readonly transformReply: (this: void, reply: import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>) => number | null;
    };
    readonly geoDist: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, member1: import("../RESP/types").RedisArgument, member2: import("../RESP/types").RedisArgument, unit?: import("./GEOSEARCH").GeoUnits | undefined) => void;
        readonly transformReply: (this: void, reply: import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>) => number | null;
    };
    readonly GEOHASH: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, member: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly geoHash: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, member: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly GEOPOS: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, member: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: (this: void, reply: (import("../RESP/types").NullReply | import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>]>)[]) => ({
            longitude: import("../RESP/types").BlobStringReply<string>;
            latitude: import("../RESP/types").BlobStringReply<string>;
        } | null)[];
    };
    readonly geoPos: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, member: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: (this: void, reply: (import("../RESP/types").NullReply | import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>]>)[]) => ({
            longitude: import("../RESP/types").BlobStringReply<string>;
            latitude: import("../RESP/types").BlobStringReply<string>;
        } | null)[];
    };
    readonly GEORADIUS_RO_WITH: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, from: import("./GEOSEARCH").GeoCoordinates, radius: number, unit: import("./GEOSEARCH").GeoUnits, replyWith: import("./GEOSEARCH_WITH").GeoReplyWith[], options?: import("./GEOSEARCH").GeoSearchOptions | undefined) => void;
        readonly transformReply: (this: void, reply: import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, ...any[]]>[], replyWith: import("./GEOSEARCH_WITH").GeoReplyWith[]) => import("./GEOSEARCH_WITH").GeoReplyWithMember[];
    };
    readonly geoRadiusRoWith: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, from: import("./GEOSEARCH").GeoCoordinates, radius: number, unit: import("./GEOSEARCH").GeoUnits, replyWith: import("./GEOSEARCH_WITH").GeoReplyWith[], options?: import("./GEOSEARCH").GeoSearchOptions | undefined) => void;
        readonly transformReply: (this: void, reply: import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, ...any[]]>[], replyWith: import("./GEOSEARCH_WITH").GeoReplyWith[]) => import("./GEOSEARCH_WITH").GeoReplyWithMember[];
    };
    readonly GEORADIUS_RO: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, from: import("./GEOSEARCH").GeoCoordinates, radius: number, unit: import("./GEOSEARCH").GeoUnits, options?: import("./GEOSEARCH").GeoSearchOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly geoRadiusRo: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, from: import("./GEOSEARCH").GeoCoordinates, radius: number, unit: import("./GEOSEARCH").GeoUnits, options?: import("./GEOSEARCH").GeoSearchOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly GEORADIUS_STORE: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, from: import("./GEOSEARCH").GeoCoordinates, radius: number, unit: import("./GEOSEARCH").GeoUnits, destination: import("../RESP/types").RedisArgument, options?: import("./GEORADIUS_STORE").GeoRadiusStoreOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly geoRadiusStore: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, from: import("./GEOSEARCH").GeoCoordinates, radius: number, unit: import("./GEOSEARCH").GeoUnits, destination: import("../RESP/types").RedisArgument, options?: import("./GEORADIUS_STORE").GeoRadiusStoreOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly GEORADIUS_WITH: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, from: import("./GEOSEARCH").GeoCoordinates, radius: number, unit: import("./GEOSEARCH").GeoUnits, replyWith: import("./GEOSEARCH_WITH").GeoReplyWith[], options?: import("./GEOSEARCH").GeoSearchOptions | undefined) => void;
        readonly transformReply: (this: void, reply: import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, ...any[]]>[], replyWith: import("./GEOSEARCH_WITH").GeoReplyWith[]) => import("./GEOSEARCH_WITH").GeoReplyWithMember[];
    };
    readonly geoRadiusWith: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, from: import("./GEOSEARCH").GeoCoordinates, radius: number, unit: import("./GEOSEARCH").GeoUnits, replyWith: import("./GEOSEARCH_WITH").GeoReplyWith[], options?: import("./GEOSEARCH").GeoSearchOptions | undefined) => void;
        readonly transformReply: (this: void, reply: import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, ...any[]]>[], replyWith: import("./GEOSEARCH_WITH").GeoReplyWith[]) => import("./GEOSEARCH_WITH").GeoReplyWithMember[];
    };
    readonly GEORADIUS: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, from: import("./GEOSEARCH").GeoCoordinates, radius: number, unit: import("./GEOSEARCH").GeoUnits, options?: import("./GEOSEARCH").GeoSearchOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly geoRadius: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, from: import("./GEOSEARCH").GeoCoordinates, radius: number, unit: import("./GEOSEARCH").GeoUnits, options?: import("./GEOSEARCH").GeoSearchOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly GEORADIUSBYMEMBER_RO_WITH: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, from: import("../RESP/types").RedisArgument, radius: number, unit: import("./GEOSEARCH").GeoUnits, replyWith: import("./GEOSEARCH_WITH").GeoReplyWith[], options?: import("./GEOSEARCH").GeoSearchOptions | undefined) => void;
        readonly transformReply: (this: void, reply: import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, ...any[]]>[], replyWith: import("./GEOSEARCH_WITH").GeoReplyWith[]) => import("./GEOSEARCH_WITH").GeoReplyWithMember[];
    };
    readonly geoRadiusByMemberRoWith: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, from: import("../RESP/types").RedisArgument, radius: number, unit: import("./GEOSEARCH").GeoUnits, replyWith: import("./GEOSEARCH_WITH").GeoReplyWith[], options?: import("./GEOSEARCH").GeoSearchOptions | undefined) => void;
        readonly transformReply: (this: void, reply: import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, ...any[]]>[], replyWith: import("./GEOSEARCH_WITH").GeoReplyWith[]) => import("./GEOSEARCH_WITH").GeoReplyWithMember[];
    };
    readonly GEORADIUSBYMEMBER_RO: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, from: import("../RESP/types").RedisArgument, radius: number, unit: import("./GEOSEARCH").GeoUnits, options?: import("./GEOSEARCH").GeoSearchOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly geoRadiusByMemberRo: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, from: import("../RESP/types").RedisArgument, radius: number, unit: import("./GEOSEARCH").GeoUnits, options?: import("./GEOSEARCH").GeoSearchOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly GEORADIUSBYMEMBER_STORE: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, from: import("../RESP/types").RedisArgument, radius: number, unit: import("./GEOSEARCH").GeoUnits, destination: import("../RESP/types").RedisArgument, options?: import("./GEORADIUSBYMEMBER_STORE").GeoRadiusStoreOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly geoRadiusByMemberStore: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, from: import("../RESP/types").RedisArgument, radius: number, unit: import("./GEOSEARCH").GeoUnits, destination: import("../RESP/types").RedisArgument, options?: import("./GEORADIUSBYMEMBER_STORE").GeoRadiusStoreOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly GEORADIUSBYMEMBER_WITH: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, from: import("../RESP/types").RedisArgument, radius: number, unit: import("./GEOSEARCH").GeoUnits, replyWith: import("./GEOSEARCH_WITH").GeoReplyWith[], options?: import("./GEOSEARCH").GeoSearchOptions | undefined) => void;
        readonly transformReply: (this: void, reply: import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, ...any[]]>[], replyWith: import("./GEOSEARCH_WITH").GeoReplyWith[]) => import("./GEOSEARCH_WITH").GeoReplyWithMember[];
    };
    readonly geoRadiusByMemberWith: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, from: import("../RESP/types").RedisArgument, radius: number, unit: import("./GEOSEARCH").GeoUnits, replyWith: import("./GEOSEARCH_WITH").GeoReplyWith[], options?: import("./GEOSEARCH").GeoSearchOptions | undefined) => void;
        readonly transformReply: (this: void, reply: import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, ...any[]]>[], replyWith: import("./GEOSEARCH_WITH").GeoReplyWith[]) => import("./GEOSEARCH_WITH").GeoReplyWithMember[];
    };
    readonly GEORADIUSBYMEMBER: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, from: import("../RESP/types").RedisArgument, radius: number, unit: import("./GEOSEARCH").GeoUnits, options?: import("./GEOSEARCH").GeoSearchOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly geoRadiusByMember: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, from: import("../RESP/types").RedisArgument, radius: number, unit: import("./GEOSEARCH").GeoUnits, options?: import("./GEOSEARCH").GeoSearchOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly GEOSEARCH_WITH: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, from: import("./GEOSEARCH").GeoSearchFrom, by: import("./GEOSEARCH").GeoSearchBy, replyWith: import("./GEOSEARCH_WITH").GeoReplyWith[], options?: import("./GEOSEARCH").GeoSearchOptions | undefined) => void;
        readonly transformReply: (this: void, reply: import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, ...any[]]>[], replyWith: import("./GEOSEARCH_WITH").GeoReplyWith[]) => import("./GEOSEARCH_WITH").GeoReplyWithMember[];
    };
    readonly geoSearchWith: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, from: import("./GEOSEARCH").GeoSearchFrom, by: import("./GEOSEARCH").GeoSearchBy, replyWith: import("./GEOSEARCH_WITH").GeoReplyWith[], options?: import("./GEOSEARCH").GeoSearchOptions | undefined) => void;
        readonly transformReply: (this: void, reply: import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, ...any[]]>[], replyWith: import("./GEOSEARCH_WITH").GeoReplyWith[]) => import("./GEOSEARCH_WITH").GeoReplyWithMember[];
    };
    readonly GEOSEARCH: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, from: import("./GEOSEARCH").GeoSearchFrom, by: import("./GEOSEARCH").GeoSearchBy, options?: import("./GEOSEARCH").GeoSearchOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly geoSearch: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, from: import("./GEOSEARCH").GeoSearchFrom, by: import("./GEOSEARCH").GeoSearchBy, options?: import("./GEOSEARCH").GeoSearchOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly GEOSEARCHSTORE: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, destination: import("../RESP/types").RedisArgument, source: import("../RESP/types").RedisArgument, from: import("./GEOSEARCH").GeoSearchFrom, by: import("./GEOSEARCH").GeoSearchBy, options?: import("./GEOSEARCHSTORE").GeoSearchStoreOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly geoSearchStore: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, destination: import("../RESP/types").RedisArgument, source: import("../RESP/types").RedisArgument, from: import("./GEOSEARCH").GeoSearchFrom, by: import("./GEOSEARCH").GeoSearchBy, options?: import("./GEOSEARCHSTORE").GeoSearchStoreOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly GET: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    readonly get: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    readonly GETBIT: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, offset: number) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<import("./generic-transformers").BitValue>;
    };
    readonly getBit: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, offset: number) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<import("./generic-transformers").BitValue>;
    };
    readonly GETDEL: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    readonly getDel: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    readonly GETEX: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, options: import("./GETEX").GetExOptions) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    readonly getEx: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, options: import("./GETEX").GetExOptions) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    readonly GETRANGE: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, start: number, end: number) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    readonly getRange: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, start: number, end: number) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    readonly GETSET: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, value: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    readonly getSet: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, value: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    readonly HDEL: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, field: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly hDel: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, field: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly HELLO: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, protover?: import("../RESP/types").RespVersions | undefined, options?: import("./HELLO").HelloOptions | undefined) => void;
        readonly transformReply: {
            readonly 2: (reply: [import("../RESP/types").BlobStringReply<"server">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"version">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"proto">, import("../RESP/types").NumberReply<import("../RESP/types").RespVersions>, import("../RESP/types").BlobStringReply<"id">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"mode">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"role">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"modules">, import("../RESP/types").RespType<42, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>]) => {
                server: import("../RESP/types").BlobStringReply<string>;
                version: import("../RESP/types").BlobStringReply<string>;
                proto: import("../RESP/types").NumberReply<import("../RESP/types").RespVersions>;
                id: import("../RESP/types").NumberReply<number>;
                mode: import("../RESP/types").BlobStringReply<string>;
                role: import("../RESP/types").BlobStringReply<string>;
                modules: import("../RESP/types").RespType<42, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>;
            };
            readonly 3: () => import("./HELLO").HelloReply;
        };
    };
    readonly hello: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, protover?: import("../RESP/types").RespVersions | undefined, options?: import("./HELLO").HelloOptions | undefined) => void;
        readonly transformReply: {
            readonly 2: (reply: [import("../RESP/types").BlobStringReply<"server">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"version">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"proto">, import("../RESP/types").NumberReply<import("../RESP/types").RespVersions>, import("../RESP/types").BlobStringReply<"id">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"mode">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"role">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"modules">, import("../RESP/types").RespType<42, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>]) => {
                server: import("../RESP/types").BlobStringReply<string>;
                version: import("../RESP/types").BlobStringReply<string>;
                proto: import("../RESP/types").NumberReply<import("../RESP/types").RespVersions>;
                id: import("../RESP/types").NumberReply<number>;
                mode: import("../RESP/types").BlobStringReply<string>;
                role: import("../RESP/types").BlobStringReply<string>;
                modules: import("../RESP/types").RespType<42, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>;
            };
            readonly 3: () => import("./HELLO").HelloReply;
        };
    };
    readonly HEXISTS: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, field: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<0 | 1>;
    };
    readonly hExists: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, field: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<0 | 1>;
    };
    readonly HEXPIRE: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, fields: import("./generic-transformers").RedisVariadicArgument, seconds: number, mode?: "NX" | "XX" | "GT" | "LT" | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("./HEXPIRE").HashExpiration>;
    };
    readonly hExpire: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, fields: import("./generic-transformers").RedisVariadicArgument, seconds: number, mode?: "NX" | "XX" | "GT" | "LT" | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("./HEXPIRE").HashExpiration>;
    };
    readonly HEXPIREAT: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, fields: import("./generic-transformers").RedisVariadicArgument, timestamp: number | Date, mode?: "NX" | "XX" | "GT" | "LT" | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").NumberReply<number>>;
    };
    readonly hExpireAt: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, fields: import("./generic-transformers").RedisVariadicArgument, timestamp: number | Date, mode?: "NX" | "XX" | "GT" | "LT" | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").NumberReply<number>>;
    };
    readonly HEXPIRETIME: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, fields: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").NumberReply<number>>;
    };
    readonly hExpireTime: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, fields: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").NumberReply<number>>;
    };
    readonly HGET: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, field: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    readonly hGet: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, field: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    readonly HGETALL: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly TRANSFORM_LEGACY_REPLY: true;
        readonly transformReply: {
            readonly 2: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => import("../RESP/types").MapReply<import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>>;
            readonly 3: () => import("../RESP/types").MapReply<import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>>;
        };
    };
    readonly hGetAll: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly TRANSFORM_LEGACY_REPLY: true;
        readonly transformReply: {
            readonly 2: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => import("../RESP/types").MapReply<import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>>;
            readonly 3: () => import("../RESP/types").MapReply<import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>>;
        };
    };
    readonly HGETDEL: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, fields: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>>;
    };
    readonly hGetDel: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, fields: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>>;
    };
    readonly HGETEX: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, fields: import("./generic-transformers").RedisVariadicArgument, options?: import("./HGETEX").HGetExOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>>;
    };
    readonly hGetEx: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, fields: import("./generic-transformers").RedisVariadicArgument, options?: import("./HGETEX").HGetExOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>>;
    };
    readonly HINCRBY: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, field: import("../RESP/types").RedisArgument, increment: number) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly hIncrBy: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, field: import("../RESP/types").RedisArgument, increment: number) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly HINCRBYFLOAT: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, field: import("../RESP/types").RedisArgument, increment: number) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    readonly hIncrByFloat: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, field: import("../RESP/types").RedisArgument, increment: number) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    readonly HKEYS: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly hKeys: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly HLEN: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly hLen: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly HMGET: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, fields: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>>;
    };
    readonly hmGet: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, fields: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>>;
    };
    readonly HPERSIST: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, fields: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").ArrayReply<import("../RESP/types").NumberReply<number>>;
    };
    readonly hPersist: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, fields: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").ArrayReply<import("../RESP/types").NumberReply<number>>;
    };
    readonly HPEXPIRE: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, fields: import("./generic-transformers").RedisVariadicArgument, ms: number, mode?: "NX" | "XX" | "GT" | "LT" | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").ArrayReply<import("./HEXPIRE").HashExpiration>;
    };
    readonly hpExpire: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, fields: import("./generic-transformers").RedisVariadicArgument, ms: number, mode?: "NX" | "XX" | "GT" | "LT" | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").ArrayReply<import("./HEXPIRE").HashExpiration>;
    };
    readonly HPEXPIREAT: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, fields: import("./generic-transformers").RedisVariadicArgument, timestamp: number | Date, mode?: "NX" | "XX" | "GT" | "LT" | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").ArrayReply<import("./HEXPIRE").HashExpiration>;
    };
    readonly hpExpireAt: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, fields: import("./generic-transformers").RedisVariadicArgument, timestamp: number | Date, mode?: "NX" | "XX" | "GT" | "LT" | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").ArrayReply<import("./HEXPIRE").HashExpiration>;
    };
    readonly HPEXPIRETIME: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, fields: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").ArrayReply<import("../RESP/types").NumberReply<number>>;
    };
    readonly hpExpireTime: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, fields: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").ArrayReply<import("../RESP/types").NumberReply<number>>;
    };
    readonly HPTTL: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, fields: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").ArrayReply<import("../RESP/types").NumberReply<number>>;
    };
    readonly hpTTL: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, fields: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").ArrayReply<import("../RESP/types").NumberReply<number>>;
    };
    readonly HRANDFIELD_COUNT_WITHVALUES: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, count: number) => void;
        readonly transformReply: {
            readonly 2: (rawReply: import("../RESP/types").BlobStringReply<string>[]) => import("./HRANDFIELD_COUNT_WITHVALUES").HRandFieldCountWithValuesReply;
            readonly 3: (reply: import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>]>[]) => {
                field: import("../RESP/types").BlobStringReply<string>;
                value: import("../RESP/types").BlobStringReply<string>;
            }[];
        };
    };
    readonly hRandFieldCountWithValues: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, count: number) => void;
        readonly transformReply: {
            readonly 2: (rawReply: import("../RESP/types").BlobStringReply<string>[]) => import("./HRANDFIELD_COUNT_WITHVALUES").HRandFieldCountWithValuesReply;
            readonly 3: (reply: import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>]>[]) => {
                field: import("../RESP/types").BlobStringReply<string>;
                value: import("../RESP/types").BlobStringReply<string>;
            }[];
        };
    };
    readonly HRANDFIELD_COUNT: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, count: number) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly hRandFieldCount: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, count: number) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly HRANDFIELD: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    readonly hRandField: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    readonly HSCAN: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, cursor: import("../RESP/types").RedisArgument, options?: import("./SCAN").ScanCommonOptions | undefined) => void;
        readonly transformReply: (this: void, [cursor, rawEntries]: [import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>[]]) => {
            cursor: import("../RESP/types").BlobStringReply<string>;
            entries: {
                field: import("../RESP/types").BlobStringReply<string>;
                value: import("../RESP/types").BlobStringReply<string>;
            }[];
        };
    };
    readonly hScan: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, cursor: import("../RESP/types").RedisArgument, options?: import("./SCAN").ScanCommonOptions | undefined) => void;
        readonly transformReply: (this: void, [cursor, rawEntries]: [import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>[]]) => {
            cursor: import("../RESP/types").BlobStringReply<string>;
            entries: {
                field: import("../RESP/types").BlobStringReply<string>;
                value: import("../RESP/types").BlobStringReply<string>;
            }[];
        };
    };
    readonly HSCAN_NOVALUES: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, cursor: import("../RESP/types").RedisArgument, options?: import("./SCAN").ScanCommonOptions | undefined) => void;
        readonly transformReply: (this: void, [cursor, fields]: [import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>[]]) => {
            cursor: import("../RESP/types").BlobStringReply<string>;
            fields: import("../RESP/types").BlobStringReply<string>[];
        };
    };
    readonly hScanNoValues: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, cursor: import("../RESP/types").RedisArgument, options?: import("./SCAN").ScanCommonOptions | undefined) => void;
        readonly transformReply: (this: void, [cursor, fields]: [import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>[]]) => {
            cursor: import("../RESP/types").BlobStringReply<string>;
            fields: import("../RESP/types").BlobStringReply<string>[];
        };
    };
    readonly HSET: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, ...[key, value, fieldValue]: [key: import("../RESP/types").RedisArgument, field: import("./HSET").HashTypes, value: import("./HSET").HashTypes] | [key: import("../RESP/types").RedisArgument, value: {
            [x: string]: import("./HSET").HashTypes;
            [x: number]: import("./HSET").HashTypes;
        } | Map<import("./HSET").HashTypes, import("./HSET").HashTypes> | ([import("./HSET").HashTypes, import("./HSET").HashTypes][] | import("./HSET").HashTypes[])]) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly hSet: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, ...[key, value, fieldValue]: [key: import("../RESP/types").RedisArgument, field: import("./HSET").HashTypes, value: import("./HSET").HashTypes] | [key: import("../RESP/types").RedisArgument, value: {
            [x: string]: import("./HSET").HashTypes;
            [x: number]: import("./HSET").HashTypes;
        } | Map<import("./HSET").HashTypes, import("./HSET").HashTypes> | ([import("./HSET").HashTypes, import("./HSET").HashTypes][] | import("./HSET").HashTypes[])]) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly HSETEX: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, fields: {
            [x: string]: import("./HSETEX").HashTypes;
            [x: number]: import("./HSETEX").HashTypes;
        } | Map<import("./HSETEX").HashTypes, import("./HSETEX").HashTypes> | ([import("./HSETEX").HashTypes, import("./HSETEX").HashTypes][] | import("./HSETEX").HashTypes[]), options?: import("./HSETEX").HSetExOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<0 | 1>;
    };
    readonly hSetEx: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, fields: {
            [x: string]: import("./HSETEX").HashTypes;
            [x: number]: import("./HSETEX").HashTypes;
        } | Map<import("./HSETEX").HashTypes, import("./HSETEX").HashTypes> | ([import("./HSETEX").HashTypes, import("./HSETEX").HashTypes][] | import("./HSETEX").HashTypes[]), options?: import("./HSETEX").HSetExOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<0 | 1>;
    };
    readonly HSETNX: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, field: import("../RESP/types").RedisArgument, value: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<0 | 1>;
    };
    readonly hSetNX: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, field: import("../RESP/types").RedisArgument, value: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<0 | 1>;
    };
    readonly HSTRLEN: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, field: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly hStrLen: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, field: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly HTTL: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, fields: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").ArrayReply<import("../RESP/types").NumberReply<number>>;
    };
    readonly hTTL: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, fields: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").ArrayReply<import("../RESP/types").NumberReply<number>>;
    };
    readonly HVALS: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly hVals: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly HOTKEYS_GET: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: {
            readonly 2: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string> | import("../RESP/types").NumberReply<number> | import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string> | import("../RESP/types").NumberReply<number>>>[] | null) => import("./HOTKEYS_GET").HotkeysGetReply | null;
            readonly 3: () => import("../RESP/types").ReplyUnion;
        };
        readonly unstableResp3: true;
    };
    readonly hotkeysGet: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: {
            readonly 2: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string> | import("../RESP/types").NumberReply<number> | import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string> | import("../RESP/types").NumberReply<number>>>[] | null) => import("./HOTKEYS_GET").HotkeysGetReply | null;
            readonly 3: () => import("../RESP/types").ReplyUnion;
        };
        readonly unstableResp3: true;
    };
    readonly HOTKEYS_RESET: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly hotkeysReset: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly HOTKEYS_START: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, options: import("./HOTKEYS_START").HotkeysStartOptions) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly hotkeysStart: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, options: import("./HOTKEYS_START").HotkeysStartOptions) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly HOTKEYS_STOP: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly hotkeysStop: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly INCR: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly incr: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly INCRBY: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, increment: number) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly incrBy: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, increment: number) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly INCRBYFLOAT: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, increment: number) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    readonly incrByFloat: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, increment: number) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    readonly INFO: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, section?: import("../RESP/types").RedisArgument | undefined) => void;
        readonly transformReply: () => import("../RESP/types").VerbatimStringReply<string>;
    };
    readonly info: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, section?: import("../RESP/types").RedisArgument | undefined) => void;
        readonly transformReply: () => import("../RESP/types").VerbatimStringReply<string>;
    };
    readonly KEYS: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, pattern: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly keys: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, pattern: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly LASTSAVE: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly lastSave: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly LATENCY_DOCTOR: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    readonly latencyDoctor: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    readonly LATENCY_GRAPH: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, event: import("./LATENCY_GRAPH").LatencyEvent) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    readonly latencyGraph: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, event: import("./LATENCY_GRAPH").LatencyEvent) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    readonly LATENCY_HISTORY: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, event: import("./LATENCY_HISTORY").LatencyEventType) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").TuplesReply<[timestamp: import("../RESP/types").NumberReply<number>, latency: import("../RESP/types").NumberReply<number>]>>;
    };
    readonly latencyHistory: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, event: import("./LATENCY_HISTORY").LatencyEventType) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").TuplesReply<[timestamp: import("../RESP/types").NumberReply<number>, latency: import("../RESP/types").NumberReply<number>]>>;
    };
    readonly LATENCY_HISTOGRAM: {
        readonly CACHEABLE: false;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, ...commands: string[]) => void;
        readonly transformReply: {
            readonly 2: (reply: (string | [string, number, string, number[]])[]) => {
                [x: string]: {
                    calls: number;
                    histogram_usec: Record<string, number>;
                };
            };
            readonly 3: () => {
                [x: string]: {
                    calls: number;
                    histogram_usec: Record<string, number>;
                };
            };
        };
    };
    readonly latencyHistogram: {
        readonly CACHEABLE: false;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, ...commands: string[]) => void;
        readonly transformReply: {
            readonly 2: (reply: (string | [string, number, string, number[]])[]) => {
                [x: string]: {
                    calls: number;
                    histogram_usec: Record<string, number>;
                };
            };
            readonly 3: () => {
                [x: string]: {
                    calls: number;
                    histogram_usec: Record<string, number>;
                };
            };
        };
    };
    readonly LATENCY_LATEST: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<[name: import("../RESP/types").BlobStringReply<string>, timestamp: import("../RESP/types").NumberReply<number>, latestLatency: import("../RESP/types").NumberReply<number>, allTimeLatency: import("../RESP/types").NumberReply<number>]>;
    };
    readonly latencyLatest: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<[name: import("../RESP/types").BlobStringReply<string>, timestamp: import("../RESP/types").NumberReply<number>, latestLatency: import("../RESP/types").NumberReply<number>, allTimeLatency: import("../RESP/types").NumberReply<number>]>;
    };
    readonly LATENCY_RESET: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, ...events: import("./LATENCY_GRAPH").LatencyEvent[]) => void;
        readonly transformReply: () => number;
    };
    readonly latencyReset: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, ...events: import("./LATENCY_GRAPH").LatencyEvent[]) => void;
        readonly transformReply: () => number;
    };
    readonly LCS_IDX_WITHMATCHLEN: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key1: import("../RESP/types").RedisArgument, key2: import("../RESP/types").RedisArgument, options?: import("./LCS_IDX").LcsIdxOptions | undefined) => void;
        readonly transformReply: {
            readonly 2: (reply: [import("../RESP/types").BlobStringReply<"matches">, import("../RESP/types").RespType<42, import("../RESP/types").RespType<42, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").NumberReply<number>]>[], never, import("../RESP/types").RespType<42, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").NumberReply<number>]>[]>, import("../RESP/types").BlobStringReply<"len">, import("../RESP/types").NumberReply<number>]) => {
                matches: import("../RESP/types").RespType<42, import("../RESP/types").RespType<42, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").NumberReply<number>]>[], never, import("../RESP/types").RespType<42, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").NumberReply<number>]>[]>;
                len: import("../RESP/types").NumberReply<number>;
            };
            readonly 3: () => import("./LCS_IDX_WITHMATCHLEN").LcsIdxWithMatchLenReply;
        };
    };
    readonly lcsIdxWithMatchLen: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key1: import("../RESP/types").RedisArgument, key2: import("../RESP/types").RedisArgument, options?: import("./LCS_IDX").LcsIdxOptions | undefined) => void;
        readonly transformReply: {
            readonly 2: (reply: [import("../RESP/types").BlobStringReply<"matches">, import("../RESP/types").RespType<42, import("../RESP/types").RespType<42, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").NumberReply<number>]>[], never, import("../RESP/types").RespType<42, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").NumberReply<number>]>[]>, import("../RESP/types").BlobStringReply<"len">, import("../RESP/types").NumberReply<number>]) => {
                matches: import("../RESP/types").RespType<42, import("../RESP/types").RespType<42, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").NumberReply<number>]>[], never, import("../RESP/types").RespType<42, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").NumberReply<number>]>[]>;
                len: import("../RESP/types").NumberReply<number>;
            };
            readonly 3: () => import("./LCS_IDX_WITHMATCHLEN").LcsIdxWithMatchLenReply;
        };
    };
    readonly LCS_IDX: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key1: import("../RESP/types").RedisArgument, key2: import("../RESP/types").RedisArgument, options?: import("./LCS_IDX").LcsIdxOptions | undefined) => void;
        readonly transformReply: {
            readonly 2: (reply: [import("../RESP/types").BlobStringReply<"matches">, import("../RESP/types").RespType<42, import("../RESP/types").RespType<42, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>], never, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>]>[], never, import("../RESP/types").RespType<42, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>], never, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>]>[]>, import("../RESP/types").BlobStringReply<"len">, import("../RESP/types").NumberReply<number>]) => {
                matches: import("../RESP/types").RespType<42, import("../RESP/types").RespType<42, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>], never, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>]>[], never, import("../RESP/types").RespType<42, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>], never, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>]>[]>;
                len: import("../RESP/types").NumberReply<number>;
            };
            readonly 3: () => import("./LCS_IDX").LcsIdxReply;
        };
    };
    readonly lcsIdx: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key1: import("../RESP/types").RedisArgument, key2: import("../RESP/types").RedisArgument, options?: import("./LCS_IDX").LcsIdxOptions | undefined) => void;
        readonly transformReply: {
            readonly 2: (reply: [import("../RESP/types").BlobStringReply<"matches">, import("../RESP/types").RespType<42, import("../RESP/types").RespType<42, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>], never, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>]>[], never, import("../RESP/types").RespType<42, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>], never, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>]>[]>, import("../RESP/types").BlobStringReply<"len">, import("../RESP/types").NumberReply<number>]) => {
                matches: import("../RESP/types").RespType<42, import("../RESP/types").RespType<42, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>], never, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>]>[], never, import("../RESP/types").RespType<42, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>], never, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>]>[]>;
                len: import("../RESP/types").NumberReply<number>;
            };
            readonly 3: () => import("./LCS_IDX").LcsIdxReply;
        };
    };
    readonly LCS_LEN: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key1: import("../RESP/types").RedisArgument, key2: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly lcsLen: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key1: import("../RESP/types").RedisArgument, key2: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly LCS: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key1: import("../RESP/types").RedisArgument, key2: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    readonly lcs: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key1: import("../RESP/types").RedisArgument, key2: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    readonly LINDEX: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, index: number) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    readonly lIndex: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, index: number) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    readonly LINSERT: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, position: "BEFORE" | "AFTER", pivot: import("../RESP/types").RedisArgument, element: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly lInsert: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, position: "BEFORE" | "AFTER", pivot: import("../RESP/types").RedisArgument, element: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly LLEN: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly lLen: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly LMOVE: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, source: import("../RESP/types").RedisArgument, destination: import("../RESP/types").RedisArgument, sourceSide: import("./generic-transformers").ListSide, destinationSide: import("./generic-transformers").ListSide) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    readonly lMove: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, source: import("../RESP/types").RedisArgument, destination: import("../RESP/types").RedisArgument, sourceSide: import("./generic-transformers").ListSide, destinationSide: import("./generic-transformers").ListSide) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    readonly LMPOP: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").RedisVariadicArgument, side: import("./generic-transformers").ListSide, options?: import("./LMPOP").LMPopOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").TuplesReply<[key: import("../RESP/types").BlobStringReply<string>, elements: import("../RESP/types").BlobStringReply<string>[]]>;
    };
    readonly lmPop: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").RedisVariadicArgument, side: import("./generic-transformers").ListSide, options?: import("./LMPOP").LMPopOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").TuplesReply<[key: import("../RESP/types").BlobStringReply<string>, elements: import("../RESP/types").BlobStringReply<string>[]]>;
    };
    readonly LOLWUT: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, version?: number | undefined, ...optionalArguments: number[]) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    readonly LPOP_COUNT: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, count: number) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly lPopCount: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, count: number) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly LPOP: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    readonly lPop: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    readonly LPOS_COUNT: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, element: import("../RESP/types").RedisArgument, count: number, options?: import("./LPOS").LPosOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").NumberReply<number>>;
    };
    readonly lPosCount: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, element: import("../RESP/types").RedisArgument, count: number, options?: import("./LPOS").LPosOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").NumberReply<number>>;
    };
    readonly LPOS: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, element: import("../RESP/types").RedisArgument, options?: import("./LPOS").LPosOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").NumberReply<number>;
    };
    readonly lPos: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, element: import("../RESP/types").RedisArgument, options?: import("./LPOS").LPosOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").NumberReply<number>;
    };
    readonly LPUSH: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, elements: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly lPush: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, elements: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly LPUSHX: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, elements: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly lPushX: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, elements: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly LRANGE: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, start: number, stop: number) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly lRange: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, start: number, stop: number) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly LREM: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, count: number, element: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly lRem: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, count: number, element: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly LSET: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, index: number, element: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly lSet: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, index: number, element: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly LTRIM: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, start: number, stop: number) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly lTrim: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, start: number, stop: number) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly MEMORY_DOCTOR: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    readonly memoryDoctor: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    readonly 'MEMORY_MALLOC-STATS': {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    readonly memoryMallocStats: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    readonly MEMORY_PURGE: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly memoryPurge: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly MEMORY_STATS: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: {
            readonly 2: (rawReply: (import("../RESP/types").BlobStringReply<string> | import("../RESP/types").NumberReply<number>)[], preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => import("./MEMORY_STATS").MemoryStatsReply;
            readonly 3: () => import("./MEMORY_STATS").MemoryStatsReply;
        };
    };
    readonly memoryStats: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: {
            readonly 2: (rawReply: (import("../RESP/types").BlobStringReply<string> | import("../RESP/types").NumberReply<number>)[], preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => import("./MEMORY_STATS").MemoryStatsReply;
            readonly 3: () => import("./MEMORY_STATS").MemoryStatsReply;
        };
    };
    readonly MEMORY_USAGE: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, options?: import("./MEMORY_USAGE").MemoryUsageOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").NumberReply<number>;
    };
    readonly memoryUsage: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, options?: import("./MEMORY_USAGE").MemoryUsageOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").NumberReply<number>;
    };
    readonly MGET: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("../RESP/types").RedisArgument[]) => void;
        readonly transformReply: () => (import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>)[];
    };
    readonly mGet: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("../RESP/types").RedisArgument[]) => void;
        readonly transformReply: () => (import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>)[];
    };
    readonly MIGRATE: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, host: import("../RESP/types").RedisArgument, port: number, key: import("../RESP/types").RedisArgument | import("../RESP/types").RedisArgument[], destinationDb: number, timeout: number, options?: import("./MIGRATE").MigrateOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly migrate: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, host: import("../RESP/types").RedisArgument, port: number, key: import("../RESP/types").RedisArgument | import("../RESP/types").RedisArgument[], destinationDb: number, timeout: number, options?: import("./MIGRATE").MigrateOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly MODULE_LIST: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: {
            readonly 2: (reply: import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"ver">, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"ver">, import("../RESP/types").NumberReply<number>]>[]) => {
                name: import("../RESP/types").BlobStringReply<string>;
                ver: import("../RESP/types").NumberReply<number>;
            }[];
            readonly 3: () => import("./MODULE_LIST").ModuleListReply;
        };
    };
    readonly moduleList: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: {
            readonly 2: (reply: import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"ver">, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"ver">, import("../RESP/types").NumberReply<number>]>[]) => {
                name: import("../RESP/types").BlobStringReply<string>;
                ver: import("../RESP/types").NumberReply<number>;
            }[];
            readonly 3: () => import("./MODULE_LIST").ModuleListReply;
        };
    };
    readonly MODULE_LOAD: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, path: import("../RESP/types").RedisArgument, moduleArguments?: import("../RESP/types").RedisArgument[] | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly moduleLoad: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, path: import("../RESP/types").RedisArgument, moduleArguments?: import("../RESP/types").RedisArgument[] | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly MODULE_UNLOAD: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, name: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly moduleUnload: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, name: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly MOVE: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, db: number) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly move: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, db: number) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly MSET: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, toSet: import("./MSET").MSetArguments) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly mSet: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, toSet: import("./MSET").MSetArguments) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly MSETEX: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keyValuePairs: import("./MSET").MSetArguments, options?: {
            expiration?: ({
                type: "EX";
                value: number;
            } | {
                type: "PX";
                value: number;
            } | {
                type: "EXAT";
                value: number | Date;
            } | {
                type: "PXAT";
                value: number | Date;
            } | {
                type: "KEEPTTL";
            }) | undefined;
            mode?: ("NX" | "XX") | undefined;
        } | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<0 | 1>;
    };
    readonly mSetEx: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keyValuePairs: import("./MSET").MSetArguments, options?: {
            expiration?: ({
                type: "EX";
                value: number;
            } | {
                type: "PX";
                value: number;
            } | {
                type: "EXAT";
                value: number | Date;
            } | {
                type: "PXAT";
                value: number | Date;
            } | {
                type: "KEEPTTL";
            }) | undefined;
            mode?: ("NX" | "XX") | undefined;
        } | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<0 | 1>;
    };
    readonly MSETNX: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, toSet: import("./MSET").MSetArguments) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly mSetNX: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, toSet: import("./MSET").MSetArguments) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly OBJECT_ENCODING: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    readonly objectEncoding: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    readonly OBJECT_FREQ: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").NumberReply<number>;
    };
    readonly objectFreq: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").NumberReply<number>;
    };
    readonly OBJECT_IDLETIME: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").NumberReply<number>;
    };
    readonly objectIdleTime: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").NumberReply<number>;
    };
    readonly OBJECT_REFCOUNT: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").NumberReply<number>;
    };
    readonly objectRefCount: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").NumberReply<number>;
    };
    readonly PERSIST: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly persist: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly PEXPIRE: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, ms: number, mode?: "NX" | "XX" | "GT" | "LT" | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly pExpire: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, ms: number, mode?: "NX" | "XX" | "GT" | "LT" | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly PEXPIREAT: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, msTimestamp: number | Date, mode?: "NX" | "XX" | "GT" | "LT" | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly pExpireAt: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, msTimestamp: number | Date, mode?: "NX" | "XX" | "GT" | "LT" | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly PEXPIRETIME: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly pExpireTime: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly PFADD: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, element?: import("./generic-transformers").RedisVariadicArgument | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly pfAdd: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, element?: import("./generic-transformers").RedisVariadicArgument | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly PFCOUNT: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly pfCount: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly PFMERGE: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, destination: import("../RESP/types").RedisArgument, sources?: import("./generic-transformers").RedisVariadicArgument | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    readonly pfMerge: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, destination: import("../RESP/types").RedisArgument, sources?: import("./generic-transformers").RedisVariadicArgument | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    readonly PING: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, message?: import("../RESP/types").RedisArgument | undefined) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string> | import("../RESP/types").SimpleStringReply<string>;
    };
    /**
     * ping jsdoc
     */
    readonly ping: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, message?: import("../RESP/types").RedisArgument | undefined) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string> | import("../RESP/types").SimpleStringReply<string>;
    };
    readonly PSETEX: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, ms: number, value: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly pSetEx: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, ms: number, value: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly PTTL: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly pTTL: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly PUBLISH: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly IS_FORWARD_COMMAND: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, channel: import("../RESP/types").RedisArgument, message: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly publish: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly IS_FORWARD_COMMAND: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, channel: import("../RESP/types").RedisArgument, message: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly PUBSUB_CHANNELS: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, pattern?: import("../RESP/types").RedisArgument | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly pubSubChannels: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, pattern?: import("../RESP/types").RedisArgument | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly PUBSUB_NUMPAT: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly pubSubNumPat: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly PUBSUB_NUMSUB: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, channels?: import("./generic-transformers").RedisVariadicArgument | undefined) => void;
        readonly transformReply: (this: void, rawReply: (import("../RESP/types").BlobStringReply<string> | import("../RESP/types").NumberReply<number>)[]) => Record<string, import("../RESP/types").NumberReply<number>>;
    };
    readonly pubSubNumSub: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, channels?: import("./generic-transformers").RedisVariadicArgument | undefined) => void;
        readonly transformReply: (this: void, rawReply: (import("../RESP/types").BlobStringReply<string> | import("../RESP/types").NumberReply<number>)[]) => Record<string, import("../RESP/types").NumberReply<number>>;
    };
    readonly PUBSUB_SHARDNUMSUB: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, channels?: import("./generic-transformers").RedisVariadicArgument | undefined) => void;
        readonly transformReply: (this: void, reply: (import("../RESP/types").BlobStringReply<string> | import("../RESP/types").NumberReply<number>)[]) => Record<string, import("../RESP/types").NumberReply<number>>;
    };
    readonly pubSubShardNumSub: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, channels?: import("./generic-transformers").RedisVariadicArgument | undefined) => void;
        readonly transformReply: (this: void, reply: (import("../RESP/types").BlobStringReply<string> | import("../RESP/types").NumberReply<number>)[]) => Record<string, import("../RESP/types").NumberReply<number>>;
    };
    readonly PUBSUB_SHARDCHANNELS: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, pattern?: import("../RESP/types").RedisArgument | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly pubSubShardChannels: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, pattern?: import("../RESP/types").RedisArgument | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly RANDOMKEY: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly randomKey: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly READONLY: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    readonly readonly: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    readonly RENAME: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, newKey: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    readonly rename: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, newKey: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    readonly RENAMENX: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, newKey: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly renameNX: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, newKey: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly REPLICAOF: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, host: string, port: number) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    readonly replicaOf: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, host: string, port: number) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    readonly 'RESTORE-ASKING': {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    readonly restoreAsking: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    readonly RESTORE: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, ttl: number, serializedValue: import("../RESP/types").RedisArgument, options?: import("./RESTORE").RestoreOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly restore: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, ttl: number, serializedValue: import("../RESP/types").RedisArgument, options?: import("./RESTORE").RestoreOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly RPOP_COUNT: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, count: number) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly rPopCount: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, count: number) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly ROLE: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: (this: void, reply: import("../RESP/types").UnwrapReply<import("../RESP/types").TuplesReply<[role: import("../RESP/types").BlobStringReply<"master">, replicationOffest: import("../RESP/types").NumberReply<number>, replicas: import("../RESP/types").ArrayReply<import("../RESP/types").TuplesReply<[host: import("../RESP/types").BlobStringReply<string>, port: import("../RESP/types").BlobStringReply<string>, replicationOffest: import("../RESP/types").BlobStringReply<string>]>>] | [role: import("../RESP/types").BlobStringReply<"slave">, masterHost: import("../RESP/types").BlobStringReply<string>, masterPort: import("../RESP/types").NumberReply<number>, state: import("../RESP/types").BlobStringReply<"connect" | "connecting" | "sync" | "connected">, dataReceived: import("../RESP/types").NumberReply<number>] | [role: import("../RESP/types").BlobStringReply<"sentinel">, masterNames: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>]>>) => {
            role: import("../RESP/types").BlobStringReply<"master">;
            replicationOffest: import("../RESP/types").NumberReply<number>;
            replicas: {
                host: import("../RESP/types").BlobStringReply<string>;
                port: number;
                replicationOffest: number;
            }[];
            master?: undefined;
            state?: undefined;
            dataReceived?: undefined;
            masterNames?: undefined;
        } | {
            role: import("../RESP/types").BlobStringReply<"slave">;
            master: {
                host: import("../RESP/types").BlobStringReply<string>;
                port: import("../RESP/types").NumberReply<number>;
            };
            state: import("../RESP/types").BlobStringReply<"connect" | "connecting" | "sync" | "connected">;
            dataReceived: import("../RESP/types").NumberReply<number>;
            replicationOffest?: undefined;
            replicas?: undefined;
            masterNames?: undefined;
        } | {
            role: import("../RESP/types").BlobStringReply<"sentinel">;
            masterNames: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
            replicationOffest?: undefined;
            replicas?: undefined;
            master?: undefined;
            state?: undefined;
            dataReceived?: undefined;
        } | undefined;
    };
    readonly role: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: (this: void, reply: import("../RESP/types").UnwrapReply<import("../RESP/types").TuplesReply<[role: import("../RESP/types").BlobStringReply<"master">, replicationOffest: import("../RESP/types").NumberReply<number>, replicas: import("../RESP/types").ArrayReply<import("../RESP/types").TuplesReply<[host: import("../RESP/types").BlobStringReply<string>, port: import("../RESP/types").BlobStringReply<string>, replicationOffest: import("../RESP/types").BlobStringReply<string>]>>] | [role: import("../RESP/types").BlobStringReply<"slave">, masterHost: import("../RESP/types").BlobStringReply<string>, masterPort: import("../RESP/types").NumberReply<number>, state: import("../RESP/types").BlobStringReply<"connect" | "connecting" | "sync" | "connected">, dataReceived: import("../RESP/types").NumberReply<number>] | [role: import("../RESP/types").BlobStringReply<"sentinel">, masterNames: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>]>>) => {
            role: import("../RESP/types").BlobStringReply<"master">;
            replicationOffest: import("../RESP/types").NumberReply<number>;
            replicas: {
                host: import("../RESP/types").BlobStringReply<string>;
                port: number;
                replicationOffest: number;
            }[];
            master?: undefined;
            state?: undefined;
            dataReceived?: undefined;
            masterNames?: undefined;
        } | {
            role: import("../RESP/types").BlobStringReply<"slave">;
            master: {
                host: import("../RESP/types").BlobStringReply<string>;
                port: import("../RESP/types").NumberReply<number>;
            };
            state: import("../RESP/types").BlobStringReply<"connect" | "connecting" | "sync" | "connected">;
            dataReceived: import("../RESP/types").NumberReply<number>;
            replicationOffest?: undefined;
            replicas?: undefined;
            masterNames?: undefined;
        } | {
            role: import("../RESP/types").BlobStringReply<"sentinel">;
            masterNames: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
            replicationOffest?: undefined;
            replicas?: undefined;
            master?: undefined;
            state?: undefined;
            dataReceived?: undefined;
        } | undefined;
    };
    readonly RPOP: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    readonly rPop: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    readonly RPOPLPUSH: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, source: import("../RESP/types").RedisArgument, destination: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    readonly rPopLPush: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, source: import("../RESP/types").RedisArgument, destination: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    readonly RPUSH: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, element: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly rPush: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, element: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly RPUSHX: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, element: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly rPushX: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, element: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly SADD: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, members: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly sAdd: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, members: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly SCAN: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, cursor: import("../RESP/types").RedisArgument, options?: import("./SCAN").ScanOptions | undefined) => void;
        readonly transformReply: (this: void, [cursor, keys]: [import("../RESP/types").BlobStringReply<string>, import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>]) => {
            cursor: import("../RESP/types").BlobStringReply<string>;
            keys: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
        };
    };
    readonly scan: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, cursor: import("../RESP/types").RedisArgument, options?: import("./SCAN").ScanOptions | undefined) => void;
        readonly transformReply: (this: void, [cursor, keys]: [import("../RESP/types").BlobStringReply<string>, import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>]) => {
            cursor: import("../RESP/types").BlobStringReply<string>;
            keys: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
        };
    };
    readonly SCARD: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly sCard: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly SCRIPT_DEBUG: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, mode: "YES" | "NO" | "SYNC") => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly scriptDebug: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, mode: "YES" | "NO" | "SYNC") => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly SCRIPT_EXISTS: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, sha1: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").NumberReply<number>>;
    };
    readonly scriptExists: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, sha1: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").NumberReply<number>>;
    };
    readonly SCRIPT_FLUSH: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, mode?: "ASYNC" | "SYNC" | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly scriptFlush: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, mode?: "ASYNC" | "SYNC" | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly SCRIPT_KILL: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly scriptKill: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly SCRIPT_LOAD: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, script: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    readonly scriptLoad: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, script: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    readonly SDIFF: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly sDiff: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly SDIFFSTORE: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, destination: import("../RESP/types").RedisArgument, keys: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly sDiffStore: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, destination: import("../RESP/types").RedisArgument, keys: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly SET: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, value: number | import("../RESP/types").RedisArgument, options?: import("./SET").SetOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string> | import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly set: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, value: number | import("../RESP/types").RedisArgument, options?: import("./SET").SetOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string> | import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly SETBIT: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, offset: number, value: import("./generic-transformers").BitValue) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<import("./generic-transformers").BitValue>;
    };
    readonly setBit: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, offset: number, value: import("./generic-transformers").BitValue) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<import("./generic-transformers").BitValue>;
    };
    readonly SETEX: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, seconds: number, value: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly setEx: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, seconds: number, value: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly SETNX: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, value: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly setNX: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, value: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly SETRANGE: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, offset: number, value: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly setRange: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, offset: number, value: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly SINTER: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly sInter: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly SINTERCARD: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").RedisVariadicArgument, options?: number | import("./SINTERCARD").SInterCardOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly sInterCard: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").RedisVariadicArgument, options?: number | import("./SINTERCARD").SInterCardOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly SINTERSTORE: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, destination: import("../RESP/types").RedisArgument, keys: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly sInterStore: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, destination: import("../RESP/types").RedisArgument, keys: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly SISMEMBER: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, member: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly sIsMember: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, member: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly SMEMBERS: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: {
            readonly 2: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
            readonly 3: () => import("../RESP/types").SetReply<import("../RESP/types").BlobStringReply<string>>;
        };
    };
    readonly sMembers: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: {
            readonly 2: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
            readonly 3: () => import("../RESP/types").SetReply<import("../RESP/types").BlobStringReply<string>>;
        };
    };
    readonly SMISMEMBER: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, members: import("../RESP/types").RedisArgument[]) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").NumberReply<number>>;
    };
    readonly smIsMember: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, members: import("../RESP/types").RedisArgument[]) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").NumberReply<number>>;
    };
    readonly SMOVE: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, source: import("../RESP/types").RedisArgument, destination: import("../RESP/types").RedisArgument, member: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly sMove: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, source: import("../RESP/types").RedisArgument, destination: import("../RESP/types").RedisArgument, member: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly SORT_RO: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, options?: import("./SORT").SortOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly sortRo: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, options?: import("./SORT").SortOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly SORT_STORE: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, source: import("../RESP/types").RedisArgument, destination: import("../RESP/types").RedisArgument, options?: import("./SORT").SortOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly sortStore: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, source: import("../RESP/types").RedisArgument, destination: import("../RESP/types").RedisArgument, options?: import("./SORT").SortOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly SORT: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, options?: import("./SORT").SortOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly sort: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, options?: import("./SORT").SortOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly SPOP_COUNT: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, count: number) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<string>;
    };
    readonly sPopCount: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, count: number) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<string>;
    };
    readonly SPOP: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    readonly sPop: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    readonly SPUBLISH: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, channel: import("../RESP/types").RedisArgument, message: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly sPublish: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, channel: import("../RESP/types").RedisArgument, message: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly SRANDMEMBER_COUNT: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, count: number) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly sRandMemberCount: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, count: number) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly SRANDMEMBER: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    readonly sRandMember: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    readonly SREM: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, members: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly sRem: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, members: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly SSCAN: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, cursor: import("../RESP/types").RedisArgument, options?: import("./SCAN").ScanCommonOptions | undefined) => void;
        readonly transformReply: (this: void, [cursor, members]: [import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>[]]) => {
            cursor: import("../RESP/types").BlobStringReply<string>;
            members: import("../RESP/types").BlobStringReply<string>[];
        };
    };
    readonly sScan: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, cursor: import("../RESP/types").RedisArgument, options?: import("./SCAN").ScanCommonOptions | undefined) => void;
        readonly transformReply: (this: void, [cursor, members]: [import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>[]]) => {
            cursor: import("../RESP/types").BlobStringReply<string>;
            members: import("../RESP/types").BlobStringReply<string>[];
        };
    };
    readonly STRLEN: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly strLen: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly SUNION: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly sUnion: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly SUNIONSTORE: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, destination: import("../RESP/types").RedisArgument, keys: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly sUnionStore: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, destination: import("../RESP/types").RedisArgument, keys: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly SWAPDB: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, index1: number, index2: number) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly swapDb: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, index1: number, index2: number) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly TIME: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => [unixTimestamp: import("../RESP/types").BlobStringReply<`${number}`>, microseconds: import("../RESP/types").BlobStringReply<`${number}`>];
    };
    readonly time: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => [unixTimestamp: import("../RESP/types").BlobStringReply<`${number}`>, microseconds: import("../RESP/types").BlobStringReply<`${number}`>];
    };
    readonly TOUCH: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly touch: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly TTL: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly ttl: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly TYPE: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    readonly type: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    readonly UNLINK: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly unlink: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly WAIT: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, numberOfReplicas: number, timeout: number) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly wait: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, numberOfReplicas: number, timeout: number) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly XACK: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, group: import("../RESP/types").RedisArgument, id: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly xAck: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, group: import("../RESP/types").RedisArgument, id: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly XACKDEL: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, group: import("../RESP/types").RedisArgument, id: import("./generic-transformers").RedisVariadicArgument, policy?: import("./common-stream.types").StreamDeletionPolicy | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("./common-stream.types").StreamDeletionReplyCode>;
    };
    readonly xAckDel: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, group: import("../RESP/types").RedisArgument, id: import("./generic-transformers").RedisVariadicArgument, policy?: import("./common-stream.types").StreamDeletionPolicy | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("./common-stream.types").StreamDeletionReplyCode>;
    };
    readonly XADD_NOMKSTREAM: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, id: import("../RESP/types").RedisArgument, message: Record<string, import("../RESP/types").RedisArgument>, options?: import("./XADD").XAddOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    readonly xAddNoMkStream: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, id: import("../RESP/types").RedisArgument, message: Record<string, import("../RESP/types").RedisArgument>, options?: import("./XADD").XAddOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    readonly XADD: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, id: import("../RESP/types").RedisArgument, message: Record<string, import("../RESP/types").RedisArgument>, options?: import("./XADD").XAddOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    readonly xAdd: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, id: import("../RESP/types").RedisArgument, message: Record<string, import("../RESP/types").RedisArgument>, options?: import("./XADD").XAddOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    readonly XAUTOCLAIM_JUSTID: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, group: import("../RESP/types").RedisArgument, consumer: import("../RESP/types").RedisArgument, minIdleTime: number, start: import("../RESP/types").RedisArgument, options?: import("./XAUTOCLAIM").XAutoClaimOptions | undefined) => void;
        readonly transformReply: (this: void, reply: [nextId: import("../RESP/types").BlobStringReply<string>, messages: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>, deletedMessages: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>]) => {
            nextId: import("../RESP/types").BlobStringReply<string>;
            messages: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
            deletedMessages: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
        };
    };
    readonly xAutoClaimJustId: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, group: import("../RESP/types").RedisArgument, consumer: import("../RESP/types").RedisArgument, minIdleTime: number, start: import("../RESP/types").RedisArgument, options?: import("./XAUTOCLAIM").XAutoClaimOptions | undefined) => void;
        readonly transformReply: (this: void, reply: [nextId: import("../RESP/types").BlobStringReply<string>, messages: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>, deletedMessages: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>]) => {
            nextId: import("../RESP/types").BlobStringReply<string>;
            messages: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
            deletedMessages: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
        };
    };
    readonly XAUTOCLAIM: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, group: import("../RESP/types").RedisArgument, consumer: import("../RESP/types").RedisArgument, minIdleTime: number, start: import("../RESP/types").RedisArgument, options?: import("./XAUTOCLAIM").XAutoClaimOptions | undefined) => void;
        readonly transformReply: (this: void, reply: [nextId: import("../RESP/types").BlobStringReply<string>, messages: import("../RESP/types").ArrayReply<import("../RESP/types").NullReply | import("./generic-transformers").StreamMessageRawReply>, deletedMessages: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>], preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
            nextId: import("../RESP/types").BlobStringReply<string>;
            messages: (import("../RESP/types").NullReply | import("./generic-transformers").StreamMessageReply)[];
            deletedMessages: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
        };
    };
    readonly xAutoClaim: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, group: import("../RESP/types").RedisArgument, consumer: import("../RESP/types").RedisArgument, minIdleTime: number, start: import("../RESP/types").RedisArgument, options?: import("./XAUTOCLAIM").XAutoClaimOptions | undefined) => void;
        readonly transformReply: (this: void, reply: [nextId: import("../RESP/types").BlobStringReply<string>, messages: import("../RESP/types").ArrayReply<import("../RESP/types").NullReply | import("./generic-transformers").StreamMessageRawReply>, deletedMessages: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>], preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
            nextId: import("../RESP/types").BlobStringReply<string>;
            messages: (import("../RESP/types").NullReply | import("./generic-transformers").StreamMessageReply)[];
            deletedMessages: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
        };
    };
    readonly XCLAIM_JUSTID: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, group: import("../RESP/types").RedisArgument, consumer: import("../RESP/types").RedisArgument, minIdleTime: number, id: import("./generic-transformers").RedisVariadicArgument, options?: import("./XCLAIM").XClaimOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly xClaimJustId: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, group: import("../RESP/types").RedisArgument, consumer: import("../RESP/types").RedisArgument, minIdleTime: number, id: import("./generic-transformers").RedisVariadicArgument, options?: import("./XCLAIM").XClaimOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly XCLAIM: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, group: import("../RESP/types").RedisArgument, consumer: import("../RESP/types").RedisArgument, minIdleTime: number, id: import("./generic-transformers").RedisVariadicArgument, options?: import("./XCLAIM").XClaimOptions | undefined) => void;
        readonly transformReply: (this: void, reply: (import("../RESP/types").NullReply | import("./generic-transformers").StreamMessageRawReply)[], preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => (import("../RESP/types").NullReply | import("./generic-transformers").StreamMessageReply)[];
    };
    readonly xClaim: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, group: import("../RESP/types").RedisArgument, consumer: import("../RESP/types").RedisArgument, minIdleTime: number, id: import("./generic-transformers").RedisVariadicArgument, options?: import("./XCLAIM").XClaimOptions | undefined) => void;
        readonly transformReply: (this: void, reply: (import("../RESP/types").NullReply | import("./generic-transformers").StreamMessageRawReply)[], preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => (import("../RESP/types").NullReply | import("./generic-transformers").StreamMessageReply)[];
    };
    readonly XCFGSET: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, options?: import("./XCFGSET").XCfgSetOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly xCfgSet: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, options?: import("./XCFGSET").XCfgSetOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly XDEL: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, id: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly xDel: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, id: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly XDELEX: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, id: import("./generic-transformers").RedisVariadicArgument, policy?: import("./common-stream.types").StreamDeletionPolicy | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("./common-stream.types").StreamDeletionReplyCode>;
    };
    readonly xDelEx: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, id: import("./generic-transformers").RedisVariadicArgument, policy?: import("./common-stream.types").StreamDeletionPolicy | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("./common-stream.types").StreamDeletionReplyCode>;
    };
    readonly XGROUP_CREATE: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, group: import("../RESP/types").RedisArgument, id: import("../RESP/types").RedisArgument, options?: import("./XGROUP_CREATE").XGroupCreateOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly xGroupCreate: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, group: import("../RESP/types").RedisArgument, id: import("../RESP/types").RedisArgument, options?: import("./XGROUP_CREATE").XGroupCreateOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly XGROUP_CREATECONSUMER: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, group: import("../RESP/types").RedisArgument, consumer: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly xGroupCreateConsumer: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, group: import("../RESP/types").RedisArgument, consumer: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly XGROUP_DELCONSUMER: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, group: import("../RESP/types").RedisArgument, consumer: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly xGroupDelConsumer: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, group: import("../RESP/types").RedisArgument, consumer: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly XGROUP_DESTROY: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, group: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly xGroupDestroy: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, group: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly XGROUP_SETID: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, group: import("../RESP/types").RedisArgument, id: import("../RESP/types").RedisArgument, options?: import("./XGROUP_SETID").XGroupSetIdOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly xGroupSetId: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, group: import("../RESP/types").RedisArgument, id: import("../RESP/types").RedisArgument, options?: import("./XGROUP_SETID").XGroupSetIdOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly XINFO_CONSUMERS: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, group: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: {
            readonly 2: (reply: import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"pending">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"idle">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"inactive">, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"pending">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"idle">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"inactive">, import("../RESP/types").NumberReply<number>]>[]) => {
                name: import("../RESP/types").BlobStringReply<string>;
                pending: import("../RESP/types").NumberReply<number>;
                idle: import("../RESP/types").NumberReply<number>;
                inactive: import("../RESP/types").NumberReply<number>;
            }[];
            readonly 3: () => import("./XINFO_CONSUMERS").XInfoConsumersReply;
        };
    };
    readonly xInfoConsumers: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, group: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: {
            readonly 2: (reply: import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"pending">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"idle">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"inactive">, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"pending">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"idle">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"inactive">, import("../RESP/types").NumberReply<number>]>[]) => {
                name: import("../RESP/types").BlobStringReply<string>;
                pending: import("../RESP/types").NumberReply<number>;
                idle: import("../RESP/types").NumberReply<number>;
                inactive: import("../RESP/types").NumberReply<number>;
            }[];
            readonly 3: () => import("./XINFO_CONSUMERS").XInfoConsumersReply;
        };
    };
    readonly XINFO_GROUPS: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: {
            readonly 2: (reply: import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"consumers">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"pending">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"last-delivered-id">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"entries-read">, import("../RESP/types").NullReply | import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"lag">, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"consumers">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"pending">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"last-delivered-id">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"entries-read">, import("../RESP/types").NullReply | import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"lag">, import("../RESP/types").NumberReply<number>]>[]) => {
                name: import("../RESP/types").BlobStringReply<string>;
                consumers: import("../RESP/types").NumberReply<number>;
                pending: import("../RESP/types").NumberReply<number>;
                'last-delivered-id': import("../RESP/types").NumberReply<number>;
                'entries-read': import("../RESP/types").NullReply | import("../RESP/types").NumberReply<number>;
                lag: import("../RESP/types").NumberReply<number>;
            }[];
            readonly 3: () => import("./XINFO_GROUPS").XInfoGroupsReply;
        };
    };
    readonly xInfoGroups: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: {
            readonly 2: (reply: import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"consumers">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"pending">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"last-delivered-id">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"entries-read">, import("../RESP/types").NullReply | import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"lag">, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"consumers">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"pending">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"last-delivered-id">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"entries-read">, import("../RESP/types").NullReply | import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"lag">, import("../RESP/types").NumberReply<number>]>[]) => {
                name: import("../RESP/types").BlobStringReply<string>;
                consumers: import("../RESP/types").NumberReply<number>;
                pending: import("../RESP/types").NumberReply<number>;
                'last-delivered-id': import("../RESP/types").NumberReply<number>;
                'entries-read': import("../RESP/types").NullReply | import("../RESP/types").NumberReply<number>;
                lag: import("../RESP/types").NumberReply<number>;
            }[];
            readonly 3: () => import("./XINFO_GROUPS").XInfoGroupsReply;
        };
    };
    readonly XINFO_STREAM: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: {
            readonly 2: (this: void, reply: any) => {
                length: import("../RESP/types").NumberReply<number>;
                "radix-tree-keys": import("../RESP/types").NumberReply<number>;
                "radix-tree-nodes": import("../RESP/types").NumberReply<number>;
                "last-generated-id": import("../RESP/types").BlobStringReply<string>;
                "max-deleted-entry-id": import("../RESP/types").BlobStringReply<string>;
                "entries-added": import("../RESP/types").NumberReply<number>;
                "recorded-first-entry-id": import("../RESP/types").BlobStringReply<string>;
                "idmp-duration": import("../RESP/types").NumberReply<number>;
                "idmp-maxsize": import("../RESP/types").NumberReply<number>;
                "pids-tracked": import("../RESP/types").NumberReply<number>;
                "iids-tracked": import("../RESP/types").NumberReply<number>;
                "iids-added": import("../RESP/types").NumberReply<number>;
                "iids-duplicates": import("../RESP/types").NumberReply<number>;
                groups: import("../RESP/types").NumberReply<number>;
                "first-entry": import("../RESP/types").NullReply | {
                    id: import("../RESP/types").BlobStringReply<string>;
                    message: import("../RESP/types").MapReply<import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>>;
                };
                "last-entry": import("../RESP/types").NullReply | {
                    id: import("../RESP/types").BlobStringReply<string>;
                    message: import("../RESP/types").MapReply<import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>>;
                };
            };
            readonly 3: (this: void, reply: any) => import("./XINFO_STREAM").XInfoStreamReply;
        };
    };
    readonly xInfoStream: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: {
            readonly 2: (this: void, reply: any) => {
                length: import("../RESP/types").NumberReply<number>;
                "radix-tree-keys": import("../RESP/types").NumberReply<number>;
                "radix-tree-nodes": import("../RESP/types").NumberReply<number>;
                "last-generated-id": import("../RESP/types").BlobStringReply<string>;
                "max-deleted-entry-id": import("../RESP/types").BlobStringReply<string>;
                "entries-added": import("../RESP/types").NumberReply<number>;
                "recorded-first-entry-id": import("../RESP/types").BlobStringReply<string>;
                "idmp-duration": import("../RESP/types").NumberReply<number>;
                "idmp-maxsize": import("../RESP/types").NumberReply<number>;
                "pids-tracked": import("../RESP/types").NumberReply<number>;
                "iids-tracked": import("../RESP/types").NumberReply<number>;
                "iids-added": import("../RESP/types").NumberReply<number>;
                "iids-duplicates": import("../RESP/types").NumberReply<number>;
                groups: import("../RESP/types").NumberReply<number>;
                "first-entry": import("../RESP/types").NullReply | {
                    id: import("../RESP/types").BlobStringReply<string>;
                    message: import("../RESP/types").MapReply<import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>>;
                };
                "last-entry": import("../RESP/types").NullReply | {
                    id: import("../RESP/types").BlobStringReply<string>;
                    message: import("../RESP/types").MapReply<import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>>;
                };
            };
            readonly 3: (this: void, reply: any) => import("./XINFO_STREAM").XInfoStreamReply;
        };
    };
    readonly XLEN: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly xLen: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly XPENDING_RANGE: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, group: import("../RESP/types").RedisArgument, start: import("../RESP/types").RedisArgument, end: import("../RESP/types").RedisArgument, count: number, options?: import("./XPENDING_RANGE").XPendingRangeOptions | undefined) => void;
        readonly transformReply: (this: void, reply: import("../RESP/types").TuplesReply<[id: import("../RESP/types").BlobStringReply<string>, consumer: import("../RESP/types").BlobStringReply<string>, millisecondsSinceLastDelivery: import("../RESP/types").NumberReply<number>, deliveriesCounter: import("../RESP/types").NumberReply<number>]>[]) => {
            id: import("../RESP/types").BlobStringReply<string>;
            consumer: import("../RESP/types").BlobStringReply<string>;
            millisecondsSinceLastDelivery: import("../RESP/types").NumberReply<number>;
            deliveriesCounter: import("../RESP/types").NumberReply<number>;
        }[];
    };
    readonly xPendingRange: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, group: import("../RESP/types").RedisArgument, start: import("../RESP/types").RedisArgument, end: import("../RESP/types").RedisArgument, count: number, options?: import("./XPENDING_RANGE").XPendingRangeOptions | undefined) => void;
        readonly transformReply: (this: void, reply: import("../RESP/types").TuplesReply<[id: import("../RESP/types").BlobStringReply<string>, consumer: import("../RESP/types").BlobStringReply<string>, millisecondsSinceLastDelivery: import("../RESP/types").NumberReply<number>, deliveriesCounter: import("../RESP/types").NumberReply<number>]>[]) => {
            id: import("../RESP/types").BlobStringReply<string>;
            consumer: import("../RESP/types").BlobStringReply<string>;
            millisecondsSinceLastDelivery: import("../RESP/types").NumberReply<number>;
            deliveriesCounter: import("../RESP/types").NumberReply<number>;
        }[];
    };
    readonly XPENDING: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, group: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: (this: void, reply: [pending: import("../RESP/types").NumberReply<number>, firstId: import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, lastId: import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, consumers: import("../RESP/types").NullReply | import("../RESP/types").ArrayReply<import("../RESP/types").TuplesReply<[name: import("../RESP/types").BlobStringReply<string>, deliveriesCounter: import("../RESP/types").BlobStringReply<string>]>>]) => {
            pending: import("../RESP/types").NumberReply<number>;
            firstId: import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
            lastId: import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
            consumers: {
                name: import("../RESP/types").BlobStringReply<string>;
                deliveriesCounter: number;
            }[] | null;
        };
    };
    readonly xPending: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, group: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: (this: void, reply: [pending: import("../RESP/types").NumberReply<number>, firstId: import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, lastId: import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, consumers: import("../RESP/types").NullReply | import("../RESP/types").ArrayReply<import("../RESP/types").TuplesReply<[name: import("../RESP/types").BlobStringReply<string>, deliveriesCounter: import("../RESP/types").BlobStringReply<string>]>>]) => {
            pending: import("../RESP/types").NumberReply<number>;
            firstId: import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
            lastId: import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
            consumers: {
                name: import("../RESP/types").BlobStringReply<string>;
                deliveriesCounter: number;
            }[] | null;
        };
    };
    readonly XRANGE: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, start: import("../RESP/types").RedisArgument, end: import("../RESP/types").RedisArgument, options?: import("./XRANGE").XRangeOptions | undefined) => void;
        readonly transformReply: (this: void, reply: import("./generic-transformers").StreamMessageRawReply[], preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => import("./generic-transformers").StreamMessageReply[];
    };
    readonly xRange: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, start: import("../RESP/types").RedisArgument, end: import("../RESP/types").RedisArgument, options?: import("./XRANGE").XRangeOptions | undefined) => void;
        readonly transformReply: (this: void, reply: import("./generic-transformers").StreamMessageRawReply[], preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => import("./generic-transformers").StreamMessageReply[];
    };
    readonly XREAD: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, streams: import("./XREAD").XReadStreams, options?: import("./XREAD").XReadOptions | undefined) => void;
        readonly transformReply: {
            readonly 2: typeof import("./generic-transformers").transformStreamsMessagesReplyResp2;
            readonly 3: () => import("../RESP/types").ReplyUnion;
        };
        readonly unstableResp3: true;
    };
    readonly xRead: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, streams: import("./XREAD").XReadStreams, options?: import("./XREAD").XReadOptions | undefined) => void;
        readonly transformReply: {
            readonly 2: typeof import("./generic-transformers").transformStreamsMessagesReplyResp2;
            readonly 3: () => import("../RESP/types").ReplyUnion;
        };
        readonly unstableResp3: true;
    };
    readonly XREADGROUP: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, group: import("../RESP/types").RedisArgument, consumer: import("../RESP/types").RedisArgument, streams: import("./XREAD").XReadStreams, options?: import("./XREADGROUP").XReadGroupOptions | undefined) => void;
        readonly transformReply: {
            readonly 2: typeof import("./generic-transformers").transformStreamsMessagesReplyResp2;
            readonly 3: () => import("../RESP/types").ReplyUnion;
        };
    };
    readonly xReadGroup: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, group: import("../RESP/types").RedisArgument, consumer: import("../RESP/types").RedisArgument, streams: import("./XREAD").XReadStreams, options?: import("./XREADGROUP").XReadGroupOptions | undefined) => void;
        readonly transformReply: {
            readonly 2: typeof import("./generic-transformers").transformStreamsMessagesReplyResp2;
            readonly 3: () => import("../RESP/types").ReplyUnion;
        };
    };
    readonly XREVRANGE: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, start: import("../RESP/types").RedisArgument, end: import("../RESP/types").RedisArgument, options?: import("./XRANGE").XRangeOptions | undefined) => void;
        readonly transformReply: (this: void, reply: import("./generic-transformers").StreamMessageRawReply[], preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => import("./generic-transformers").StreamMessageReply[];
    };
    readonly xRevRange: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, start: import("../RESP/types").RedisArgument, end: import("../RESP/types").RedisArgument, options?: import("./XRANGE").XRangeOptions | undefined) => void;
        readonly transformReply: (this: void, reply: import("./generic-transformers").StreamMessageRawReply[], preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => import("./generic-transformers").StreamMessageReply[];
    };
    readonly XSETID: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, lastId: import("../RESP/types").RedisArgument, options?: import("./XSETID").XSetIdOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly xSetId: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, lastId: import("../RESP/types").RedisArgument, options?: import("./XSETID").XSetIdOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    readonly XTRIM: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, strategy: "MAXLEN" | "MINID", threshold: string | number, options?: import("./XTRIM").XTrimOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly xTrim: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, strategy: "MAXLEN" | "MINID", threshold: string | number, options?: import("./XTRIM").XTrimOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly ZADD_INCR: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, members: import("./generic-transformers").SortedSetMember | import("./generic-transformers").SortedSetMember[], options?: import("./ZADD_INCR").ZAddOptions | undefined) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => import("../RESP/types").DoubleReply<number> | null;
            3: () => import("../RESP/types").NullReply | import("../RESP/types").DoubleReply<number>;
        };
    };
    readonly zAddIncr: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, members: import("./generic-transformers").SortedSetMember | import("./generic-transformers").SortedSetMember[], options?: import("./ZADD_INCR").ZAddOptions | undefined) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => import("../RESP/types").DoubleReply<number> | null;
            3: () => import("../RESP/types").NullReply | import("../RESP/types").DoubleReply<number>;
        };
    };
    readonly ZADD: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, members: import("./generic-transformers").SortedSetMember | import("./generic-transformers").SortedSetMember[], options?: import("./ZADD").ZAddOptions | undefined) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").BlobStringReply<string>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => import("../RESP/types").DoubleReply<number>;
            3: () => import("../RESP/types").DoubleReply<number>;
        };
    };
    readonly zAdd: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, members: import("./generic-transformers").SortedSetMember | import("./generic-transformers").SortedSetMember[], options?: import("./ZADD").ZAddOptions | undefined) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").BlobStringReply<string>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => import("../RESP/types").DoubleReply<number>;
            3: () => import("../RESP/types").DoubleReply<number>;
        };
    };
    readonly ZCARD: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly zCard: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly ZCOUNT: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, min: number | import("../RESP/types").RedisArgument, max: number | import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly zCount: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, min: number | import("../RESP/types").RedisArgument, max: number | import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly ZDIFF_WITHSCORES: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
            3: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").DoubleReply<number>]>>) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
        };
    };
    readonly zDiffWithScores: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
            3: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").DoubleReply<number>]>>) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
        };
    };
    readonly ZDIFF: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly zDiff: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly ZDIFFSTORE: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, destination: import("../RESP/types").RedisArgument, inputKeys: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly zDiffStore: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, destination: import("../RESP/types").RedisArgument, inputKeys: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly ZINCRBY: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, increment: number, member: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").BlobStringReply<string>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => import("../RESP/types").DoubleReply<number>;
            3: () => import("../RESP/types").DoubleReply<number>;
        };
    };
    readonly zIncrBy: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, increment: number, member: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").BlobStringReply<string>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => import("../RESP/types").DoubleReply<number>;
            3: () => import("../RESP/types").DoubleReply<number>;
        };
    };
    readonly ZINTER_WITHSCORES: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./ZINTER").ZInterKeysType, options?: import("./ZINTER").ZInterOptions | undefined) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
            3: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").DoubleReply<number>]>>) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
        };
    };
    readonly zInterWithScores: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./ZINTER").ZInterKeysType, options?: import("./ZINTER").ZInterOptions | undefined) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
            3: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").DoubleReply<number>]>>) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
        };
    };
    readonly ZINTER: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./ZINTER").ZInterKeysType, options?: import("./ZINTER").ZInterOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly zInter: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./ZINTER").ZInterKeysType, options?: import("./ZINTER").ZInterOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly ZINTERCARD: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").RedisVariadicArgument, options?: number | import("./ZINTERCARD").ZInterCardOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly zInterCard: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").RedisVariadicArgument, options?: number | import("./ZINTERCARD").ZInterCardOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly ZINTERSTORE: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, destination: import("../RESP/types").RedisArgument, keys: import("./generic-transformers").ZKeys, options?: import("./ZINTER").ZInterOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly zInterStore: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, destination: import("../RESP/types").RedisArgument, keys: import("./generic-transformers").ZKeys, options?: import("./ZINTER").ZInterOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly ZLEXCOUNT: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, min: import("../RESP/types").RedisArgument, max: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly zLexCount: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, min: import("../RESP/types").RedisArgument, max: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly ZMPOP: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").RedisVariadicArgument, side: import("./generic-transformers").SortedSetSide, options?: import("./ZMPOP").ZMPopOptions | undefined) => void;
        readonly transformReply: {
            readonly 2: (this: void, reply: import("../RESP/types").UnwrapReply<import("../RESP/types").Resp2Reply<import("./ZMPOP").ZMPopRawReply>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
                key: import("../RESP/types").BlobStringReply<string>;
                members: {
                    value: import("../RESP/types").BlobStringReply<string>;
                    score: import("../RESP/types").DoubleReply<number>;
                }[];
            } | null;
            readonly 3: (this: void, reply: import("../RESP/types").UnwrapReply<import("./ZMPOP").ZMPopRawReply>) => {
                key: import("../RESP/types").BlobStringReply<string>;
                members: {
                    value: import("../RESP/types").BlobStringReply<string>;
                    score: import("../RESP/types").DoubleReply<number>;
                }[];
            } | null;
        };
    };
    readonly zmPop: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").RedisVariadicArgument, side: import("./generic-transformers").SortedSetSide, options?: import("./ZMPOP").ZMPopOptions | undefined) => void;
        readonly transformReply: {
            readonly 2: (this: void, reply: import("../RESP/types").UnwrapReply<import("../RESP/types").Resp2Reply<import("./ZMPOP").ZMPopRawReply>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
                key: import("../RESP/types").BlobStringReply<string>;
                members: {
                    value: import("../RESP/types").BlobStringReply<string>;
                    score: import("../RESP/types").DoubleReply<number>;
                }[];
            } | null;
            readonly 3: (this: void, reply: import("../RESP/types").UnwrapReply<import("./ZMPOP").ZMPopRawReply>) => {
                key: import("../RESP/types").BlobStringReply<string>;
                members: {
                    value: import("../RESP/types").BlobStringReply<string>;
                    score: import("../RESP/types").DoubleReply<number>;
                }[];
            } | null;
        };
    };
    readonly ZMSCORE: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, member: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: {
            readonly 2: (reply: (import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>)[], preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => (import("../RESP/types").DoubleReply<number> | null)[];
            readonly 3: () => import("../RESP/types").ArrayReply<import("../RESP/types").NullReply | import("../RESP/types").DoubleReply<number>>;
        };
    };
    readonly zmScore: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, member: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: {
            readonly 2: (reply: (import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>)[], preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => (import("../RESP/types").DoubleReply<number> | null)[];
            readonly 3: () => import("../RESP/types").ArrayReply<import("../RESP/types").NullReply | import("../RESP/types").DoubleReply<number>>;
        };
    };
    readonly ZPOPMAX_COUNT: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, count: number) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
            3: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").DoubleReply<number>]>>) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
        };
    };
    readonly zPopMaxCount: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, count: number) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
            3: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").DoubleReply<number>]>>) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
        };
    };
    readonly ZPOPMAX: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: {
            readonly 2: (reply: import("../RESP/types").UnwrapReply<import("../RESP/types").TuplesReply<[] | [import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>]>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            } | null;
            readonly 3: (reply: import("../RESP/types").UnwrapReply<import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").DoubleReply<number>] | []>>) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            } | null;
        };
    };
    readonly zPopMax: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: {
            readonly 2: (reply: import("../RESP/types").UnwrapReply<import("../RESP/types").TuplesReply<[] | [import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>]>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            } | null;
            readonly 3: (reply: import("../RESP/types").UnwrapReply<import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").DoubleReply<number>] | []>>) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            } | null;
        };
    };
    readonly ZPOPMIN_COUNT: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, count: number) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
            3: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").DoubleReply<number>]>>) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
        };
    };
    readonly zPopMinCount: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, count: number) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
            3: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").DoubleReply<number>]>>) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
        };
    };
    readonly ZPOPMIN: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: {
            readonly 2: (reply: import("../RESP/types").UnwrapReply<import("../RESP/types").TuplesReply<[] | [import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>]>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            } | null;
            readonly 3: (reply: import("../RESP/types").UnwrapReply<import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").DoubleReply<number>] | []>>) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            } | null;
        };
    };
    readonly zPopMin: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: {
            readonly 2: (reply: import("../RESP/types").UnwrapReply<import("../RESP/types").TuplesReply<[] | [import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>]>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            } | null;
            readonly 3: (reply: import("../RESP/types").UnwrapReply<import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").DoubleReply<number>] | []>>) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            } | null;
        };
    };
    readonly ZRANDMEMBER_COUNT_WITHSCORES: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, count: number) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
            3: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").DoubleReply<number>]>>) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
        };
    };
    readonly zRandMemberCountWithScores: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, count: number) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
            3: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").DoubleReply<number>]>>) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
        };
    };
    readonly ZRANDMEMBER_COUNT: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, count: number) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly zRandMemberCount: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, count: number) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly ZRANDMEMBER: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    readonly zRandMember: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    readonly ZRANGE_WITHSCORES: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, min: number | import("../RESP/types").RedisArgument, max: number | import("../RESP/types").RedisArgument, options?: import("./ZRANGE").ZRangeOptions | undefined) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
            3: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").DoubleReply<number>]>>) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
        };
    };
    readonly zRangeWithScores: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, min: number | import("../RESP/types").RedisArgument, max: number | import("../RESP/types").RedisArgument, options?: import("./ZRANGE").ZRangeOptions | undefined) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
            3: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").DoubleReply<number>]>>) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
        };
    };
    readonly ZRANGE: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, min: number | import("../RESP/types").RedisArgument, max: number | import("../RESP/types").RedisArgument, options?: import("./ZRANGE").ZRangeOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly zRange: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, min: number | import("../RESP/types").RedisArgument, max: number | import("../RESP/types").RedisArgument, options?: import("./ZRANGE").ZRangeOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly ZRANGEBYLEX: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, min: import("../RESP/types").RedisArgument, max: import("../RESP/types").RedisArgument, options?: import("./ZRANGEBYLEX").ZRangeByLexOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly zRangeByLex: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, min: import("../RESP/types").RedisArgument, max: import("../RESP/types").RedisArgument, options?: import("./ZRANGEBYLEX").ZRangeByLexOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly ZRANGEBYSCORE_WITHSCORES: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, min: string | number, max: string | number, options?: import("./ZRANGEBYSCORE").ZRangeByScoreOptions | undefined) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
            3: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").DoubleReply<number>]>>) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
        };
    };
    readonly zRangeByScoreWithScores: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, min: string | number, max: string | number, options?: import("./ZRANGEBYSCORE").ZRangeByScoreOptions | undefined) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
            3: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").DoubleReply<number>]>>) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
        };
    };
    readonly ZRANGEBYSCORE: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, min: string | number, max: string | number, options?: import("./ZRANGEBYSCORE").ZRangeByScoreOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly zRangeByScore: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, min: string | number, max: string | number, options?: import("./ZRANGEBYSCORE").ZRangeByScoreOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly ZRANGESTORE: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, destination: import("../RESP/types").RedisArgument, source: import("../RESP/types").RedisArgument, min: number | import("../RESP/types").RedisArgument, max: number | import("../RESP/types").RedisArgument, options?: import("./ZRANGESTORE").ZRangeStoreOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly zRangeStore: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, destination: import("../RESP/types").RedisArgument, source: import("../RESP/types").RedisArgument, min: number | import("../RESP/types").RedisArgument, max: number | import("../RESP/types").RedisArgument, options?: import("./ZRANGESTORE").ZRangeStoreOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly ZRANK_WITHSCORE: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, member: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: {
            readonly 2: (reply: import("../RESP/types").UnwrapReply<import("../RESP/types").NullReply | import("../RESP/types").TuplesReply<[import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<string>]>>) => {
                rank: import("../RESP/types").NumberReply<number>;
                score: number;
            } | null;
            readonly 3: (reply: import("../RESP/types").UnwrapReply<import("../RESP/types").NullReply | import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").DoubleReply<number>]>>) => {
                rank: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            } | null;
        };
    };
    readonly zRankWithScore: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, member: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: {
            readonly 2: (reply: import("../RESP/types").UnwrapReply<import("../RESP/types").NullReply | import("../RESP/types").TuplesReply<[import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<string>]>>) => {
                rank: import("../RESP/types").NumberReply<number>;
                score: number;
            } | null;
            readonly 3: (reply: import("../RESP/types").UnwrapReply<import("../RESP/types").NullReply | import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").DoubleReply<number>]>>) => {
                rank: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            } | null;
        };
    };
    readonly ZRANK: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, member: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").NumberReply<number>;
    };
    readonly zRank: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, member: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").NumberReply<number>;
    };
    readonly ZREM: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, member: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly zRem: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, member: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly ZREMRANGEBYLEX: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, min: number | import("../RESP/types").RedisArgument, max: number | import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly zRemRangeByLex: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, min: number | import("../RESP/types").RedisArgument, max: number | import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly ZREMRANGEBYRANK: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, start: number, stop: number) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly zRemRangeByRank: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, start: number, stop: number) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly ZREMRANGEBYSCORE: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, min: number | import("../RESP/types").RedisArgument, max: number | import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly zRemRangeByScore: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, min: number | import("../RESP/types").RedisArgument, max: number | import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly ZREVRANK: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, member: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").NumberReply<number>;
    };
    readonly zRevRank: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, member: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").NumberReply<number>;
    };
    readonly ZSCAN: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, cursor: import("../RESP/types").RedisArgument, options?: import("./SCAN").ScanCommonOptions | undefined) => void;
        readonly transformReply: (this: void, [cursor, rawMembers]: [import("../RESP/types").BlobStringReply<string>, import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>]) => {
            cursor: import("../RESP/types").BlobStringReply<string>;
            members: {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
        };
    };
    readonly zScan: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, cursor: import("../RESP/types").RedisArgument, options?: import("./SCAN").ScanCommonOptions | undefined) => void;
        readonly transformReply: (this: void, [cursor, rawMembers]: [import("../RESP/types").BlobStringReply<string>, import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>]) => {
            cursor: import("../RESP/types").BlobStringReply<string>;
            members: {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
        };
    };
    readonly ZSCORE: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, member: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => import("../RESP/types").DoubleReply<number> | null;
            3: () => import("../RESP/types").NullReply | import("../RESP/types").DoubleReply<number>;
        };
    };
    readonly zScore: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, member: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => import("../RESP/types").DoubleReply<number> | null;
            3: () => import("../RESP/types").NullReply | import("../RESP/types").DoubleReply<number>;
        };
    };
    readonly ZUNION_WITHSCORES: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").ZKeys, options?: import("./ZUNION").ZUnionOptions | undefined) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
            3: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").DoubleReply<number>]>>) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
        };
    };
    readonly zUnionWithScores: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").ZKeys, options?: import("./ZUNION").ZUnionOptions | undefined) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
            3: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").DoubleReply<number>]>>) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
        };
    };
    readonly ZUNION: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").ZKeys, options?: import("./ZUNION").ZUnionOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly zUnion: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").ZKeys, options?: import("./ZUNION").ZUnionOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly ZUNIONSTORE: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, destination: import("../RESP/types").RedisArgument, keys: import("./generic-transformers").ZKeys, options?: import("./ZUNIONSTORE").ZUnionOptions | undefined) => any;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly zUnionStore: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, destination: import("../RESP/types").RedisArgument, keys: import("./generic-transformers").ZKeys, options?: import("./ZUNIONSTORE").ZUnionOptions | undefined) => any;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly VADD: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, vector: number[], element: import("../RESP/types").RedisArgument, options?: import("./VADD").VAddOptions | undefined) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").NumberReply<0 | 1>) => boolean;
            3: () => import("../RESP/types").BooleanReply<boolean>;
        };
    };
    readonly vAdd: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, vector: number[], element: import("../RESP/types").RedisArgument, options?: import("./VADD").VAddOptions | undefined) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").NumberReply<0 | 1>) => boolean;
            3: () => import("../RESP/types").BooleanReply<boolean>;
        };
    };
    readonly VCARD: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly vCard: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly VDIM: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly vDim: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    readonly VEMB: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, element: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").BlobStringReply<string>[], preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => import("../RESP/types").DoubleReply<number>[];
            3: () => import("../RESP/types").ArrayReply<import("../RESP/types").DoubleReply<number>>;
        };
    };
    readonly vEmb: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, element: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").BlobStringReply<string>[], preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => import("../RESP/types").DoubleReply<number>[];
            3: () => import("../RESP/types").ArrayReply<import("../RESP/types").DoubleReply<number>>;
        };
    };
    readonly VEMB_RAW: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, element: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: {
            2: (reply: any[]) => {
                quantization: import("../RESP/types").SimpleStringReply<string>;
                raw: import("../RESP/types").BlobStringReply<string>;
                l2Norm: import("../RESP/types").DoubleReply<number>;
                quantizationRange?: import("../RESP/types").DoubleReply<number> | undefined;
            };
            3: (reply: any[]) => {
                quantization: import("../RESP/types").SimpleStringReply<string>;
                raw: import("../RESP/types").BlobStringReply<string>;
                l2Norm: import("../RESP/types").DoubleReply<number>;
                quantizationRange?: import("../RESP/types").DoubleReply<number> | undefined;
            };
        };
    };
    readonly vEmbRaw: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, element: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: {
            2: (reply: any[]) => {
                quantization: import("../RESP/types").SimpleStringReply<string>;
                raw: import("../RESP/types").BlobStringReply<string>;
                l2Norm: import("../RESP/types").DoubleReply<number>;
                quantizationRange?: import("../RESP/types").DoubleReply<number> | undefined;
            };
            3: (reply: any[]) => {
                quantization: import("../RESP/types").SimpleStringReply<string>;
                raw: import("../RESP/types").BlobStringReply<string>;
                l2Norm: import("../RESP/types").DoubleReply<number>;
                quantizationRange?: import("../RESP/types").DoubleReply<number> | undefined;
            };
        };
    };
    readonly VGETATTR: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, element: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: typeof import("./generic-transformers").transformRedisJsonNullReply;
    };
    readonly vGetAttr: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, element: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: typeof import("./generic-transformers").transformRedisJsonNullReply;
    };
    readonly VINFO: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: {
            readonly 2: (reply: [import("../RESP/types").SimpleStringReply<"quant-type">, import("../RESP/types").SimpleStringReply<string>, import("../RESP/types").SimpleStringReply<"vector-dim">, import("../RESP/types").NumberReply<number>, import("../RESP/types").SimpleStringReply<"size">, import("../RESP/types").NumberReply<number>, import("../RESP/types").SimpleStringReply<"max-level">, import("../RESP/types").NumberReply<number>, import("../RESP/types").SimpleStringReply<"vset-uid">, import("../RESP/types").NumberReply<number>, import("../RESP/types").SimpleStringReply<"hnsw-max-node-uid">, import("../RESP/types").NumberReply<number>]) => import("./VINFO").VInfoReplyMap;
            readonly 3: () => import("./VINFO").VInfoReplyMap;
        };
    };
    readonly vInfo: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: {
            readonly 2: (reply: [import("../RESP/types").SimpleStringReply<"quant-type">, import("../RESP/types").SimpleStringReply<string>, import("../RESP/types").SimpleStringReply<"vector-dim">, import("../RESP/types").NumberReply<number>, import("../RESP/types").SimpleStringReply<"size">, import("../RESP/types").NumberReply<number>, import("../RESP/types").SimpleStringReply<"max-level">, import("../RESP/types").NumberReply<number>, import("../RESP/types").SimpleStringReply<"vset-uid">, import("../RESP/types").NumberReply<number>, import("../RESP/types").SimpleStringReply<"hnsw-max-node-uid">, import("../RESP/types").NumberReply<number>]) => import("./VINFO").VInfoReplyMap;
            readonly 3: () => import("./VINFO").VInfoReplyMap;
        };
    };
    readonly VLINKS: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, element: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>>;
    };
    readonly vLinks: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, element: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>>;
    };
    readonly VLINKS_WITHSCORES: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, element: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: {
            readonly 2: (reply: any) => Record<string, import("../RESP/types").DoubleReply<number>>[];
            readonly 3: () => import("../RESP/types").MapReply<import("../RESP/types").BlobStringReply<string>, import("../RESP/types").DoubleReply<number>>[];
        };
    };
    readonly vLinksWithScores: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, element: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: {
            readonly 2: (reply: any) => Record<string, import("../RESP/types").DoubleReply<number>>[];
            readonly 3: () => import("../RESP/types").MapReply<import("../RESP/types").BlobStringReply<string>, import("../RESP/types").DoubleReply<number>>[];
        };
    };
    readonly VRANDMEMBER: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, count?: number | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string> | import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly vRandMember: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, count?: number | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string> | import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly VRANGE: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, start: import("../RESP/types").RedisArgument, end: import("../RESP/types").RedisArgument, count?: number | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly vRange: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, start: import("../RESP/types").RedisArgument, end: import("../RESP/types").RedisArgument, count?: number | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly VREM: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, element: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").NumberReply<0 | 1>) => boolean;
            3: () => import("../RESP/types").BooleanReply<boolean>;
        };
    };
    readonly vRem: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, element: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").NumberReply<0 | 1>) => boolean;
            3: () => import("../RESP/types").BooleanReply<boolean>;
        };
    };
    readonly VSETATTR: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, element: import("../RESP/types").RedisArgument, attributes: import("../RESP/types").RedisArgument | Record<string, any>) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").NumberReply<0 | 1>) => boolean;
            3: () => import("../RESP/types").BooleanReply<boolean>;
        };
    };
    readonly vSetAttr: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, element: import("../RESP/types").RedisArgument, attributes: import("../RESP/types").RedisArgument | Record<string, any>) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").NumberReply<0 | 1>) => boolean;
            3: () => import("../RESP/types").BooleanReply<boolean>;
        };
    };
    readonly VSIM: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, query: number[] | import("../RESP/types").RedisArgument, options?: import("./VSIM").VSimOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly vSim: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, query: number[] | import("../RESP/types").RedisArgument, options?: import("./VSIM").VSimOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    readonly VSIM_WITHSCORES: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, query: number[] | import("../RESP/types").RedisArgument, options?: import("./VSIM").VSimOptions | undefined) => void;
        readonly transformReply: {
            readonly 2: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>) => Record<string, import("../RESP/types").DoubleReply<number>>;
            readonly 3: () => import("../RESP/types").MapReply<import("../RESP/types").BlobStringReply<string>, import("../RESP/types").DoubleReply<number>>;
        };
    };
    readonly vSimWithScores: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, query: number[] | import("../RESP/types").RedisArgument, options?: import("./VSIM").VSimOptions | undefined) => void;
        readonly transformReply: {
            readonly 2: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>) => Record<string, import("../RESP/types").DoubleReply<number>>;
            readonly 3: () => import("../RESP/types").MapReply<import("../RESP/types").BlobStringReply<string>, import("../RESP/types").DoubleReply<number>>;
        };
    };
};
export default _default;
declare const NON_STICKY_COMMANDS: {
    ACL_CAT: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, categoryName?: import("../RESP/types").RedisArgument | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    aclCat: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, categoryName?: import("../RESP/types").RedisArgument | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    ACL_DELUSER: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, username: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    aclDelUser: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, username: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    ACL_DRYRUN: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, username: import("../RESP/types").RedisArgument, command: import("../RESP/types").RedisArgument[]) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string> | import("../RESP/types").SimpleStringReply<"OK">;
    };
    aclDryRun: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, username: import("../RESP/types").RedisArgument, command: import("../RESP/types").RedisArgument[]) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string> | import("../RESP/types").SimpleStringReply<"OK">;
    };
    ACL_GENPASS: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, bits?: number | undefined) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    aclGenPass: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, bits?: number | undefined) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    ACL_GETUSER: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, username: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: {
            readonly 2: (reply: [import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<42, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>, import("../RESP/types").BlobStringReply<"passwords">, import("../RESP/types").RespType<42, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>, import("../RESP/types").BlobStringReply<"commands">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"keys">, import("../RESP/types").BlobStringReply<string> | import("../RESP/types").RespType<42, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>, import("../RESP/types").BlobStringReply<"channels">, import("../RESP/types").BlobStringReply<string> | import("../RESP/types").RespType<42, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>, import("../RESP/types").BlobStringReply<"selectors">, import("../RESP/types").RespType<42, import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"commands">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"keys">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"channels">, import("../RESP/types").BlobStringReply<string>], never, [import("../RESP/types").BlobStringReply<"commands">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"keys">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"channels">, import("../RESP/types").BlobStringReply<string>]>[], never, import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"commands">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"keys">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"channels">, import("../RESP/types").BlobStringReply<string>], never, [import("../RESP/types").BlobStringReply<"commands">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"keys">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"channels">, import("../RESP/types").BlobStringReply<string>]>[]>]) => {
                flags: import("../RESP/types").RespType<42, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>;
                passwords: import("../RESP/types").RespType<42, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>;
                commands: import("../RESP/types").BlobStringReply<string>;
                keys: import("../RESP/types").BlobStringReply<string> | import("../RESP/types").RespType<42, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>;
                channels: import("../RESP/types").BlobStringReply<string> | import("../RESP/types").RespType<42, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>;
                selectors: {
                    commands: import("../RESP/types").BlobStringReply<string>;
                    keys: import("../RESP/types").BlobStringReply<string>;
                    channels: import("../RESP/types").BlobStringReply<string>;
                }[];
            };
            readonly 3: () => import("../RESP/types").TuplesToMapReply<[[import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>], [import("../RESP/types").BlobStringReply<"passwords">, import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>], [import("../RESP/types").BlobStringReply<"commands">, import("../RESP/types").BlobStringReply<string>], [import("../RESP/types").BlobStringReply<"keys">, import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>> | import("../RESP/types").BlobStringReply<string>], [import("../RESP/types").BlobStringReply<"channels">, import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>> | import("../RESP/types").BlobStringReply<string>], [import("../RESP/types").BlobStringReply<"selectors">, import("../RESP/types").ArrayReply<import("../RESP/types").TuplesToMapReply<[[import("../RESP/types").BlobStringReply<"commands">, import("../RESP/types").BlobStringReply<string>], [import("../RESP/types").BlobStringReply<"keys">, import("../RESP/types").BlobStringReply<string>], [import("../RESP/types").BlobStringReply<"channels">, import("../RESP/types").BlobStringReply<string>]]>>]]>;
        };
    };
    aclGetUser: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, username: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: {
            readonly 2: (reply: [import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<42, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>, import("../RESP/types").BlobStringReply<"passwords">, import("../RESP/types").RespType<42, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>, import("../RESP/types").BlobStringReply<"commands">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"keys">, import("../RESP/types").BlobStringReply<string> | import("../RESP/types").RespType<42, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>, import("../RESP/types").BlobStringReply<"channels">, import("../RESP/types").BlobStringReply<string> | import("../RESP/types").RespType<42, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>, import("../RESP/types").BlobStringReply<"selectors">, import("../RESP/types").RespType<42, import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"commands">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"keys">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"channels">, import("../RESP/types").BlobStringReply<string>], never, [import("../RESP/types").BlobStringReply<"commands">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"keys">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"channels">, import("../RESP/types").BlobStringReply<string>]>[], never, import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"commands">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"keys">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"channels">, import("../RESP/types").BlobStringReply<string>], never, [import("../RESP/types").BlobStringReply<"commands">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"keys">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"channels">, import("../RESP/types").BlobStringReply<string>]>[]>]) => {
                flags: import("../RESP/types").RespType<42, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>;
                passwords: import("../RESP/types").RespType<42, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>;
                commands: import("../RESP/types").BlobStringReply<string>;
                keys: import("../RESP/types").BlobStringReply<string> | import("../RESP/types").RespType<42, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>;
                channels: import("../RESP/types").BlobStringReply<string> | import("../RESP/types").RespType<42, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>;
                selectors: {
                    commands: import("../RESP/types").BlobStringReply<string>;
                    keys: import("../RESP/types").BlobStringReply<string>;
                    channels: import("../RESP/types").BlobStringReply<string>;
                }[];
            };
            readonly 3: () => import("../RESP/types").TuplesToMapReply<[[import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>], [import("../RESP/types").BlobStringReply<"passwords">, import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>], [import("../RESP/types").BlobStringReply<"commands">, import("../RESP/types").BlobStringReply<string>], [import("../RESP/types").BlobStringReply<"keys">, import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>> | import("../RESP/types").BlobStringReply<string>], [import("../RESP/types").BlobStringReply<"channels">, import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>> | import("../RESP/types").BlobStringReply<string>], [import("../RESP/types").BlobStringReply<"selectors">, import("../RESP/types").ArrayReply<import("../RESP/types").TuplesToMapReply<[[import("../RESP/types").BlobStringReply<"commands">, import("../RESP/types").BlobStringReply<string>], [import("../RESP/types").BlobStringReply<"keys">, import("../RESP/types").BlobStringReply<string>], [import("../RESP/types").BlobStringReply<"channels">, import("../RESP/types").BlobStringReply<string>]]>>]]>;
        };
    };
    ACL_LIST: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    aclList: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    ACL_LOAD: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    aclLoad: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    ACL_LOG_RESET: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    aclLogReset: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    ACL_LOG: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, count?: number | undefined) => void;
        readonly transformReply: {
            readonly 2: (reply: import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"count">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"reason">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"context">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"object">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"username">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"age-seconds">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"client-info">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"entry-id">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"timestamp-created">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"timestamp-last-updated">, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").BlobStringReply<"count">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"reason">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"context">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"object">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"username">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"age-seconds">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"client-info">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"entry-id">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"timestamp-created">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"timestamp-last-updated">, import("../RESP/types").NumberReply<number>]>[], preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
                count: import("../RESP/types").NumberReply<number>;
                reason: import("../RESP/types").BlobStringReply<string>;
                context: import("../RESP/types").BlobStringReply<string>;
                object: import("../RESP/types").BlobStringReply<string>;
                username: import("../RESP/types").BlobStringReply<string>;
                'age-seconds': import("../RESP/types").DoubleReply<number>;
                'client-info': import("../RESP/types").BlobStringReply<string>;
                'entry-id': import("../RESP/types").NumberReply<number>;
                'timestamp-created': import("../RESP/types").NumberReply<number>;
                'timestamp-last-updated': import("../RESP/types").NumberReply<number>;
            }[];
            readonly 3: () => import("./ACL_LOG").AclLogReply;
        };
    };
    aclLog: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, count?: number | undefined) => void;
        readonly transformReply: {
            readonly 2: (reply: import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"count">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"reason">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"context">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"object">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"username">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"age-seconds">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"client-info">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"entry-id">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"timestamp-created">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"timestamp-last-updated">, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").BlobStringReply<"count">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"reason">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"context">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"object">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"username">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"age-seconds">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"client-info">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"entry-id">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"timestamp-created">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"timestamp-last-updated">, import("../RESP/types").NumberReply<number>]>[], preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
                count: import("../RESP/types").NumberReply<number>;
                reason: import("../RESP/types").BlobStringReply<string>;
                context: import("../RESP/types").BlobStringReply<string>;
                object: import("../RESP/types").BlobStringReply<string>;
                username: import("../RESP/types").BlobStringReply<string>;
                'age-seconds': import("../RESP/types").DoubleReply<number>;
                'client-info': import("../RESP/types").BlobStringReply<string>;
                'entry-id': import("../RESP/types").NumberReply<number>;
                'timestamp-created': import("../RESP/types").NumberReply<number>;
                'timestamp-last-updated': import("../RESP/types").NumberReply<number>;
            }[];
            readonly 3: () => import("./ACL_LOG").AclLogReply;
        };
    };
    ACL_SAVE: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    aclSave: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    ACL_SETUSER: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, username: import("../RESP/types").RedisArgument, rule: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    aclSetUser: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, username: import("../RESP/types").RedisArgument, rule: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    ACL_USERS: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    aclUsers: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    ACL_WHOAMI: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    aclWhoAmI: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    APPEND: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, value: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    append: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, value: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    ASKING: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    asking: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    AUTH: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, { username, password }: import("./AUTH").AuthOptions) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    auth: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, { username, password }: import("./AUTH").AuthOptions) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    BGREWRITEAOF: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    bgRewriteAof: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    BGSAVE: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, options?: import("./BGSAVE").BgSaveOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    bgSave: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, options?: import("./BGSAVE").BgSaveOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    BITCOUNT: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, range?: import("./BITCOUNT").BitCountRange | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    bitCount: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, range?: import("./BITCOUNT").BitCountRange | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    BITFIELD_RO: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, operations: import("./BITFIELD_RO").BitFieldRoOperations) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").NumberReply<number>>;
    };
    bitFieldRo: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, operations: import("./BITFIELD_RO").BitFieldRoOperations) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").NumberReply<number>>;
    };
    BITFIELD: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, operations: import("./BITFIELD").BitFieldOperations) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").NullReply | import("../RESP/types").NumberReply<number>>;
    };
    bitField: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, operations: import("./BITFIELD").BitFieldOperations) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").NullReply | import("../RESP/types").NumberReply<number>>;
    };
    BITOP: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, operation: import("./BITOP").BitOperations, destKey: import("../RESP/types").RedisArgument, key: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    bitOp: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, operation: import("./BITOP").BitOperations, destKey: import("../RESP/types").RedisArgument, key: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    BITPOS: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, bit: import("./generic-transformers").BitValue, start?: number | undefined, end?: number | undefined, mode?: "BYTE" | "BIT" | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    bitPos: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, bit: import("./generic-transformers").BitValue, start?: number | undefined, end?: number | undefined, mode?: "BYTE" | "BIT" | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    BLMOVE: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, source: import("../RESP/types").RedisArgument, destination: import("../RESP/types").RedisArgument, sourceSide: import("./generic-transformers").ListSide, destinationSide: import("./generic-transformers").ListSide, timeout: number) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    blMove: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, source: import("../RESP/types").RedisArgument, destination: import("../RESP/types").RedisArgument, sourceSide: import("./generic-transformers").ListSide, destinationSide: import("./generic-transformers").ListSide, timeout: number) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    BLMPOP: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, timeout: number, keys: import("./generic-transformers").RedisVariadicArgument, side: import("./generic-transformers").ListSide, options?: import("./LMPOP").LMPopOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").TuplesReply<[key: import("../RESP/types").BlobStringReply<string>, elements: import("../RESP/types").BlobStringReply<string>[]]>;
    };
    blmPop: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, timeout: number, keys: import("./generic-transformers").RedisVariadicArgument, side: import("./generic-transformers").ListSide, options?: import("./LMPOP").LMPopOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").TuplesReply<[key: import("../RESP/types").BlobStringReply<string>, elements: import("../RESP/types").BlobStringReply<string>[]]>;
    };
    BLPOP: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("./generic-transformers").RedisVariadicArgument, timeout: number) => void;
        readonly transformReply: (this: void, reply: import("../RESP/types").UnwrapReply<import("../RESP/types").NullReply | import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>]>>) => {
            key: import("../RESP/types").BlobStringReply<string>;
            element: import("../RESP/types").BlobStringReply<string>;
        } | null;
    };
    blPop: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("./generic-transformers").RedisVariadicArgument, timeout: number) => void;
        readonly transformReply: (this: void, reply: import("../RESP/types").UnwrapReply<import("../RESP/types").NullReply | import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>]>>) => {
            key: import("../RESP/types").BlobStringReply<string>;
            element: import("../RESP/types").BlobStringReply<string>;
        } | null;
    };
    BRPOP: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("./generic-transformers").RedisVariadicArgument, timeout: number) => void;
        readonly transformReply: (this: void, reply: import("../RESP/types").UnwrapReply<import("../RESP/types").NullReply | import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>]>>) => {
            key: import("../RESP/types").BlobStringReply<string>;
            element: import("../RESP/types").BlobStringReply<string>;
        } | null;
    };
    brPop: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("./generic-transformers").RedisVariadicArgument, timeout: number) => void;
        readonly transformReply: (this: void, reply: import("../RESP/types").UnwrapReply<import("../RESP/types").NullReply | import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>]>>) => {
            key: import("../RESP/types").BlobStringReply<string>;
            element: import("../RESP/types").BlobStringReply<string>;
        } | null;
    };
    BRPOPLPUSH: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, source: import("../RESP/types").RedisArgument, destination: import("../RESP/types").RedisArgument, timeout: number) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    brPopLPush: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, source: import("../RESP/types").RedisArgument, destination: import("../RESP/types").RedisArgument, timeout: number) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    BZMPOP: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, timeout: number, keys: import("./generic-transformers").RedisVariadicArgument, side: import("./generic-transformers").SortedSetSide, options?: import("./ZMPOP").ZMPopOptions | undefined) => void;
        readonly transformReply: {
            readonly 2: (this: void, reply: import("../RESP/types").UnwrapReply<import("../RESP/types").Resp2Reply<import("./ZMPOP").ZMPopRawReply>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
                key: import("../RESP/types").BlobStringReply<string>;
                members: {
                    value: import("../RESP/types").BlobStringReply<string>;
                    score: import("../RESP/types").DoubleReply<number>;
                }[];
            } | null;
            readonly 3: (this: void, reply: import("../RESP/types").UnwrapReply<import("./ZMPOP").ZMPopRawReply>) => {
                key: import("../RESP/types").BlobStringReply<string>;
                members: {
                    value: import("../RESP/types").BlobStringReply<string>;
                    score: import("../RESP/types").DoubleReply<number>;
                }[];
            } | null;
        };
    };
    bzmPop: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, timeout: number, keys: import("./generic-transformers").RedisVariadicArgument, side: import("./generic-transformers").SortedSetSide, options?: import("./ZMPOP").ZMPopOptions | undefined) => void;
        readonly transformReply: {
            readonly 2: (this: void, reply: import("../RESP/types").UnwrapReply<import("../RESP/types").Resp2Reply<import("./ZMPOP").ZMPopRawReply>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
                key: import("../RESP/types").BlobStringReply<string>;
                members: {
                    value: import("../RESP/types").BlobStringReply<string>;
                    score: import("../RESP/types").DoubleReply<number>;
                }[];
            } | null;
            readonly 3: (this: void, reply: import("../RESP/types").UnwrapReply<import("./ZMPOP").ZMPopRawReply>) => {
                key: import("../RESP/types").BlobStringReply<string>;
                members: {
                    value: import("../RESP/types").BlobStringReply<string>;
                    score: import("../RESP/types").DoubleReply<number>;
                }[];
            } | null;
        };
    };
    BZPOPMAX: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").RedisVariadicArgument, timeout: number) => void;
        readonly transformReply: {
            readonly 2: (this: void, reply: import("../RESP/types").UnwrapReply<import("../RESP/types").NullReply | import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>]>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
                key: import("../RESP/types").BlobStringReply<string>;
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            } | null;
            readonly 3: (this: void, reply: import("../RESP/types").UnwrapReply<import("../RESP/types").NullReply | import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").DoubleReply<number>]>>) => {
                key: import("../RESP/types").BlobStringReply<string>;
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            } | null;
        };
    };
    bzPopMax: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").RedisVariadicArgument, timeout: number) => void;
        readonly transformReply: {
            readonly 2: (this: void, reply: import("../RESP/types").UnwrapReply<import("../RESP/types").NullReply | import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>]>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
                key: import("../RESP/types").BlobStringReply<string>;
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            } | null;
            readonly 3: (this: void, reply: import("../RESP/types").UnwrapReply<import("../RESP/types").NullReply | import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").DoubleReply<number>]>>) => {
                key: import("../RESP/types").BlobStringReply<string>;
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            } | null;
        };
    };
    BZPOPMIN: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").RedisVariadicArgument, timeout: number) => void;
        readonly transformReply: {
            readonly 2: (this: void, reply: import("../RESP/types").UnwrapReply<import("../RESP/types").NullReply | import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>]>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
                key: import("../RESP/types").BlobStringReply<string>;
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            } | null;
            readonly 3: (this: void, reply: import("../RESP/types").UnwrapReply<import("../RESP/types").NullReply | import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").DoubleReply<number>]>>) => {
                key: import("../RESP/types").BlobStringReply<string>;
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            } | null;
        };
    };
    bzPopMin: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").RedisVariadicArgument, timeout: number) => void;
        readonly transformReply: {
            readonly 2: (this: void, reply: import("../RESP/types").UnwrapReply<import("../RESP/types").NullReply | import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>]>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
                key: import("../RESP/types").BlobStringReply<string>;
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            } | null;
            readonly 3: (this: void, reply: import("../RESP/types").UnwrapReply<import("../RESP/types").NullReply | import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").DoubleReply<number>]>>) => {
                key: import("../RESP/types").BlobStringReply<string>;
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            } | null;
        };
    };
    CLIENT_CACHING: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, value: boolean) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    clientCaching: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, value: boolean) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    CLIENT_GETNAME: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    clientGetName: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    CLIENT_GETREDIR: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    clientGetRedir: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    CLIENT_ID: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    clientId: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    CLIENT_INFO: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: (this: void, rawReply: import("../RESP/types").VerbatimStringReply<string>) => import("./CLIENT_INFO").ClientInfoReply;
    };
    clientInfo: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: (this: void, rawReply: import("../RESP/types").VerbatimStringReply<string>) => import("./CLIENT_INFO").ClientInfoReply;
    };
    CLIENT_KILL: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, filters: import("./CLIENT_KILL").ClientKillFilter | import("./CLIENT_KILL").ClientKillFilter[]) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    clientKill: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, filters: import("./CLIENT_KILL").ClientKillFilter | import("./CLIENT_KILL").ClientKillFilter[]) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    CLIENT_LIST: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, filter?: import("./CLIENT_LIST").ListFilter | undefined) => void;
        readonly transformReply: (this: void, rawReply: import("../RESP/types").VerbatimStringReply<string>) => import("./CLIENT_INFO").ClientInfoReply[];
    };
    clientList: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, filter?: import("./CLIENT_LIST").ListFilter | undefined) => void;
        readonly transformReply: (this: void, rawReply: import("../RESP/types").VerbatimStringReply<string>) => import("./CLIENT_INFO").ClientInfoReply[];
    };
    'CLIENT_NO-EVICT': {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, value: boolean) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    clientNoEvict: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, value: boolean) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    'CLIENT_NO-TOUCH': {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, value: boolean) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    clientNoTouch: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, value: boolean) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    CLIENT_PAUSE: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, timeout: number, mode?: "WRITE" | "ALL" | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    clientPause: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, timeout: number, mode?: "WRITE" | "ALL" | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    CLIENT_SETNAME: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, name: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    clientSetName: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, name: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    CLIENT_TRACKING: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: <M extends boolean>(parser: import("../..").CommandParser, mode: M, options?: (M extends true ? import("./CLIENT_TRACKING").ClientTrackingOptions : never) | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    clientTracking: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: <M extends boolean>(parser: import("../..").CommandParser, mode: M, options?: (M extends true ? import("./CLIENT_TRACKING").ClientTrackingOptions : never) | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    CLIENT_TRACKINGINFO: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: {
            readonly 2: (reply: [import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>, import("../RESP/types").BlobStringReply<"redirect">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"prefixes">, import("../RESP/types").RespType<42, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>]) => {
                flags: import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>;
                redirect: import("../RESP/types").NumberReply<number>;
                prefixes: import("../RESP/types").RespType<42, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>;
            };
            readonly 3: () => import("../RESP/types").TuplesToMapReply<[[import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").SetReply<import("../RESP/types").BlobStringReply<string>>], [import("../RESP/types").BlobStringReply<"redirect">, import("../RESP/types").NumberReply<number>], [import("../RESP/types").BlobStringReply<"prefixes">, import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>]]>;
        };
    };
    clientTrackingInfo: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: {
            readonly 2: (reply: [import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>, import("../RESP/types").BlobStringReply<"redirect">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"prefixes">, import("../RESP/types").RespType<42, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>]) => {
                flags: import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>;
                redirect: import("../RESP/types").NumberReply<number>;
                prefixes: import("../RESP/types").RespType<42, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>;
            };
            readonly 3: () => import("../RESP/types").TuplesToMapReply<[[import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").SetReply<import("../RESP/types").BlobStringReply<string>>], [import("../RESP/types").BlobStringReply<"redirect">, import("../RESP/types").NumberReply<number>], [import("../RESP/types").BlobStringReply<"prefixes">, import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>]]>;
        };
    };
    CLIENT_UNPAUSE: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    clientUnpause: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    CLUSTER_ADDSLOTS: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, slots: number | number[]) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    clusterAddSlots: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, slots: number | number[]) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    CLUSTER_ADDSLOTSRANGE: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, ranges: import("./generic-transformers").SlotRange | import("./generic-transformers").SlotRange[]) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    clusterAddSlotsRange: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, ranges: import("./generic-transformers").SlotRange | import("./generic-transformers").SlotRange[]) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    CLUSTER_BUMPEPOCH: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"BUMPED" | "STILL">;
    };
    clusterBumpEpoch: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"BUMPED" | "STILL">;
    };
    'CLUSTER_COUNT-FAILURE-REPORTS': {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, nodeId: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    clusterCountFailureReports: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, nodeId: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    CLUSTER_COUNTKEYSINSLOT: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, slot: number) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    clusterCountKeysInSlot: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, slot: number) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    CLUSTER_DELSLOTS: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, slots: number | number[]) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    clusterDelSlots: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, slots: number | number[]) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    CLUSTER_DELSLOTSRANGE: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, ranges: import("./generic-transformers").SlotRange | import("./generic-transformers").SlotRange[]) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    clusterDelSlotsRange: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, ranges: import("./generic-transformers").SlotRange | import("./generic-transformers").SlotRange[]) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    CLUSTER_FAILOVER: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, options?: import("./CLUSTER_FAILOVER").ClusterFailoverOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    clusterFailover: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, options?: import("./CLUSTER_FAILOVER").ClusterFailoverOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    CLUSTER_FLUSHSLOTS: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    clusterFlushSlots: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    CLUSTER_FORGET: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, nodeId: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    clusterForget: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, nodeId: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    CLUSTER_GETKEYSINSLOT: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, slot: number, count: number) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    clusterGetKeysInSlot: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, slot: number, count: number) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    CLUSTER_INFO: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").VerbatimStringReply<string>;
    };
    clusterInfo: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").VerbatimStringReply<string>;
    };
    CLUSTER_KEYSLOT: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    clusterKeySlot: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    CLUSTER_LINKS: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: {
            readonly 2: (reply: import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"direction">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"node">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"create-time">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"events">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"send-buffer-allocated">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"send-buffer-used">, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").BlobStringReply<"direction">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"node">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"create-time">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"events">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"send-buffer-allocated">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"send-buffer-used">, import("../RESP/types").NumberReply<number>]>[]) => {
                direction: import("../RESP/types").BlobStringReply<string>;
                node: import("../RESP/types").BlobStringReply<string>;
                'create-time': import("../RESP/types").NumberReply<number>;
                events: import("../RESP/types").BlobStringReply<string>;
                'send-buffer-allocated': import("../RESP/types").NumberReply<number>;
                'send-buffer-used': import("../RESP/types").NumberReply<number>;
            }[];
            readonly 3: () => import("../RESP/types").ArrayReply<import("../RESP/types").TuplesToMapReply<[[import("../RESP/types").BlobStringReply<"direction">, import("../RESP/types").BlobStringReply<string>], [import("../RESP/types").BlobStringReply<"node">, import("../RESP/types").BlobStringReply<string>], [import("../RESP/types").BlobStringReply<"create-time">, import("../RESP/types").NumberReply<number>], [import("../RESP/types").BlobStringReply<"events">, import("../RESP/types").BlobStringReply<string>], [import("../RESP/types").BlobStringReply<"send-buffer-allocated">, import("../RESP/types").NumberReply<number>], [import("../RESP/types").BlobStringReply<"send-buffer-used">, import("../RESP/types").NumberReply<number>]]>>;
        };
    };
    clusterLinks: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: {
            readonly 2: (reply: import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"direction">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"node">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"create-time">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"events">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"send-buffer-allocated">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"send-buffer-used">, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").BlobStringReply<"direction">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"node">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"create-time">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"events">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"send-buffer-allocated">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"send-buffer-used">, import("../RESP/types").NumberReply<number>]>[]) => {
                direction: import("../RESP/types").BlobStringReply<string>;
                node: import("../RESP/types").BlobStringReply<string>;
                'create-time': import("../RESP/types").NumberReply<number>;
                events: import("../RESP/types").BlobStringReply<string>;
                'send-buffer-allocated': import("../RESP/types").NumberReply<number>;
                'send-buffer-used': import("../RESP/types").NumberReply<number>;
            }[];
            readonly 3: () => import("../RESP/types").ArrayReply<import("../RESP/types").TuplesToMapReply<[[import("../RESP/types").BlobStringReply<"direction">, import("../RESP/types").BlobStringReply<string>], [import("../RESP/types").BlobStringReply<"node">, import("../RESP/types").BlobStringReply<string>], [import("../RESP/types").BlobStringReply<"create-time">, import("../RESP/types").NumberReply<number>], [import("../RESP/types").BlobStringReply<"events">, import("../RESP/types").BlobStringReply<string>], [import("../RESP/types").BlobStringReply<"send-buffer-allocated">, import("../RESP/types").NumberReply<number>], [import("../RESP/types").BlobStringReply<"send-buffer-used">, import("../RESP/types").NumberReply<number>]]>>;
        };
    };
    CLUSTER_MEET: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, host: string, port: number) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    clusterMeet: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, host: string, port: number) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    CLUSTER_MYID: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    clusterMyId: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    CLUSTER_MYSHARDID: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    clusterMyShardId: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    CLUSTER_NODES: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").VerbatimStringReply<string>;
    };
    clusterNodes: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").VerbatimStringReply<string>;
    };
    CLUSTER_REPLICAS: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, nodeId: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    clusterReplicas: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, nodeId: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    CLUSTER_REPLICATE: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, nodeId: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    clusterReplicate: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, nodeId: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    CLUSTER_RESET: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, options?: import("./CLUSTER_RESET").ClusterResetOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    clusterReset: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, options?: import("./CLUSTER_RESET").ClusterResetOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    CLUSTER_SAVECONFIG: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    clusterSaveConfig: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    'CLUSTER_SET-CONFIG-EPOCH': {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, configEpoch: number) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    clusterSetConfigEpoch: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, configEpoch: number) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    CLUSTER_SETSLOT: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, slot: number, state: import("./CLUSTER_SETSLOT").ClusterSlotState, nodeId?: import("../RESP/types").RedisArgument | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    clusterSetSlot: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, slot: number, state: import("./CLUSTER_SETSLOT").ClusterSlotState, nodeId?: import("../RESP/types").RedisArgument | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    CLUSTER_SLOTS: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: (this: void, reply: [from: import("../RESP/types").NumberReply<number>, to: import("../RESP/types").NumberReply<number>, master: import("../RESP/types").TuplesReply<[host: import("../RESP/types").BlobStringReply<string>, port: import("../RESP/types").NumberReply<number>, id: import("../RESP/types").BlobStringReply<string>]>, ...replicas: import("../RESP/types").TuplesReply<[host: import("../RESP/types").BlobStringReply<string>, port: import("../RESP/types").NumberReply<number>, id: import("../RESP/types").BlobStringReply<string>]>[]][]) => {
            from: import("../RESP/types").NumberReply<number>;
            to: import("../RESP/types").NumberReply<number>;
            master: {
                host: import("../RESP/types").BlobStringReply<string>;
                port: import("../RESP/types").NumberReply<number>;
                id: import("../RESP/types").BlobStringReply<string>;
            };
            replicas: {
                host: import("../RESP/types").BlobStringReply<string>;
                port: import("../RESP/types").NumberReply<number>;
                id: import("../RESP/types").BlobStringReply<string>;
            }[];
        }[];
    };
    clusterSlots: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: (this: void, reply: [from: import("../RESP/types").NumberReply<number>, to: import("../RESP/types").NumberReply<number>, master: import("../RESP/types").TuplesReply<[host: import("../RESP/types").BlobStringReply<string>, port: import("../RESP/types").NumberReply<number>, id: import("../RESP/types").BlobStringReply<string>]>, ...replicas: import("../RESP/types").TuplesReply<[host: import("../RESP/types").BlobStringReply<string>, port: import("../RESP/types").NumberReply<number>, id: import("../RESP/types").BlobStringReply<string>]>[]][]) => {
            from: import("../RESP/types").NumberReply<number>;
            to: import("../RESP/types").NumberReply<number>;
            master: {
                host: import("../RESP/types").BlobStringReply<string>;
                port: import("../RESP/types").NumberReply<number>;
                id: import("../RESP/types").BlobStringReply<string>;
            };
            replicas: {
                host: import("../RESP/types").BlobStringReply<string>;
                port: import("../RESP/types").NumberReply<number>;
                id: import("../RESP/types").BlobStringReply<string>;
            }[];
        }[];
    };
    COMMAND_COUNT: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    commandCount: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    COMMAND_GETKEYS: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, args: import("../RESP/types").RedisArgument[]) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    commandGetKeys: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, args: import("../RESP/types").RedisArgument[]) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    COMMAND_GETKEYSANDFLAGS: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, args: import("../RESP/types").RedisArgument[]) => void;
        readonly transformReply: (this: void, reply: import("../RESP/types").TuplesReply<[key: import("../RESP/types").BlobStringReply<string>, flags: import("../RESP/types").SetReply<import("../RESP/types").BlobStringReply<string>>]>[]) => {
            key: import("../RESP/types").BlobStringReply<string>;
            flags: import("../RESP/types").SetReply<import("../RESP/types").BlobStringReply<string>>;
        }[];
    };
    commandGetKeysAndFlags: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, args: import("../RESP/types").RedisArgument[]) => void;
        readonly transformReply: (this: void, reply: import("../RESP/types").TuplesReply<[key: import("../RESP/types").BlobStringReply<string>, flags: import("../RESP/types").SetReply<import("../RESP/types").BlobStringReply<string>>]>[]) => {
            key: import("../RESP/types").BlobStringReply<string>;
            flags: import("../RESP/types").SetReply<import("../RESP/types").BlobStringReply<string>>;
        }[];
    };
    COMMAND_INFO: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, commands: string[]) => void;
        readonly transformReply: (this: void, reply: import("./generic-transformers").CommandRawReply[]) => (import("./generic-transformers").CommandReply | null)[];
    };
    commandInfo: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, commands: string[]) => void;
        readonly transformReply: (this: void, reply: import("./generic-transformers").CommandRawReply[]) => (import("./generic-transformers").CommandReply | null)[];
    };
    COMMAND_LIST: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, options?: import("./COMMAND_LIST").CommandListOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    commandList: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, options?: import("./COMMAND_LIST").CommandListOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    COMMAND: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: (this: void, reply: import("./generic-transformers").CommandRawReply[]) => import("./generic-transformers").CommandReply[];
    };
    command: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: (this: void, reply: import("./generic-transformers").CommandRawReply[]) => import("./generic-transformers").CommandReply[];
    };
    CONFIG_GET: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, parameters: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: {
            readonly 2: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => import("../RESP/types").MapReply<import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>>;
            readonly 3: () => import("../RESP/types").MapReply<import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>>;
        };
    };
    configGet: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, parameters: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: {
            readonly 2: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => import("../RESP/types").MapReply<import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>>;
            readonly 3: () => import("../RESP/types").MapReply<import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>>;
        };
    };
    CONFIG_RESETASTAT: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    configResetStat: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    CONFIG_REWRITE: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    configRewrite: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    CONFIG_SET: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, ...[parameterOrConfig, value]: [parameter: import("../RESP/types").RedisArgument, value: import("../RESP/types").RedisArgument] | [config: Record<string, import("../RESP/types").RedisArgument>]) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    configSet: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, ...[parameterOrConfig, value]: [parameter: import("../RESP/types").RedisArgument, value: import("../RESP/types").RedisArgument] | [config: Record<string, import("../RESP/types").RedisArgument>]) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    COPY: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, source: import("../RESP/types").RedisArgument, destination: import("../RESP/types").RedisArgument, options?: import("./COPY").CopyCommandOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    copy: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, source: import("../RESP/types").RedisArgument, destination: import("../RESP/types").RedisArgument, options?: import("./COPY").CopyCommandOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    DBSIZE: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    dbSize: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    DECR: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    decr: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    DECRBY: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, decrement: number) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    decrBy: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, decrement: number) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    DEL: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    del: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    DELEX: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, options?: {
            condition: "IFEQ" | "IFNE" | "IFDEQ" | "IFDNE";
            matchValue: import("../RESP/types").RedisArgument;
        } | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<0 | 1>;
    };
    delEx: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, options?: {
            condition: "IFEQ" | "IFNE" | "IFDEQ" | "IFDNE";
            matchValue: import("../RESP/types").RedisArgument;
        } | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<0 | 1>;
    };
    DIGEST: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    digest: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    DUMP: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    dump: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    ECHO: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, message: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    echo: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, message: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    EVAL_RO: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, script: import("../RESP/types").RedisArgument, options?: import("./EVAL").EvalOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ReplyUnion;
    };
    evalRo: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, script: import("../RESP/types").RedisArgument, options?: import("./EVAL").EvalOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ReplyUnion;
    };
    EVAL: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, script: import("../RESP/types").RedisArgument, options?: import("./EVAL").EvalOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ReplyUnion;
    };
    eval: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, script: import("../RESP/types").RedisArgument, options?: import("./EVAL").EvalOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ReplyUnion;
    };
    EVALSHA_RO: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, script: import("../RESP/types").RedisArgument, options?: import("./EVAL").EvalOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ReplyUnion;
    };
    evalShaRo: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, script: import("../RESP/types").RedisArgument, options?: import("./EVAL").EvalOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ReplyUnion;
    };
    EVALSHA: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, script: import("../RESP/types").RedisArgument, options?: import("./EVAL").EvalOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ReplyUnion;
    };
    evalSha: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, script: import("../RESP/types").RedisArgument, options?: import("./EVAL").EvalOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ReplyUnion;
    };
    EXISTS: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    exists: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    EXPIRE: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, seconds: number, mode?: "NX" | "XX" | "GT" | "LT" | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    expire: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, seconds: number, mode?: "NX" | "XX" | "GT" | "LT" | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    EXPIREAT: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, timestamp: number | Date, mode?: "NX" | "XX" | "GT" | "LT" | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    expireAt: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, timestamp: number | Date, mode?: "NX" | "XX" | "GT" | "LT" | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    EXPIRETIME: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    expireTime: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    FLUSHALL: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, mode?: import("./FLUSHALL").RedisFlushMode | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    flushAll: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, mode?: import("./FLUSHALL").RedisFlushMode | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    FLUSHDB: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, mode?: import("./FLUSHALL").RedisFlushMode | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    flushDb: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, mode?: import("./FLUSHALL").RedisFlushMode | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    FCALL: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, script: import("../RESP/types").RedisArgument, options?: import("./EVAL").EvalOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ReplyUnion;
    };
    fCall: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, script: import("../RESP/types").RedisArgument, options?: import("./EVAL").EvalOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ReplyUnion;
    };
    FCALL_RO: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, script: import("../RESP/types").RedisArgument, options?: import("./EVAL").EvalOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ReplyUnion;
    };
    fCallRo: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, script: import("../RESP/types").RedisArgument, options?: import("./EVAL").EvalOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ReplyUnion;
    };
    FUNCTION_DELETE: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, library: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    functionDelete: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, library: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    FUNCTION_DUMP: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    functionDump: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    FUNCTION_FLUSH: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, mode?: import("./FLUSHALL").RedisFlushMode | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    functionFlush: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, mode?: import("./FLUSHALL").RedisFlushMode | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    FUNCTION_KILL: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    functionKill: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    FUNCTION_LIST_WITHCODE: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, options?: import("./FUNCTION_LIST").FunctionListOptions | undefined) => void;
        readonly transformReply: {
            readonly 2: (reply: import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"library_name">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"engine">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"functions">, import("../RESP/types").RespType<42, import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>], never, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>]>[], never, import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>], never, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>]>[]>, import("../RESP/types").BlobStringReply<"library_code">, import("../RESP/types").BlobStringReply<string>], never, [import("../RESP/types").BlobStringReply<"library_name">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"engine">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"functions">, import("../RESP/types").RespType<42, import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>], never, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>]>[], never, import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>], never, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>]>[]>, import("../RESP/types").BlobStringReply<"library_code">, import("../RESP/types").BlobStringReply<string>]>[]) => {
                library_name: import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
                engine: import("../RESP/types").BlobStringReply<string>;
                functions: {
                    name: import("../RESP/types").BlobStringReply<string>;
                    description: import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
                    flags: import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>;
                }[];
                library_code: import("../RESP/types").BlobStringReply<string>;
            }[];
            readonly 3: () => import("./FUNCTION_LIST_WITHCODE").FunctionListWithCodeReply;
        };
    };
    functionListWithCode: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, options?: import("./FUNCTION_LIST").FunctionListOptions | undefined) => void;
        readonly transformReply: {
            readonly 2: (reply: import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"library_name">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"engine">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"functions">, import("../RESP/types").RespType<42, import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>], never, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>]>[], never, import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>], never, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>]>[]>, import("../RESP/types").BlobStringReply<"library_code">, import("../RESP/types").BlobStringReply<string>], never, [import("../RESP/types").BlobStringReply<"library_name">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"engine">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"functions">, import("../RESP/types").RespType<42, import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>], never, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>]>[], never, import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>], never, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>]>[]>, import("../RESP/types").BlobStringReply<"library_code">, import("../RESP/types").BlobStringReply<string>]>[]) => {
                library_name: import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
                engine: import("../RESP/types").BlobStringReply<string>;
                functions: {
                    name: import("../RESP/types").BlobStringReply<string>;
                    description: import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
                    flags: import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>;
                }[];
                library_code: import("../RESP/types").BlobStringReply<string>;
            }[];
            readonly 3: () => import("./FUNCTION_LIST_WITHCODE").FunctionListWithCodeReply;
        };
    };
    FUNCTION_LIST: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, options?: import("./FUNCTION_LIST").FunctionListOptions | undefined) => void;
        readonly transformReply: {
            readonly 2: (reply: import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"library_name">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"engine">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"functions">, import("../RESP/types").RespType<42, import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>], never, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>]>[], never, import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>], never, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>]>[]>], never, [import("../RESP/types").BlobStringReply<"library_name">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"engine">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"functions">, import("../RESP/types").RespType<42, import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>], never, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>]>[], never, import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>], never, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>]>[]>]>[]) => {
                library_name: import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
                engine: import("../RESP/types").BlobStringReply<string>;
                functions: {
                    name: import("../RESP/types").BlobStringReply<string>;
                    description: import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
                    flags: import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>;
                }[];
            }[];
            readonly 3: () => import("./FUNCTION_LIST").FunctionListReply;
        };
    };
    functionList: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, options?: import("./FUNCTION_LIST").FunctionListOptions | undefined) => void;
        readonly transformReply: {
            readonly 2: (reply: import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"library_name">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"engine">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"functions">, import("../RESP/types").RespType<42, import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>], never, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>]>[], never, import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>], never, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>]>[]>], never, [import("../RESP/types").BlobStringReply<"library_name">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"engine">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"functions">, import("../RESP/types").RespType<42, import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>], never, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>]>[], never, import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>], never, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"description">, import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"flags">, import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>]>[]>]>[]) => {
                library_name: import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
                engine: import("../RESP/types").BlobStringReply<string>;
                functions: {
                    name: import("../RESP/types").BlobStringReply<string>;
                    description: import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
                    flags: import("../RESP/types").RespType<126, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>;
                }[];
            }[];
            readonly 3: () => import("./FUNCTION_LIST").FunctionListReply;
        };
    };
    FUNCTION_LOAD: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, code: import("../RESP/types").RedisArgument, options?: import("./FUNCTION_LOAD").FunctionLoadOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    functionLoad: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, code: import("../RESP/types").RedisArgument, options?: import("./FUNCTION_LOAD").FunctionLoadOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    FUNCTION_RESTORE: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, dump: import("../RESP/types").RedisArgument, options?: import("./FUNCTION_RESTORE").FunctionRestoreOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    functionRestore: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, dump: import("../RESP/types").RedisArgument, options?: import("./FUNCTION_RESTORE").FunctionRestoreOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    FUNCTION_STATS: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: {
            readonly 2: (reply: [import("../RESP/types").BlobStringReply<"running_script">, import("../RESP/types").NullReply | import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"command">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"duration_ms">, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"command">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"duration_ms">, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").BlobStringReply<"engines">, import("../RESP/types").RespType<42, (import("../RESP/types").BlobStringReply<string> | import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"libraries_count">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"functions_count">, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").BlobStringReply<"libraries_count">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"functions_count">, import("../RESP/types").NumberReply<number>]>)[], never, (import("../RESP/types").BlobStringReply<string> | import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"libraries_count">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"functions_count">, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").BlobStringReply<"libraries_count">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"functions_count">, import("../RESP/types").NumberReply<number>]>)[]>]) => {
                running_script: {
                    name: import("../RESP/types").BlobStringReply<string>;
                    command: import("../RESP/types").BlobStringReply<string>;
                    duration_ms: import("../RESP/types").NumberReply<number>;
                } | null;
                engines: Record<string, {
                    libraries_count: import("../RESP/types").NumberReply<number>;
                    functions_count: import("../RESP/types").NumberReply<number>;
                }>;
            };
            readonly 3: () => import("../RESP/types").TuplesToMapReply<[[import("../RESP/types").BlobStringReply<"running_script">, import("../RESP/types").NullReply | import("../RESP/types").TuplesToMapReply<[[import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>], [import("../RESP/types").BlobStringReply<"command">, import("../RESP/types").BlobStringReply<string>], [import("../RESP/types").BlobStringReply<"duration_ms">, import("../RESP/types").NumberReply<number>]]>], [import("../RESP/types").BlobStringReply<"engines">, import("../RESP/types").MapReply<import("../RESP/types").BlobStringReply<string>, import("../RESP/types").TuplesToMapReply<[[import("../RESP/types").BlobStringReply<"libraries_count">, import("../RESP/types").NumberReply<number>], [import("../RESP/types").BlobStringReply<"functions_count">, import("../RESP/types").NumberReply<number>]]>>]]>;
        };
    };
    functionStats: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: {
            readonly 2: (reply: [import("../RESP/types").BlobStringReply<"running_script">, import("../RESP/types").NullReply | import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"command">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"duration_ms">, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"command">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"duration_ms">, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").BlobStringReply<"engines">, import("../RESP/types").RespType<42, (import("../RESP/types").BlobStringReply<string> | import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"libraries_count">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"functions_count">, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").BlobStringReply<"libraries_count">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"functions_count">, import("../RESP/types").NumberReply<number>]>)[], never, (import("../RESP/types").BlobStringReply<string> | import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"libraries_count">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"functions_count">, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").BlobStringReply<"libraries_count">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"functions_count">, import("../RESP/types").NumberReply<number>]>)[]>]) => {
                running_script: {
                    name: import("../RESP/types").BlobStringReply<string>;
                    command: import("../RESP/types").BlobStringReply<string>;
                    duration_ms: import("../RESP/types").NumberReply<number>;
                } | null;
                engines: Record<string, {
                    libraries_count: import("../RESP/types").NumberReply<number>;
                    functions_count: import("../RESP/types").NumberReply<number>;
                }>;
            };
            readonly 3: () => import("../RESP/types").TuplesToMapReply<[[import("../RESP/types").BlobStringReply<"running_script">, import("../RESP/types").NullReply | import("../RESP/types").TuplesToMapReply<[[import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>], [import("../RESP/types").BlobStringReply<"command">, import("../RESP/types").BlobStringReply<string>], [import("../RESP/types").BlobStringReply<"duration_ms">, import("../RESP/types").NumberReply<number>]]>], [import("../RESP/types").BlobStringReply<"engines">, import("../RESP/types").MapReply<import("../RESP/types").BlobStringReply<string>, import("../RESP/types").TuplesToMapReply<[[import("../RESP/types").BlobStringReply<"libraries_count">, import("../RESP/types").NumberReply<number>], [import("../RESP/types").BlobStringReply<"functions_count">, import("../RESP/types").NumberReply<number>]]>>]]>;
        };
    };
    GEOADD: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, toAdd: import("./GEOADD").GeoMember | import("./GEOADD").GeoMember[], options?: import("./GEOADD").GeoAddOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    geoAdd: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, toAdd: import("./GEOADD").GeoMember | import("./GEOADD").GeoMember[], options?: import("./GEOADD").GeoAddOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    GEODIST: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, member1: import("../RESP/types").RedisArgument, member2: import("../RESP/types").RedisArgument, unit?: import("./GEOSEARCH").GeoUnits | undefined) => void;
        readonly transformReply: (this: void, reply: import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>) => number | null;
    };
    geoDist: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, member1: import("../RESP/types").RedisArgument, member2: import("../RESP/types").RedisArgument, unit?: import("./GEOSEARCH").GeoUnits | undefined) => void;
        readonly transformReply: (this: void, reply: import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>) => number | null;
    };
    GEOHASH: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, member: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    geoHash: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, member: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    GEOPOS: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, member: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: (this: void, reply: (import("../RESP/types").NullReply | import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>]>)[]) => ({
            longitude: import("../RESP/types").BlobStringReply<string>;
            latitude: import("../RESP/types").BlobStringReply<string>;
        } | null)[];
    };
    geoPos: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, member: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: (this: void, reply: (import("../RESP/types").NullReply | import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>]>)[]) => ({
            longitude: import("../RESP/types").BlobStringReply<string>;
            latitude: import("../RESP/types").BlobStringReply<string>;
        } | null)[];
    };
    GEORADIUS_RO_WITH: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, from: import("./GEOSEARCH").GeoCoordinates, radius: number, unit: import("./GEOSEARCH").GeoUnits, replyWith: import("./GEOSEARCH_WITH").GeoReplyWith[], options?: import("./GEOSEARCH").GeoSearchOptions | undefined) => void;
        readonly transformReply: (this: void, reply: import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, ...any[]]>[], replyWith: import("./GEOSEARCH_WITH").GeoReplyWith[]) => import("./GEOSEARCH_WITH").GeoReplyWithMember[];
    };
    geoRadiusRoWith: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, from: import("./GEOSEARCH").GeoCoordinates, radius: number, unit: import("./GEOSEARCH").GeoUnits, replyWith: import("./GEOSEARCH_WITH").GeoReplyWith[], options?: import("./GEOSEARCH").GeoSearchOptions | undefined) => void;
        readonly transformReply: (this: void, reply: import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, ...any[]]>[], replyWith: import("./GEOSEARCH_WITH").GeoReplyWith[]) => import("./GEOSEARCH_WITH").GeoReplyWithMember[];
    };
    GEORADIUS_RO: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, from: import("./GEOSEARCH").GeoCoordinates, radius: number, unit: import("./GEOSEARCH").GeoUnits, options?: import("./GEOSEARCH").GeoSearchOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    geoRadiusRo: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, from: import("./GEOSEARCH").GeoCoordinates, radius: number, unit: import("./GEOSEARCH").GeoUnits, options?: import("./GEOSEARCH").GeoSearchOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    GEORADIUS_STORE: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, from: import("./GEOSEARCH").GeoCoordinates, radius: number, unit: import("./GEOSEARCH").GeoUnits, destination: import("../RESP/types").RedisArgument, options?: import("./GEORADIUS_STORE").GeoRadiusStoreOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    geoRadiusStore: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, from: import("./GEOSEARCH").GeoCoordinates, radius: number, unit: import("./GEOSEARCH").GeoUnits, destination: import("../RESP/types").RedisArgument, options?: import("./GEORADIUS_STORE").GeoRadiusStoreOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    GEORADIUS_WITH: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, from: import("./GEOSEARCH").GeoCoordinates, radius: number, unit: import("./GEOSEARCH").GeoUnits, replyWith: import("./GEOSEARCH_WITH").GeoReplyWith[], options?: import("./GEOSEARCH").GeoSearchOptions | undefined) => void;
        readonly transformReply: (this: void, reply: import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, ...any[]]>[], replyWith: import("./GEOSEARCH_WITH").GeoReplyWith[]) => import("./GEOSEARCH_WITH").GeoReplyWithMember[];
    };
    geoRadiusWith: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, from: import("./GEOSEARCH").GeoCoordinates, radius: number, unit: import("./GEOSEARCH").GeoUnits, replyWith: import("./GEOSEARCH_WITH").GeoReplyWith[], options?: import("./GEOSEARCH").GeoSearchOptions | undefined) => void;
        readonly transformReply: (this: void, reply: import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, ...any[]]>[], replyWith: import("./GEOSEARCH_WITH").GeoReplyWith[]) => import("./GEOSEARCH_WITH").GeoReplyWithMember[];
    };
    GEORADIUS: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, from: import("./GEOSEARCH").GeoCoordinates, radius: number, unit: import("./GEOSEARCH").GeoUnits, options?: import("./GEOSEARCH").GeoSearchOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    geoRadius: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, from: import("./GEOSEARCH").GeoCoordinates, radius: number, unit: import("./GEOSEARCH").GeoUnits, options?: import("./GEOSEARCH").GeoSearchOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    GEORADIUSBYMEMBER_RO_WITH: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, from: import("../RESP/types").RedisArgument, radius: number, unit: import("./GEOSEARCH").GeoUnits, replyWith: import("./GEOSEARCH_WITH").GeoReplyWith[], options?: import("./GEOSEARCH").GeoSearchOptions | undefined) => void;
        readonly transformReply: (this: void, reply: import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, ...any[]]>[], replyWith: import("./GEOSEARCH_WITH").GeoReplyWith[]) => import("./GEOSEARCH_WITH").GeoReplyWithMember[];
    };
    geoRadiusByMemberRoWith: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, from: import("../RESP/types").RedisArgument, radius: number, unit: import("./GEOSEARCH").GeoUnits, replyWith: import("./GEOSEARCH_WITH").GeoReplyWith[], options?: import("./GEOSEARCH").GeoSearchOptions | undefined) => void;
        readonly transformReply: (this: void, reply: import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, ...any[]]>[], replyWith: import("./GEOSEARCH_WITH").GeoReplyWith[]) => import("./GEOSEARCH_WITH").GeoReplyWithMember[];
    };
    GEORADIUSBYMEMBER_RO: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, from: import("../RESP/types").RedisArgument, radius: number, unit: import("./GEOSEARCH").GeoUnits, options?: import("./GEOSEARCH").GeoSearchOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    geoRadiusByMemberRo: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, from: import("../RESP/types").RedisArgument, radius: number, unit: import("./GEOSEARCH").GeoUnits, options?: import("./GEOSEARCH").GeoSearchOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    GEORADIUSBYMEMBER_STORE: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, from: import("../RESP/types").RedisArgument, radius: number, unit: import("./GEOSEARCH").GeoUnits, destination: import("../RESP/types").RedisArgument, options?: import("./GEORADIUSBYMEMBER_STORE").GeoRadiusStoreOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    geoRadiusByMemberStore: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, from: import("../RESP/types").RedisArgument, radius: number, unit: import("./GEOSEARCH").GeoUnits, destination: import("../RESP/types").RedisArgument, options?: import("./GEORADIUSBYMEMBER_STORE").GeoRadiusStoreOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    GEORADIUSBYMEMBER_WITH: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, from: import("../RESP/types").RedisArgument, radius: number, unit: import("./GEOSEARCH").GeoUnits, replyWith: import("./GEOSEARCH_WITH").GeoReplyWith[], options?: import("./GEOSEARCH").GeoSearchOptions | undefined) => void;
        readonly transformReply: (this: void, reply: import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, ...any[]]>[], replyWith: import("./GEOSEARCH_WITH").GeoReplyWith[]) => import("./GEOSEARCH_WITH").GeoReplyWithMember[];
    };
    geoRadiusByMemberWith: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, from: import("../RESP/types").RedisArgument, radius: number, unit: import("./GEOSEARCH").GeoUnits, replyWith: import("./GEOSEARCH_WITH").GeoReplyWith[], options?: import("./GEOSEARCH").GeoSearchOptions | undefined) => void;
        readonly transformReply: (this: void, reply: import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, ...any[]]>[], replyWith: import("./GEOSEARCH_WITH").GeoReplyWith[]) => import("./GEOSEARCH_WITH").GeoReplyWithMember[];
    };
    GEORADIUSBYMEMBER: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, from: import("../RESP/types").RedisArgument, radius: number, unit: import("./GEOSEARCH").GeoUnits, options?: import("./GEOSEARCH").GeoSearchOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    geoRadiusByMember: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, from: import("../RESP/types").RedisArgument, radius: number, unit: import("./GEOSEARCH").GeoUnits, options?: import("./GEOSEARCH").GeoSearchOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    GEOSEARCH_WITH: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, from: import("./GEOSEARCH").GeoSearchFrom, by: import("./GEOSEARCH").GeoSearchBy, replyWith: import("./GEOSEARCH_WITH").GeoReplyWith[], options?: import("./GEOSEARCH").GeoSearchOptions | undefined) => void;
        readonly transformReply: (this: void, reply: import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, ...any[]]>[], replyWith: import("./GEOSEARCH_WITH").GeoReplyWith[]) => import("./GEOSEARCH_WITH").GeoReplyWithMember[];
    };
    geoSearchWith: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, from: import("./GEOSEARCH").GeoSearchFrom, by: import("./GEOSEARCH").GeoSearchBy, replyWith: import("./GEOSEARCH_WITH").GeoReplyWith[], options?: import("./GEOSEARCH").GeoSearchOptions | undefined) => void;
        readonly transformReply: (this: void, reply: import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, ...any[]]>[], replyWith: import("./GEOSEARCH_WITH").GeoReplyWith[]) => import("./GEOSEARCH_WITH").GeoReplyWithMember[];
    };
    GEOSEARCH: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, from: import("./GEOSEARCH").GeoSearchFrom, by: import("./GEOSEARCH").GeoSearchBy, options?: import("./GEOSEARCH").GeoSearchOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    geoSearch: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, from: import("./GEOSEARCH").GeoSearchFrom, by: import("./GEOSEARCH").GeoSearchBy, options?: import("./GEOSEARCH").GeoSearchOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    GEOSEARCHSTORE: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, destination: import("../RESP/types").RedisArgument, source: import("../RESP/types").RedisArgument, from: import("./GEOSEARCH").GeoSearchFrom, by: import("./GEOSEARCH").GeoSearchBy, options?: import("./GEOSEARCHSTORE").GeoSearchStoreOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    geoSearchStore: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, destination: import("../RESP/types").RedisArgument, source: import("../RESP/types").RedisArgument, from: import("./GEOSEARCH").GeoSearchFrom, by: import("./GEOSEARCH").GeoSearchBy, options?: import("./GEOSEARCHSTORE").GeoSearchStoreOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    GET: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    get: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    GETBIT: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, offset: number) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<import("./generic-transformers").BitValue>;
    };
    getBit: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, offset: number) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<import("./generic-transformers").BitValue>;
    };
    GETDEL: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    getDel: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    GETEX: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, options: import("./GETEX").GetExOptions) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    getEx: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, options: import("./GETEX").GetExOptions) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    GETRANGE: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, start: number, end: number) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    getRange: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, start: number, end: number) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    GETSET: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, value: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    getSet: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, value: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    HDEL: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, field: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    hDel: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, field: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    HELLO: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, protover?: import("../RESP/types").RespVersions | undefined, options?: import("./HELLO").HelloOptions | undefined) => void;
        readonly transformReply: {
            readonly 2: (reply: [import("../RESP/types").BlobStringReply<"server">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"version">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"proto">, import("../RESP/types").NumberReply<import("../RESP/types").RespVersions>, import("../RESP/types").BlobStringReply<"id">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"mode">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"role">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"modules">, import("../RESP/types").RespType<42, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>]) => {
                server: import("../RESP/types").BlobStringReply<string>;
                version: import("../RESP/types").BlobStringReply<string>;
                proto: import("../RESP/types").NumberReply<import("../RESP/types").RespVersions>;
                id: import("../RESP/types").NumberReply<number>;
                mode: import("../RESP/types").BlobStringReply<string>;
                role: import("../RESP/types").BlobStringReply<string>;
                modules: import("../RESP/types").RespType<42, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>;
            };
            readonly 3: () => import("./HELLO").HelloReply;
        };
    };
    hello: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, protover?: import("../RESP/types").RespVersions | undefined, options?: import("./HELLO").HelloOptions | undefined) => void;
        readonly transformReply: {
            readonly 2: (reply: [import("../RESP/types").BlobStringReply<"server">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"version">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"proto">, import("../RESP/types").NumberReply<import("../RESP/types").RespVersions>, import("../RESP/types").BlobStringReply<"id">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"mode">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"role">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"modules">, import("../RESP/types").RespType<42, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>]) => {
                server: import("../RESP/types").BlobStringReply<string>;
                version: import("../RESP/types").BlobStringReply<string>;
                proto: import("../RESP/types").NumberReply<import("../RESP/types").RespVersions>;
                id: import("../RESP/types").NumberReply<number>;
                mode: import("../RESP/types").BlobStringReply<string>;
                role: import("../RESP/types").BlobStringReply<string>;
                modules: import("../RESP/types").RespType<42, import("../RESP/types").BlobStringReply<string>[], never, import("../RESP/types").BlobStringReply<string>[]>;
            };
            readonly 3: () => import("./HELLO").HelloReply;
        };
    };
    HEXISTS: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, field: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<0 | 1>;
    };
    hExists: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, field: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<0 | 1>;
    };
    HEXPIRE: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, fields: import("./generic-transformers").RedisVariadicArgument, seconds: number, mode?: "NX" | "XX" | "GT" | "LT" | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("./HEXPIRE").HashExpiration>;
    };
    hExpire: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, fields: import("./generic-transformers").RedisVariadicArgument, seconds: number, mode?: "NX" | "XX" | "GT" | "LT" | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("./HEXPIRE").HashExpiration>;
    };
    HEXPIREAT: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, fields: import("./generic-transformers").RedisVariadicArgument, timestamp: number | Date, mode?: "NX" | "XX" | "GT" | "LT" | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").NumberReply<number>>;
    };
    hExpireAt: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, fields: import("./generic-transformers").RedisVariadicArgument, timestamp: number | Date, mode?: "NX" | "XX" | "GT" | "LT" | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").NumberReply<number>>;
    };
    HEXPIRETIME: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, fields: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").NumberReply<number>>;
    };
    hExpireTime: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, fields: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").NumberReply<number>>;
    };
    HGET: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, field: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    hGet: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, field: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    HGETALL: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly TRANSFORM_LEGACY_REPLY: true;
        readonly transformReply: {
            readonly 2: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => import("../RESP/types").MapReply<import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>>;
            readonly 3: () => import("../RESP/types").MapReply<import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>>;
        };
    };
    hGetAll: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly TRANSFORM_LEGACY_REPLY: true;
        readonly transformReply: {
            readonly 2: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => import("../RESP/types").MapReply<import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>>;
            readonly 3: () => import("../RESP/types").MapReply<import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>>;
        };
    };
    HGETDEL: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, fields: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>>;
    };
    hGetDel: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, fields: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>>;
    };
    HGETEX: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, fields: import("./generic-transformers").RedisVariadicArgument, options?: import("./HGETEX").HGetExOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>>;
    };
    hGetEx: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, fields: import("./generic-transformers").RedisVariadicArgument, options?: import("./HGETEX").HGetExOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>>;
    };
    HINCRBY: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, field: import("../RESP/types").RedisArgument, increment: number) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    hIncrBy: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, field: import("../RESP/types").RedisArgument, increment: number) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    HINCRBYFLOAT: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, field: import("../RESP/types").RedisArgument, increment: number) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    hIncrByFloat: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, field: import("../RESP/types").RedisArgument, increment: number) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    HKEYS: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    hKeys: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    HLEN: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    hLen: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    HMGET: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, fields: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>>;
    };
    hmGet: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, fields: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>>;
    };
    HPERSIST: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, fields: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").ArrayReply<import("../RESP/types").NumberReply<number>>;
    };
    hPersist: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, fields: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").ArrayReply<import("../RESP/types").NumberReply<number>>;
    };
    HPEXPIRE: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, fields: import("./generic-transformers").RedisVariadicArgument, ms: number, mode?: "NX" | "XX" | "GT" | "LT" | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").ArrayReply<import("./HEXPIRE").HashExpiration>;
    };
    hpExpire: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, fields: import("./generic-transformers").RedisVariadicArgument, ms: number, mode?: "NX" | "XX" | "GT" | "LT" | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").ArrayReply<import("./HEXPIRE").HashExpiration>;
    };
    HPEXPIREAT: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, fields: import("./generic-transformers").RedisVariadicArgument, timestamp: number | Date, mode?: "NX" | "XX" | "GT" | "LT" | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").ArrayReply<import("./HEXPIRE").HashExpiration>;
    };
    hpExpireAt: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, fields: import("./generic-transformers").RedisVariadicArgument, timestamp: number | Date, mode?: "NX" | "XX" | "GT" | "LT" | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").ArrayReply<import("./HEXPIRE").HashExpiration>;
    };
    HPEXPIRETIME: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, fields: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").ArrayReply<import("../RESP/types").NumberReply<number>>;
    };
    hpExpireTime: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, fields: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").ArrayReply<import("../RESP/types").NumberReply<number>>;
    };
    HPTTL: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, fields: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").ArrayReply<import("../RESP/types").NumberReply<number>>;
    };
    hpTTL: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, fields: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").ArrayReply<import("../RESP/types").NumberReply<number>>;
    };
    HRANDFIELD_COUNT_WITHVALUES: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, count: number) => void;
        readonly transformReply: {
            readonly 2: (rawReply: import("../RESP/types").BlobStringReply<string>[]) => import("./HRANDFIELD_COUNT_WITHVALUES").HRandFieldCountWithValuesReply;
            readonly 3: (reply: import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>]>[]) => {
                field: import("../RESP/types").BlobStringReply<string>;
                value: import("../RESP/types").BlobStringReply<string>;
            }[];
        };
    };
    hRandFieldCountWithValues: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, count: number) => void;
        readonly transformReply: {
            readonly 2: (rawReply: import("../RESP/types").BlobStringReply<string>[]) => import("./HRANDFIELD_COUNT_WITHVALUES").HRandFieldCountWithValuesReply;
            readonly 3: (reply: import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>]>[]) => {
                field: import("../RESP/types").BlobStringReply<string>;
                value: import("../RESP/types").BlobStringReply<string>;
            }[];
        };
    };
    HRANDFIELD_COUNT: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, count: number) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    hRandFieldCount: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, count: number) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    HRANDFIELD: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    hRandField: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    HSCAN: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, cursor: import("../RESP/types").RedisArgument, options?: import("./SCAN").ScanCommonOptions | undefined) => void;
        readonly transformReply: (this: void, [cursor, rawEntries]: [import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>[]]) => {
            cursor: import("../RESP/types").BlobStringReply<string>;
            entries: {
                field: import("../RESP/types").BlobStringReply<string>;
                value: import("../RESP/types").BlobStringReply<string>;
            }[];
        };
    };
    hScan: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, cursor: import("../RESP/types").RedisArgument, options?: import("./SCAN").ScanCommonOptions | undefined) => void;
        readonly transformReply: (this: void, [cursor, rawEntries]: [import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>[]]) => {
            cursor: import("../RESP/types").BlobStringReply<string>;
            entries: {
                field: import("../RESP/types").BlobStringReply<string>;
                value: import("../RESP/types").BlobStringReply<string>;
            }[];
        };
    };
    HSCAN_NOVALUES: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, cursor: import("../RESP/types").RedisArgument, options?: import("./SCAN").ScanCommonOptions | undefined) => void;
        readonly transformReply: (this: void, [cursor, fields]: [import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>[]]) => {
            cursor: import("../RESP/types").BlobStringReply<string>;
            fields: import("../RESP/types").BlobStringReply<string>[];
        };
    };
    hScanNoValues: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, cursor: import("../RESP/types").RedisArgument, options?: import("./SCAN").ScanCommonOptions | undefined) => void;
        readonly transformReply: (this: void, [cursor, fields]: [import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>[]]) => {
            cursor: import("../RESP/types").BlobStringReply<string>;
            fields: import("../RESP/types").BlobStringReply<string>[];
        };
    };
    HSET: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, ...[key, value, fieldValue]: [key: import("../RESP/types").RedisArgument, field: import("./HSET").HashTypes, value: import("./HSET").HashTypes] | [key: import("../RESP/types").RedisArgument, value: {
            [x: string]: import("./HSET").HashTypes;
            [x: number]: import("./HSET").HashTypes;
        } | Map<import("./HSET").HashTypes, import("./HSET").HashTypes> | ([import("./HSET").HashTypes, import("./HSET").HashTypes][] | import("./HSET").HashTypes[])]) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    hSet: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, ...[key, value, fieldValue]: [key: import("../RESP/types").RedisArgument, field: import("./HSET").HashTypes, value: import("./HSET").HashTypes] | [key: import("../RESP/types").RedisArgument, value: {
            [x: string]: import("./HSET").HashTypes;
            [x: number]: import("./HSET").HashTypes;
        } | Map<import("./HSET").HashTypes, import("./HSET").HashTypes> | ([import("./HSET").HashTypes, import("./HSET").HashTypes][] | import("./HSET").HashTypes[])]) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    HSETEX: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, fields: {
            [x: string]: import("./HSETEX").HashTypes;
            [x: number]: import("./HSETEX").HashTypes;
        } | Map<import("./HSETEX").HashTypes, import("./HSETEX").HashTypes> | ([import("./HSETEX").HashTypes, import("./HSETEX").HashTypes][] | import("./HSETEX").HashTypes[]), options?: import("./HSETEX").HSetExOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<0 | 1>;
    };
    hSetEx: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, fields: {
            [x: string]: import("./HSETEX").HashTypes;
            [x: number]: import("./HSETEX").HashTypes;
        } | Map<import("./HSETEX").HashTypes, import("./HSETEX").HashTypes> | ([import("./HSETEX").HashTypes, import("./HSETEX").HashTypes][] | import("./HSETEX").HashTypes[]), options?: import("./HSETEX").HSetExOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<0 | 1>;
    };
    HSETNX: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, field: import("../RESP/types").RedisArgument, value: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<0 | 1>;
    };
    hSetNX: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, field: import("../RESP/types").RedisArgument, value: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<0 | 1>;
    };
    HSTRLEN: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, field: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    hStrLen: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, field: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    HTTL: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, fields: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").ArrayReply<import("../RESP/types").NumberReply<number>>;
    };
    hTTL: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, fields: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").ArrayReply<import("../RESP/types").NumberReply<number>>;
    };
    HVALS: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    hVals: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    INCR: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    incr: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    INCRBY: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, increment: number) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    incrBy: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, increment: number) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    INCRBYFLOAT: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, increment: number) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    incrByFloat: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, increment: number) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    INFO: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, section?: import("../RESP/types").RedisArgument | undefined) => void;
        readonly transformReply: () => import("../RESP/types").VerbatimStringReply<string>;
    };
    info: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, section?: import("../RESP/types").RedisArgument | undefined) => void;
        readonly transformReply: () => import("../RESP/types").VerbatimStringReply<string>;
    };
    KEYS: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, pattern: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    keys: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, pattern: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    LASTSAVE: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    lastSave: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    LATENCY_DOCTOR: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    latencyDoctor: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    LATENCY_GRAPH: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, event: import("./LATENCY_GRAPH").LatencyEvent) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    latencyGraph: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, event: import("./LATENCY_GRAPH").LatencyEvent) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    LATENCY_HISTORY: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, event: import("./LATENCY_HISTORY").LatencyEventType) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").TuplesReply<[timestamp: import("../RESP/types").NumberReply<number>, latency: import("../RESP/types").NumberReply<number>]>>;
    };
    latencyHistory: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, event: import("./LATENCY_HISTORY").LatencyEventType) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").TuplesReply<[timestamp: import("../RESP/types").NumberReply<number>, latency: import("../RESP/types").NumberReply<number>]>>;
    };
    LATENCY_HISTOGRAM: {
        readonly CACHEABLE: false;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, ...commands: string[]) => void;
        readonly transformReply: {
            readonly 2: (reply: (string | [string, number, string, number[]])[]) => {
                [x: string]: {
                    calls: number;
                    histogram_usec: Record<string, number>;
                };
            };
            readonly 3: () => {
                [x: string]: {
                    calls: number;
                    histogram_usec: Record<string, number>;
                };
            };
        };
    };
    latencyHistogram: {
        readonly CACHEABLE: false;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, ...commands: string[]) => void;
        readonly transformReply: {
            readonly 2: (reply: (string | [string, number, string, number[]])[]) => {
                [x: string]: {
                    calls: number;
                    histogram_usec: Record<string, number>;
                };
            };
            readonly 3: () => {
                [x: string]: {
                    calls: number;
                    histogram_usec: Record<string, number>;
                };
            };
        };
    };
    LATENCY_LATEST: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<[name: import("../RESP/types").BlobStringReply<string>, timestamp: import("../RESP/types").NumberReply<number>, latestLatency: import("../RESP/types").NumberReply<number>, allTimeLatency: import("../RESP/types").NumberReply<number>]>;
    };
    latencyLatest: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<[name: import("../RESP/types").BlobStringReply<string>, timestamp: import("../RESP/types").NumberReply<number>, latestLatency: import("../RESP/types").NumberReply<number>, allTimeLatency: import("../RESP/types").NumberReply<number>]>;
    };
    LATENCY_RESET: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, ...events: import("./LATENCY_GRAPH").LatencyEvent[]) => void;
        readonly transformReply: () => number;
    };
    latencyReset: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, ...events: import("./LATENCY_GRAPH").LatencyEvent[]) => void;
        readonly transformReply: () => number;
    };
    LCS_IDX_WITHMATCHLEN: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key1: import("../RESP/types").RedisArgument, key2: import("../RESP/types").RedisArgument, options?: import("./LCS_IDX").LcsIdxOptions | undefined) => void;
        readonly transformReply: {
            readonly 2: (reply: [import("../RESP/types").BlobStringReply<"matches">, import("../RESP/types").RespType<42, import("../RESP/types").RespType<42, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").NumberReply<number>]>[], never, import("../RESP/types").RespType<42, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").NumberReply<number>]>[]>, import("../RESP/types").BlobStringReply<"len">, import("../RESP/types").NumberReply<number>]) => {
                matches: import("../RESP/types").RespType<42, import("../RESP/types").RespType<42, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").NumberReply<number>]>[], never, import("../RESP/types").RespType<42, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").NumberReply<number>]>[]>;
                len: import("../RESP/types").NumberReply<number>;
            };
            readonly 3: () => import("./LCS_IDX_WITHMATCHLEN").LcsIdxWithMatchLenReply;
        };
    };
    lcsIdxWithMatchLen: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key1: import("../RESP/types").RedisArgument, key2: import("../RESP/types").RedisArgument, options?: import("./LCS_IDX").LcsIdxOptions | undefined) => void;
        readonly transformReply: {
            readonly 2: (reply: [import("../RESP/types").BlobStringReply<"matches">, import("../RESP/types").RespType<42, import("../RESP/types").RespType<42, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").NumberReply<number>]>[], never, import("../RESP/types").RespType<42, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").NumberReply<number>]>[]>, import("../RESP/types").BlobStringReply<"len">, import("../RESP/types").NumberReply<number>]) => {
                matches: import("../RESP/types").RespType<42, import("../RESP/types").RespType<42, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").NumberReply<number>]>[], never, import("../RESP/types").RespType<42, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").NumberReply<number>]>[]>;
                len: import("../RESP/types").NumberReply<number>;
            };
            readonly 3: () => import("./LCS_IDX_WITHMATCHLEN").LcsIdxWithMatchLenReply;
        };
    };
    LCS_IDX: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key1: import("../RESP/types").RedisArgument, key2: import("../RESP/types").RedisArgument, options?: import("./LCS_IDX").LcsIdxOptions | undefined) => void;
        readonly transformReply: {
            readonly 2: (reply: [import("../RESP/types").BlobStringReply<"matches">, import("../RESP/types").RespType<42, import("../RESP/types").RespType<42, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>], never, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>]>[], never, import("../RESP/types").RespType<42, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>], never, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>]>[]>, import("../RESP/types").BlobStringReply<"len">, import("../RESP/types").NumberReply<number>]) => {
                matches: import("../RESP/types").RespType<42, import("../RESP/types").RespType<42, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>], never, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>]>[], never, import("../RESP/types").RespType<42, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>], never, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>]>[]>;
                len: import("../RESP/types").NumberReply<number>;
            };
            readonly 3: () => import("./LCS_IDX").LcsIdxReply;
        };
    };
    lcsIdx: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key1: import("../RESP/types").RedisArgument, key2: import("../RESP/types").RedisArgument, options?: import("./LCS_IDX").LcsIdxOptions | undefined) => void;
        readonly transformReply: {
            readonly 2: (reply: [import("../RESP/types").BlobStringReply<"matches">, import("../RESP/types").RespType<42, import("../RESP/types").RespType<42, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>], never, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>]>[], never, import("../RESP/types").RespType<42, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>], never, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>]>[]>, import("../RESP/types").BlobStringReply<"len">, import("../RESP/types").NumberReply<number>]) => {
                matches: import("../RESP/types").RespType<42, import("../RESP/types").RespType<42, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>], never, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>]>[], never, import("../RESP/types").RespType<42, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>], never, [import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>, import("../RESP/types").RespType<42, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").NumberReply<number>, import("../RESP/types").NumberReply<number>]>]>[]>;
                len: import("../RESP/types").NumberReply<number>;
            };
            readonly 3: () => import("./LCS_IDX").LcsIdxReply;
        };
    };
    LCS_LEN: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key1: import("../RESP/types").RedisArgument, key2: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    lcsLen: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key1: import("../RESP/types").RedisArgument, key2: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    LCS: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key1: import("../RESP/types").RedisArgument, key2: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    lcs: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key1: import("../RESP/types").RedisArgument, key2: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    LINDEX: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, index: number) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    lIndex: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, index: number) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    LINSERT: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, position: "BEFORE" | "AFTER", pivot: import("../RESP/types").RedisArgument, element: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    lInsert: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, position: "BEFORE" | "AFTER", pivot: import("../RESP/types").RedisArgument, element: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    LLEN: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    lLen: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    LMOVE: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, source: import("../RESP/types").RedisArgument, destination: import("../RESP/types").RedisArgument, sourceSide: import("./generic-transformers").ListSide, destinationSide: import("./generic-transformers").ListSide) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    lMove: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, source: import("../RESP/types").RedisArgument, destination: import("../RESP/types").RedisArgument, sourceSide: import("./generic-transformers").ListSide, destinationSide: import("./generic-transformers").ListSide) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    LMPOP: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").RedisVariadicArgument, side: import("./generic-transformers").ListSide, options?: import("./LMPOP").LMPopOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").TuplesReply<[key: import("../RESP/types").BlobStringReply<string>, elements: import("../RESP/types").BlobStringReply<string>[]]>;
    };
    lmPop: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").RedisVariadicArgument, side: import("./generic-transformers").ListSide, options?: import("./LMPOP").LMPopOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").TuplesReply<[key: import("../RESP/types").BlobStringReply<string>, elements: import("../RESP/types").BlobStringReply<string>[]]>;
    };
    LOLWUT: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, version?: number | undefined, ...optionalArguments: number[]) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    LPOP_COUNT: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, count: number) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    lPopCount: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, count: number) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    LPOP: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    lPop: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    LPOS_COUNT: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, element: import("../RESP/types").RedisArgument, count: number, options?: import("./LPOS").LPosOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").NumberReply<number>>;
    };
    lPosCount: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, element: import("../RESP/types").RedisArgument, count: number, options?: import("./LPOS").LPosOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").NumberReply<number>>;
    };
    LPOS: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, element: import("../RESP/types").RedisArgument, options?: import("./LPOS").LPosOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").NumberReply<number>;
    };
    lPos: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, element: import("../RESP/types").RedisArgument, options?: import("./LPOS").LPosOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").NumberReply<number>;
    };
    LPUSH: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, elements: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    lPush: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, elements: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    LPUSHX: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, elements: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    lPushX: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, elements: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    LRANGE: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, start: number, stop: number) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    lRange: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, start: number, stop: number) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    LREM: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, count: number, element: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    lRem: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, count: number, element: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    LSET: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, index: number, element: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    lSet: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, index: number, element: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    LTRIM: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, start: number, stop: number) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    lTrim: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, start: number, stop: number) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    MEMORY_DOCTOR: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    memoryDoctor: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    'MEMORY_MALLOC-STATS': {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    memoryMallocStats: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    MEMORY_PURGE: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    memoryPurge: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    MEMORY_STATS: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: {
            readonly 2: (rawReply: (import("../RESP/types").BlobStringReply<string> | import("../RESP/types").NumberReply<number>)[], preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => import("./MEMORY_STATS").MemoryStatsReply;
            readonly 3: () => import("./MEMORY_STATS").MemoryStatsReply;
        };
    };
    memoryStats: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: {
            readonly 2: (rawReply: (import("../RESP/types").BlobStringReply<string> | import("../RESP/types").NumberReply<number>)[], preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => import("./MEMORY_STATS").MemoryStatsReply;
            readonly 3: () => import("./MEMORY_STATS").MemoryStatsReply;
        };
    };
    MEMORY_USAGE: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, options?: import("./MEMORY_USAGE").MemoryUsageOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").NumberReply<number>;
    };
    memoryUsage: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, options?: import("./MEMORY_USAGE").MemoryUsageOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").NumberReply<number>;
    };
    MGET: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("../RESP/types").RedisArgument[]) => void;
        readonly transformReply: () => (import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>)[];
    };
    mGet: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("../RESP/types").RedisArgument[]) => void;
        readonly transformReply: () => (import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>)[];
    };
    MIGRATE: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, host: import("../RESP/types").RedisArgument, port: number, key: import("../RESP/types").RedisArgument | import("../RESP/types").RedisArgument[], destinationDb: number, timeout: number, options?: import("./MIGRATE").MigrateOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    migrate: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, host: import("../RESP/types").RedisArgument, port: number, key: import("../RESP/types").RedisArgument | import("../RESP/types").RedisArgument[], destinationDb: number, timeout: number, options?: import("./MIGRATE").MigrateOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    MODULE_LIST: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: {
            readonly 2: (reply: import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"ver">, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"ver">, import("../RESP/types").NumberReply<number>]>[]) => {
                name: import("../RESP/types").BlobStringReply<string>;
                ver: import("../RESP/types").NumberReply<number>;
            }[];
            readonly 3: () => import("./MODULE_LIST").ModuleListReply;
        };
    };
    moduleList: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: {
            readonly 2: (reply: import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"ver">, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"ver">, import("../RESP/types").NumberReply<number>]>[]) => {
                name: import("../RESP/types").BlobStringReply<string>;
                ver: import("../RESP/types").NumberReply<number>;
            }[];
            readonly 3: () => import("./MODULE_LIST").ModuleListReply;
        };
    };
    MODULE_LOAD: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, path: import("../RESP/types").RedisArgument, moduleArguments?: import("../RESP/types").RedisArgument[] | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    moduleLoad: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, path: import("../RESP/types").RedisArgument, moduleArguments?: import("../RESP/types").RedisArgument[] | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    MODULE_UNLOAD: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, name: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    moduleUnload: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, name: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    MOVE: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, db: number) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    move: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, db: number) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    MSET: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, toSet: import("./MSET").MSetArguments) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    mSet: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, toSet: import("./MSET").MSetArguments) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    MSETEX: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keyValuePairs: import("./MSET").MSetArguments, options?: {
            expiration?: ({
                type: "EX";
                value: number;
            } | {
                type: "PX";
                value: number;
            } | {
                type: "EXAT";
                value: number | Date;
            } | {
                type: "PXAT";
                value: number | Date;
            } | {
                type: "KEEPTTL";
            }) | undefined;
            mode?: ("NX" | "XX") | undefined;
        } | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<0 | 1>;
    };
    mSetEx: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keyValuePairs: import("./MSET").MSetArguments, options?: {
            expiration?: ({
                type: "EX";
                value: number;
            } | {
                type: "PX";
                value: number;
            } | {
                type: "EXAT";
                value: number | Date;
            } | {
                type: "PXAT";
                value: number | Date;
            } | {
                type: "KEEPTTL";
            }) | undefined;
            mode?: ("NX" | "XX") | undefined;
        } | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<0 | 1>;
    };
    MSETNX: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, toSet: import("./MSET").MSetArguments) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    mSetNX: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, toSet: import("./MSET").MSetArguments) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    OBJECT_ENCODING: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    objectEncoding: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    OBJECT_FREQ: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").NumberReply<number>;
    };
    objectFreq: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").NumberReply<number>;
    };
    OBJECT_IDLETIME: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").NumberReply<number>;
    };
    objectIdleTime: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").NumberReply<number>;
    };
    OBJECT_REFCOUNT: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").NumberReply<number>;
    };
    objectRefCount: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").NumberReply<number>;
    };
    PERSIST: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    persist: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    PEXPIRE: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, ms: number, mode?: "NX" | "XX" | "GT" | "LT" | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    pExpire: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, ms: number, mode?: "NX" | "XX" | "GT" | "LT" | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    PEXPIREAT: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, msTimestamp: number | Date, mode?: "NX" | "XX" | "GT" | "LT" | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    pExpireAt: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, msTimestamp: number | Date, mode?: "NX" | "XX" | "GT" | "LT" | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    PEXPIRETIME: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    pExpireTime: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    PFADD: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, element?: import("./generic-transformers").RedisVariadicArgument | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    pfAdd: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, element?: import("./generic-transformers").RedisVariadicArgument | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    PFCOUNT: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    pfCount: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    PFMERGE: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, destination: import("../RESP/types").RedisArgument, sources?: import("./generic-transformers").RedisVariadicArgument | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    pfMerge: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, destination: import("../RESP/types").RedisArgument, sources?: import("./generic-transformers").RedisVariadicArgument | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    PING: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, message?: import("../RESP/types").RedisArgument | undefined) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string> | import("../RESP/types").SimpleStringReply<string>;
    };
    ping: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, message?: import("../RESP/types").RedisArgument | undefined) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string> | import("../RESP/types").SimpleStringReply<string>;
    };
    PSETEX: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, ms: number, value: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    pSetEx: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, ms: number, value: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    PTTL: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    pTTL: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    PUBLISH: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly IS_FORWARD_COMMAND: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, channel: import("../RESP/types").RedisArgument, message: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    publish: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly IS_FORWARD_COMMAND: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, channel: import("../RESP/types").RedisArgument, message: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    PUBSUB_CHANNELS: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, pattern?: import("../RESP/types").RedisArgument | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    pubSubChannels: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, pattern?: import("../RESP/types").RedisArgument | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    PUBSUB_NUMPAT: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    pubSubNumPat: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    PUBSUB_NUMSUB: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, channels?: import("./generic-transformers").RedisVariadicArgument | undefined) => void;
        readonly transformReply: (this: void, rawReply: (import("../RESP/types").BlobStringReply<string> | import("../RESP/types").NumberReply<number>)[]) => Record<string, import("../RESP/types").NumberReply<number>>;
    };
    pubSubNumSub: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, channels?: import("./generic-transformers").RedisVariadicArgument | undefined) => void;
        readonly transformReply: (this: void, rawReply: (import("../RESP/types").BlobStringReply<string> | import("../RESP/types").NumberReply<number>)[]) => Record<string, import("../RESP/types").NumberReply<number>>;
    };
    PUBSUB_SHARDNUMSUB: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, channels?: import("./generic-transformers").RedisVariadicArgument | undefined) => void;
        readonly transformReply: (this: void, reply: (import("../RESP/types").BlobStringReply<string> | import("../RESP/types").NumberReply<number>)[]) => Record<string, import("../RESP/types").NumberReply<number>>;
    };
    pubSubShardNumSub: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, channels?: import("./generic-transformers").RedisVariadicArgument | undefined) => void;
        readonly transformReply: (this: void, reply: (import("../RESP/types").BlobStringReply<string> | import("../RESP/types").NumberReply<number>)[]) => Record<string, import("../RESP/types").NumberReply<number>>;
    };
    PUBSUB_SHARDCHANNELS: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, pattern?: import("../RESP/types").RedisArgument | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    pubSubShardChannels: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, pattern?: import("../RESP/types").RedisArgument | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    RANDOMKEY: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    randomKey: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    READONLY: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    readonly: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    RENAME: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, newKey: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    rename: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, newKey: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    RENAMENX: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, newKey: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    renameNX: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, newKey: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    REPLICAOF: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, host: string, port: number) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    replicaOf: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, host: string, port: number) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    'RESTORE-ASKING': {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    restoreAsking: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    RESTORE: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, ttl: number, serializedValue: import("../RESP/types").RedisArgument, options?: import("./RESTORE").RestoreOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    restore: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, ttl: number, serializedValue: import("../RESP/types").RedisArgument, options?: import("./RESTORE").RestoreOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    RPOP_COUNT: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, count: number) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    rPopCount: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, count: number) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    ROLE: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: (this: void, reply: import("../RESP/types").UnwrapReply<import("../RESP/types").TuplesReply<[role: import("../RESP/types").BlobStringReply<"master">, replicationOffest: import("../RESP/types").NumberReply<number>, replicas: import("../RESP/types").ArrayReply<import("../RESP/types").TuplesReply<[host: import("../RESP/types").BlobStringReply<string>, port: import("../RESP/types").BlobStringReply<string>, replicationOffest: import("../RESP/types").BlobStringReply<string>]>>] | [role: import("../RESP/types").BlobStringReply<"slave">, masterHost: import("../RESP/types").BlobStringReply<string>, masterPort: import("../RESP/types").NumberReply<number>, state: import("../RESP/types").BlobStringReply<"connect" | "connecting" | "sync" | "connected">, dataReceived: import("../RESP/types").NumberReply<number>] | [role: import("../RESP/types").BlobStringReply<"sentinel">, masterNames: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>]>>) => {
            role: import("../RESP/types").BlobStringReply<"master">;
            replicationOffest: import("../RESP/types").NumberReply<number>;
            replicas: {
                host: import("../RESP/types").BlobStringReply<string>;
                port: number;
                replicationOffest: number;
            }[];
            master?: undefined;
            state?: undefined;
            dataReceived?: undefined;
            masterNames?: undefined;
        } | {
            role: import("../RESP/types").BlobStringReply<"slave">;
            master: {
                host: import("../RESP/types").BlobStringReply<string>;
                port: import("../RESP/types").NumberReply<number>;
            };
            state: import("../RESP/types").BlobStringReply<"connect" | "connecting" | "sync" | "connected">;
            dataReceived: import("../RESP/types").NumberReply<number>;
            replicationOffest?: undefined;
            replicas?: undefined;
            masterNames?: undefined;
        } | {
            role: import("../RESP/types").BlobStringReply<"sentinel">;
            masterNames: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
            replicationOffest?: undefined;
            replicas?: undefined;
            master?: undefined;
            state?: undefined;
            dataReceived?: undefined;
        } | undefined;
    };
    role: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: (this: void, reply: import("../RESP/types").UnwrapReply<import("../RESP/types").TuplesReply<[role: import("../RESP/types").BlobStringReply<"master">, replicationOffest: import("../RESP/types").NumberReply<number>, replicas: import("../RESP/types").ArrayReply<import("../RESP/types").TuplesReply<[host: import("../RESP/types").BlobStringReply<string>, port: import("../RESP/types").BlobStringReply<string>, replicationOffest: import("../RESP/types").BlobStringReply<string>]>>] | [role: import("../RESP/types").BlobStringReply<"slave">, masterHost: import("../RESP/types").BlobStringReply<string>, masterPort: import("../RESP/types").NumberReply<number>, state: import("../RESP/types").BlobStringReply<"connect" | "connecting" | "sync" | "connected">, dataReceived: import("../RESP/types").NumberReply<number>] | [role: import("../RESP/types").BlobStringReply<"sentinel">, masterNames: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>]>>) => {
            role: import("../RESP/types").BlobStringReply<"master">;
            replicationOffest: import("../RESP/types").NumberReply<number>;
            replicas: {
                host: import("../RESP/types").BlobStringReply<string>;
                port: number;
                replicationOffest: number;
            }[];
            master?: undefined;
            state?: undefined;
            dataReceived?: undefined;
            masterNames?: undefined;
        } | {
            role: import("../RESP/types").BlobStringReply<"slave">;
            master: {
                host: import("../RESP/types").BlobStringReply<string>;
                port: import("../RESP/types").NumberReply<number>;
            };
            state: import("../RESP/types").BlobStringReply<"connect" | "connecting" | "sync" | "connected">;
            dataReceived: import("../RESP/types").NumberReply<number>;
            replicationOffest?: undefined;
            replicas?: undefined;
            masterNames?: undefined;
        } | {
            role: import("../RESP/types").BlobStringReply<"sentinel">;
            masterNames: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
            replicationOffest?: undefined;
            replicas?: undefined;
            master?: undefined;
            state?: undefined;
            dataReceived?: undefined;
        } | undefined;
    };
    RPOP: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    rPop: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    RPOPLPUSH: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, source: import("../RESP/types").RedisArgument, destination: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    rPopLPush: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, source: import("../RESP/types").RedisArgument, destination: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    RPUSH: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, element: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    rPush: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, element: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    RPUSHX: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, element: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    rPushX: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, element: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    SADD: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, members: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    sAdd: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, members: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    SCAN: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, cursor: import("../RESP/types").RedisArgument, options?: import("./SCAN").ScanOptions | undefined) => void;
        readonly transformReply: (this: void, [cursor, keys]: [import("../RESP/types").BlobStringReply<string>, import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>]) => {
            cursor: import("../RESP/types").BlobStringReply<string>;
            keys: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
        };
    };
    scan: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, cursor: import("../RESP/types").RedisArgument, options?: import("./SCAN").ScanOptions | undefined) => void;
        readonly transformReply: (this: void, [cursor, keys]: [import("../RESP/types").BlobStringReply<string>, import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>]) => {
            cursor: import("../RESP/types").BlobStringReply<string>;
            keys: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
        };
    };
    SCARD: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    sCard: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    SCRIPT_DEBUG: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, mode: "YES" | "NO" | "SYNC") => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    scriptDebug: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, mode: "YES" | "NO" | "SYNC") => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    SCRIPT_EXISTS: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, sha1: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").NumberReply<number>>;
    };
    scriptExists: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, sha1: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").NumberReply<number>>;
    };
    SCRIPT_FLUSH: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, mode?: "ASYNC" | "SYNC" | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    scriptFlush: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, mode?: "ASYNC" | "SYNC" | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    SCRIPT_KILL: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    scriptKill: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    SCRIPT_LOAD: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, script: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    scriptLoad: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, script: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    SDIFF: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    sDiff: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    SDIFFSTORE: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, destination: import("../RESP/types").RedisArgument, keys: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    sDiffStore: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, destination: import("../RESP/types").RedisArgument, keys: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    SET: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, value: number | import("../RESP/types").RedisArgument, options?: import("./SET").SetOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string> | import("../RESP/types").SimpleStringReply<"OK">;
    };
    set: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, value: number | import("../RESP/types").RedisArgument, options?: import("./SET").SetOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string> | import("../RESP/types").SimpleStringReply<"OK">;
    };
    SETBIT: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, offset: number, value: import("./generic-transformers").BitValue) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<import("./generic-transformers").BitValue>;
    };
    setBit: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, offset: number, value: import("./generic-transformers").BitValue) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<import("./generic-transformers").BitValue>;
    };
    SETEX: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, seconds: number, value: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    setEx: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, seconds: number, value: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    SETNX: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, value: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    setNX: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, value: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    SETRANGE: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, offset: number, value: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    setRange: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, offset: number, value: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    SINTER: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    sInter: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    SINTERCARD: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").RedisVariadicArgument, options?: number | import("./SINTERCARD").SInterCardOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    sInterCard: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").RedisVariadicArgument, options?: number | import("./SINTERCARD").SInterCardOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    SINTERSTORE: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, destination: import("../RESP/types").RedisArgument, keys: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    sInterStore: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, destination: import("../RESP/types").RedisArgument, keys: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    SISMEMBER: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, member: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    sIsMember: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, member: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    SMEMBERS: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: {
            readonly 2: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
            readonly 3: () => import("../RESP/types").SetReply<import("../RESP/types").BlobStringReply<string>>;
        };
    };
    sMembers: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: {
            readonly 2: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
            readonly 3: () => import("../RESP/types").SetReply<import("../RESP/types").BlobStringReply<string>>;
        };
    };
    SMISMEMBER: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, members: import("../RESP/types").RedisArgument[]) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").NumberReply<number>>;
    };
    smIsMember: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, members: import("../RESP/types").RedisArgument[]) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").NumberReply<number>>;
    };
    SMOVE: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, source: import("../RESP/types").RedisArgument, destination: import("../RESP/types").RedisArgument, member: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    sMove: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, source: import("../RESP/types").RedisArgument, destination: import("../RESP/types").RedisArgument, member: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    SORT_RO: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, options?: import("./SORT").SortOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    sortRo: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, options?: import("./SORT").SortOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    SORT_STORE: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, source: import("../RESP/types").RedisArgument, destination: import("../RESP/types").RedisArgument, options?: import("./SORT").SortOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    sortStore: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, source: import("../RESP/types").RedisArgument, destination: import("../RESP/types").RedisArgument, options?: import("./SORT").SortOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    SORT: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, options?: import("./SORT").SortOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    sort: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, options?: import("./SORT").SortOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    SPOP_COUNT: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, count: number) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<string>;
    };
    sPopCount: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, count: number) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<string>;
    };
    SPOP: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    sPop: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    SPUBLISH: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, channel: import("../RESP/types").RedisArgument, message: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    sPublish: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, channel: import("../RESP/types").RedisArgument, message: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    SRANDMEMBER_COUNT: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, count: number) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    sRandMemberCount: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, count: number) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    SRANDMEMBER: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    sRandMember: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    SREM: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, members: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    sRem: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, members: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    SSCAN: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, cursor: import("../RESP/types").RedisArgument, options?: import("./SCAN").ScanCommonOptions | undefined) => void;
        readonly transformReply: (this: void, [cursor, members]: [import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>[]]) => {
            cursor: import("../RESP/types").BlobStringReply<string>;
            members: import("../RESP/types").BlobStringReply<string>[];
        };
    };
    sScan: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, cursor: import("../RESP/types").RedisArgument, options?: import("./SCAN").ScanCommonOptions | undefined) => void;
        readonly transformReply: (this: void, [cursor, members]: [import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>[]]) => {
            cursor: import("../RESP/types").BlobStringReply<string>;
            members: import("../RESP/types").BlobStringReply<string>[];
        };
    };
    STRLEN: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    strLen: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    SUNION: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    sUnion: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    SUNIONSTORE: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, destination: import("../RESP/types").RedisArgument, keys: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    sUnionStore: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, destination: import("../RESP/types").RedisArgument, keys: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    SWAPDB: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, index1: number, index2: number) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    swapDb: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, index1: number, index2: number) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    TIME: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => [unixTimestamp: import("../RESP/types").BlobStringReply<`${number}`>, microseconds: import("../RESP/types").BlobStringReply<`${number}`>];
    };
    time: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser) => void;
        readonly transformReply: () => [unixTimestamp: import("../RESP/types").BlobStringReply<`${number}`>, microseconds: import("../RESP/types").BlobStringReply<`${number}`>];
    };
    TOUCH: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    touch: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    TTL: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    ttl: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    TYPE: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    type: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<string>;
    };
    UNLINK: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    unlink: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    WAIT: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, numberOfReplicas: number, timeout: number) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    wait: {
        readonly NOT_KEYED_COMMAND: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, numberOfReplicas: number, timeout: number) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    XACK: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, group: import("../RESP/types").RedisArgument, id: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    xAck: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, group: import("../RESP/types").RedisArgument, id: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    XACKDEL: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, group: import("../RESP/types").RedisArgument, id: import("./generic-transformers").RedisVariadicArgument, policy?: import("./common-stream.types").StreamDeletionPolicy | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("./common-stream.types").StreamDeletionReplyCode>;
    };
    xAckDel: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, group: import("../RESP/types").RedisArgument, id: import("./generic-transformers").RedisVariadicArgument, policy?: import("./common-stream.types").StreamDeletionPolicy | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("./common-stream.types").StreamDeletionReplyCode>;
    };
    XADD_NOMKSTREAM: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, id: import("../RESP/types").RedisArgument, message: Record<string, import("../RESP/types").RedisArgument>, options?: import("./XADD").XAddOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    xAddNoMkStream: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, id: import("../RESP/types").RedisArgument, message: Record<string, import("../RESP/types").RedisArgument>, options?: import("./XADD").XAddOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    XADD: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, id: import("../RESP/types").RedisArgument, message: Record<string, import("../RESP/types").RedisArgument>, options?: import("./XADD").XAddOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    xAdd: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, id: import("../RESP/types").RedisArgument, message: Record<string, import("../RESP/types").RedisArgument>, options?: import("./XADD").XAddOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").BlobStringReply<string>;
    };
    XAUTOCLAIM_JUSTID: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, group: import("../RESP/types").RedisArgument, consumer: import("../RESP/types").RedisArgument, minIdleTime: number, start: import("../RESP/types").RedisArgument, options?: import("./XAUTOCLAIM").XAutoClaimOptions | undefined) => void;
        readonly transformReply: (this: void, reply: [nextId: import("../RESP/types").BlobStringReply<string>, messages: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>, deletedMessages: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>]) => {
            nextId: import("../RESP/types").BlobStringReply<string>;
            messages: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
            deletedMessages: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
        };
    };
    xAutoClaimJustId: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, group: import("../RESP/types").RedisArgument, consumer: import("../RESP/types").RedisArgument, minIdleTime: number, start: import("../RESP/types").RedisArgument, options?: import("./XAUTOCLAIM").XAutoClaimOptions | undefined) => void;
        readonly transformReply: (this: void, reply: [nextId: import("../RESP/types").BlobStringReply<string>, messages: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>, deletedMessages: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>]) => {
            nextId: import("../RESP/types").BlobStringReply<string>;
            messages: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
            deletedMessages: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
        };
    };
    XAUTOCLAIM: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, group: import("../RESP/types").RedisArgument, consumer: import("../RESP/types").RedisArgument, minIdleTime: number, start: import("../RESP/types").RedisArgument, options?: import("./XAUTOCLAIM").XAutoClaimOptions | undefined) => void;
        readonly transformReply: (this: void, reply: [nextId: import("../RESP/types").BlobStringReply<string>, messages: import("../RESP/types").ArrayReply<import("../RESP/types").NullReply | import("./generic-transformers").StreamMessageRawReply>, deletedMessages: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>], preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
            nextId: import("../RESP/types").BlobStringReply<string>;
            messages: (import("../RESP/types").NullReply | import("./generic-transformers").StreamMessageReply)[];
            deletedMessages: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
        };
    };
    xAutoClaim: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, group: import("../RESP/types").RedisArgument, consumer: import("../RESP/types").RedisArgument, minIdleTime: number, start: import("../RESP/types").RedisArgument, options?: import("./XAUTOCLAIM").XAutoClaimOptions | undefined) => void;
        readonly transformReply: (this: void, reply: [nextId: import("../RESP/types").BlobStringReply<string>, messages: import("../RESP/types").ArrayReply<import("../RESP/types").NullReply | import("./generic-transformers").StreamMessageRawReply>, deletedMessages: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>], preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
            nextId: import("../RESP/types").BlobStringReply<string>;
            messages: (import("../RESP/types").NullReply | import("./generic-transformers").StreamMessageReply)[];
            deletedMessages: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
        };
    };
    XCLAIM_JUSTID: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, group: import("../RESP/types").RedisArgument, consumer: import("../RESP/types").RedisArgument, minIdleTime: number, id: import("./generic-transformers").RedisVariadicArgument, options?: import("./XCLAIM").XClaimOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    xClaimJustId: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, group: import("../RESP/types").RedisArgument, consumer: import("../RESP/types").RedisArgument, minIdleTime: number, id: import("./generic-transformers").RedisVariadicArgument, options?: import("./XCLAIM").XClaimOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    XCLAIM: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, group: import("../RESP/types").RedisArgument, consumer: import("../RESP/types").RedisArgument, minIdleTime: number, id: import("./generic-transformers").RedisVariadicArgument, options?: import("./XCLAIM").XClaimOptions | undefined) => void;
        readonly transformReply: (this: void, reply: (import("../RESP/types").NullReply | import("./generic-transformers").StreamMessageRawReply)[], preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => (import("../RESP/types").NullReply | import("./generic-transformers").StreamMessageReply)[];
    };
    xClaim: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, group: import("../RESP/types").RedisArgument, consumer: import("../RESP/types").RedisArgument, minIdleTime: number, id: import("./generic-transformers").RedisVariadicArgument, options?: import("./XCLAIM").XClaimOptions | undefined) => void;
        readonly transformReply: (this: void, reply: (import("../RESP/types").NullReply | import("./generic-transformers").StreamMessageRawReply)[], preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => (import("../RESP/types").NullReply | import("./generic-transformers").StreamMessageReply)[];
    };
    XCFGSET: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, options?: import("./XCFGSET").XCfgSetOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    xCfgSet: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, options?: import("./XCFGSET").XCfgSetOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    XDEL: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, id: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    xDel: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, id: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    XDELEX: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, id: import("./generic-transformers").RedisVariadicArgument, policy?: import("./common-stream.types").StreamDeletionPolicy | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("./common-stream.types").StreamDeletionReplyCode>;
    };
    xDelEx: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, id: import("./generic-transformers").RedisVariadicArgument, policy?: import("./common-stream.types").StreamDeletionPolicy | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("./common-stream.types").StreamDeletionReplyCode>;
    };
    XGROUP_CREATE: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, group: import("../RESP/types").RedisArgument, id: import("../RESP/types").RedisArgument, options?: import("./XGROUP_CREATE").XGroupCreateOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    xGroupCreate: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, group: import("../RESP/types").RedisArgument, id: import("../RESP/types").RedisArgument, options?: import("./XGROUP_CREATE").XGroupCreateOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    XGROUP_CREATECONSUMER: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, group: import("../RESP/types").RedisArgument, consumer: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    xGroupCreateConsumer: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, group: import("../RESP/types").RedisArgument, consumer: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    XGROUP_DELCONSUMER: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, group: import("../RESP/types").RedisArgument, consumer: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    xGroupDelConsumer: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, group: import("../RESP/types").RedisArgument, consumer: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    XGROUP_DESTROY: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, group: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    xGroupDestroy: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, group: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    XGROUP_SETID: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, group: import("../RESP/types").RedisArgument, id: import("../RESP/types").RedisArgument, options?: import("./XGROUP_SETID").XGroupSetIdOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    xGroupSetId: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, group: import("../RESP/types").RedisArgument, id: import("../RESP/types").RedisArgument, options?: import("./XGROUP_SETID").XGroupSetIdOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    XINFO_CONSUMERS: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, group: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: {
            readonly 2: (reply: import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"pending">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"idle">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"inactive">, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"pending">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"idle">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"inactive">, import("../RESP/types").NumberReply<number>]>[]) => {
                name: import("../RESP/types").BlobStringReply<string>;
                pending: import("../RESP/types").NumberReply<number>;
                idle: import("../RESP/types").NumberReply<number>;
                inactive: import("../RESP/types").NumberReply<number>;
            }[];
            readonly 3: () => import("./XINFO_CONSUMERS").XInfoConsumersReply;
        };
    };
    xInfoConsumers: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, group: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: {
            readonly 2: (reply: import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"pending">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"idle">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"inactive">, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"pending">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"idle">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"inactive">, import("../RESP/types").NumberReply<number>]>[]) => {
                name: import("../RESP/types").BlobStringReply<string>;
                pending: import("../RESP/types").NumberReply<number>;
                idle: import("../RESP/types").NumberReply<number>;
                inactive: import("../RESP/types").NumberReply<number>;
            }[];
            readonly 3: () => import("./XINFO_CONSUMERS").XInfoConsumersReply;
        };
    };
    XINFO_GROUPS: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: {
            readonly 2: (reply: import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"consumers">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"pending">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"last-delivered-id">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"entries-read">, import("../RESP/types").NullReply | import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"lag">, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"consumers">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"pending">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"last-delivered-id">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"entries-read">, import("../RESP/types").NullReply | import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"lag">, import("../RESP/types").NumberReply<number>]>[]) => {
                name: import("../RESP/types").BlobStringReply<string>;
                consumers: import("../RESP/types").NumberReply<number>;
                pending: import("../RESP/types").NumberReply<number>;
                'last-delivered-id': import("../RESP/types").NumberReply<number>;
                'entries-read': import("../RESP/types").NullReply | import("../RESP/types").NumberReply<number>;
                lag: import("../RESP/types").NumberReply<number>;
            }[];
            readonly 3: () => import("./XINFO_GROUPS").XInfoGroupsReply;
        };
    };
    xInfoGroups: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: {
            readonly 2: (reply: import("../RESP/types").RespType<42, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"consumers">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"pending">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"last-delivered-id">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"entries-read">, import("../RESP/types").NullReply | import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"lag">, import("../RESP/types").NumberReply<number>], never, [import("../RESP/types").BlobStringReply<"name">, import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<"consumers">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"pending">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"last-delivered-id">, import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"entries-read">, import("../RESP/types").NullReply | import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<"lag">, import("../RESP/types").NumberReply<number>]>[]) => {
                name: import("../RESP/types").BlobStringReply<string>;
                consumers: import("../RESP/types").NumberReply<number>;
                pending: import("../RESP/types").NumberReply<number>;
                'last-delivered-id': import("../RESP/types").NumberReply<number>;
                'entries-read': import("../RESP/types").NullReply | import("../RESP/types").NumberReply<number>;
                lag: import("../RESP/types").NumberReply<number>;
            }[];
            readonly 3: () => import("./XINFO_GROUPS").XInfoGroupsReply;
        };
    };
    XINFO_STREAM: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: {
            readonly 2: (this: void, reply: any) => {
                length: import("../RESP/types").NumberReply<number>;
                "radix-tree-keys": import("../RESP/types").NumberReply<number>;
                "radix-tree-nodes": import("../RESP/types").NumberReply<number>;
                "last-generated-id": import("../RESP/types").BlobStringReply<string>;
                "max-deleted-entry-id": import("../RESP/types").BlobStringReply<string>;
                "entries-added": import("../RESP/types").NumberReply<number>;
                "recorded-first-entry-id": import("../RESP/types").BlobStringReply<string>;
                "idmp-duration": import("../RESP/types").NumberReply<number>;
                "idmp-maxsize": import("../RESP/types").NumberReply<number>;
                "pids-tracked": import("../RESP/types").NumberReply<number>;
                "iids-tracked": import("../RESP/types").NumberReply<number>;
                "iids-added": import("../RESP/types").NumberReply<number>;
                "iids-duplicates": import("../RESP/types").NumberReply<number>;
                groups: import("../RESP/types").NumberReply<number>;
                "first-entry": import("../RESP/types").NullReply | {
                    id: import("../RESP/types").BlobStringReply<string>;
                    message: import("../RESP/types").MapReply<import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>>;
                };
                "last-entry": import("../RESP/types").NullReply | {
                    id: import("../RESP/types").BlobStringReply<string>;
                    message: import("../RESP/types").MapReply<import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>>;
                };
            };
            readonly 3: (this: void, reply: any) => import("./XINFO_STREAM").XInfoStreamReply;
        };
    };
    xInfoStream: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: {
            readonly 2: (this: void, reply: any) => {
                length: import("../RESP/types").NumberReply<number>;
                "radix-tree-keys": import("../RESP/types").NumberReply<number>;
                "radix-tree-nodes": import("../RESP/types").NumberReply<number>;
                "last-generated-id": import("../RESP/types").BlobStringReply<string>;
                "max-deleted-entry-id": import("../RESP/types").BlobStringReply<string>;
                "entries-added": import("../RESP/types").NumberReply<number>;
                "recorded-first-entry-id": import("../RESP/types").BlobStringReply<string>;
                "idmp-duration": import("../RESP/types").NumberReply<number>;
                "idmp-maxsize": import("../RESP/types").NumberReply<number>;
                "pids-tracked": import("../RESP/types").NumberReply<number>;
                "iids-tracked": import("../RESP/types").NumberReply<number>;
                "iids-added": import("../RESP/types").NumberReply<number>;
                "iids-duplicates": import("../RESP/types").NumberReply<number>;
                groups: import("../RESP/types").NumberReply<number>;
                "first-entry": import("../RESP/types").NullReply | {
                    id: import("../RESP/types").BlobStringReply<string>;
                    message: import("../RESP/types").MapReply<import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>>;
                };
                "last-entry": import("../RESP/types").NullReply | {
                    id: import("../RESP/types").BlobStringReply<string>;
                    message: import("../RESP/types").MapReply<import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>>;
                };
            };
            readonly 3: (this: void, reply: any) => import("./XINFO_STREAM").XInfoStreamReply;
        };
    };
    XLEN: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    xLen: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    XPENDING_RANGE: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, group: import("../RESP/types").RedisArgument, start: import("../RESP/types").RedisArgument, end: import("../RESP/types").RedisArgument, count: number, options?: import("./XPENDING_RANGE").XPendingRangeOptions | undefined) => void;
        readonly transformReply: (this: void, reply: import("../RESP/types").TuplesReply<[id: import("../RESP/types").BlobStringReply<string>, consumer: import("../RESP/types").BlobStringReply<string>, millisecondsSinceLastDelivery: import("../RESP/types").NumberReply<number>, deliveriesCounter: import("../RESP/types").NumberReply<number>]>[]) => {
            id: import("../RESP/types").BlobStringReply<string>;
            consumer: import("../RESP/types").BlobStringReply<string>;
            millisecondsSinceLastDelivery: import("../RESP/types").NumberReply<number>;
            deliveriesCounter: import("../RESP/types").NumberReply<number>;
        }[];
    };
    xPendingRange: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, group: import("../RESP/types").RedisArgument, start: import("../RESP/types").RedisArgument, end: import("../RESP/types").RedisArgument, count: number, options?: import("./XPENDING_RANGE").XPendingRangeOptions | undefined) => void;
        readonly transformReply: (this: void, reply: import("../RESP/types").TuplesReply<[id: import("../RESP/types").BlobStringReply<string>, consumer: import("../RESP/types").BlobStringReply<string>, millisecondsSinceLastDelivery: import("../RESP/types").NumberReply<number>, deliveriesCounter: import("../RESP/types").NumberReply<number>]>[]) => {
            id: import("../RESP/types").BlobStringReply<string>;
            consumer: import("../RESP/types").BlobStringReply<string>;
            millisecondsSinceLastDelivery: import("../RESP/types").NumberReply<number>;
            deliveriesCounter: import("../RESP/types").NumberReply<number>;
        }[];
    };
    XPENDING: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, group: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: (this: void, reply: [pending: import("../RESP/types").NumberReply<number>, firstId: import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, lastId: import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, consumers: import("../RESP/types").NullReply | import("../RESP/types").ArrayReply<import("../RESP/types").TuplesReply<[name: import("../RESP/types").BlobStringReply<string>, deliveriesCounter: import("../RESP/types").BlobStringReply<string>]>>]) => {
            pending: import("../RESP/types").NumberReply<number>;
            firstId: import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
            lastId: import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
            consumers: {
                name: import("../RESP/types").BlobStringReply<string>;
                deliveriesCounter: number;
            }[] | null;
        };
    };
    xPending: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, group: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: (this: void, reply: [pending: import("../RESP/types").NumberReply<number>, firstId: import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, lastId: import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, consumers: import("../RESP/types").NullReply | import("../RESP/types").ArrayReply<import("../RESP/types").TuplesReply<[name: import("../RESP/types").BlobStringReply<string>, deliveriesCounter: import("../RESP/types").BlobStringReply<string>]>>]) => {
            pending: import("../RESP/types").NumberReply<number>;
            firstId: import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
            lastId: import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
            consumers: {
                name: import("../RESP/types").BlobStringReply<string>;
                deliveriesCounter: number;
            }[] | null;
        };
    };
    XRANGE: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, start: import("../RESP/types").RedisArgument, end: import("../RESP/types").RedisArgument, options?: import("./XRANGE").XRangeOptions | undefined) => void;
        readonly transformReply: (this: void, reply: import("./generic-transformers").StreamMessageRawReply[], preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => import("./generic-transformers").StreamMessageReply[];
    };
    xRange: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, start: import("../RESP/types").RedisArgument, end: import("../RESP/types").RedisArgument, options?: import("./XRANGE").XRangeOptions | undefined) => void;
        readonly transformReply: (this: void, reply: import("./generic-transformers").StreamMessageRawReply[], preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => import("./generic-transformers").StreamMessageReply[];
    };
    XREAD: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, streams: import("./XREAD").XReadStreams, options?: import("./XREAD").XReadOptions | undefined) => void;
        readonly transformReply: {
            readonly 2: typeof import("./generic-transformers").transformStreamsMessagesReplyResp2;
            readonly 3: () => import("../RESP/types").ReplyUnion;
        };
        readonly unstableResp3: true;
    };
    xRead: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, streams: import("./XREAD").XReadStreams, options?: import("./XREAD").XReadOptions | undefined) => void;
        readonly transformReply: {
            readonly 2: typeof import("./generic-transformers").transformStreamsMessagesReplyResp2;
            readonly 3: () => import("../RESP/types").ReplyUnion;
        };
        readonly unstableResp3: true;
    };
    XREADGROUP: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, group: import("../RESP/types").RedisArgument, consumer: import("../RESP/types").RedisArgument, streams: import("./XREAD").XReadStreams, options?: import("./XREADGROUP").XReadGroupOptions | undefined) => void;
        readonly transformReply: {
            readonly 2: typeof import("./generic-transformers").transformStreamsMessagesReplyResp2;
            readonly 3: () => import("../RESP/types").ReplyUnion;
        };
    };
    xReadGroup: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, group: import("../RESP/types").RedisArgument, consumer: import("../RESP/types").RedisArgument, streams: import("./XREAD").XReadStreams, options?: import("./XREADGROUP").XReadGroupOptions | undefined) => void;
        readonly transformReply: {
            readonly 2: typeof import("./generic-transformers").transformStreamsMessagesReplyResp2;
            readonly 3: () => import("../RESP/types").ReplyUnion;
        };
    };
    XREVRANGE: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, start: import("../RESP/types").RedisArgument, end: import("../RESP/types").RedisArgument, options?: import("./XRANGE").XRangeOptions | undefined) => void;
        readonly transformReply: (this: void, reply: import("./generic-transformers").StreamMessageRawReply[], preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => import("./generic-transformers").StreamMessageReply[];
    };
    xRevRange: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, start: import("../RESP/types").RedisArgument, end: import("../RESP/types").RedisArgument, options?: import("./XRANGE").XRangeOptions | undefined) => void;
        readonly transformReply: (this: void, reply: import("./generic-transformers").StreamMessageRawReply[], preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => import("./generic-transformers").StreamMessageReply[];
    };
    XSETID: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, lastId: import("../RESP/types").RedisArgument, options?: import("./XSETID").XSetIdOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    xSetId: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, lastId: import("../RESP/types").RedisArgument, options?: import("./XSETID").XSetIdOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").SimpleStringReply<"OK">;
    };
    XTRIM: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, strategy: "MAXLEN" | "MINID", threshold: string | number, options?: import("./XTRIM").XTrimOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    xTrim: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, strategy: "MAXLEN" | "MINID", threshold: string | number, options?: import("./XTRIM").XTrimOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    ZADD_INCR: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, members: import("./generic-transformers").SortedSetMember | import("./generic-transformers").SortedSetMember[], options?: import("./ZADD_INCR").ZAddOptions | undefined) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => import("../RESP/types").DoubleReply<number> | null;
            3: () => import("../RESP/types").NullReply | import("../RESP/types").DoubleReply<number>;
        };
    };
    zAddIncr: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, members: import("./generic-transformers").SortedSetMember | import("./generic-transformers").SortedSetMember[], options?: import("./ZADD_INCR").ZAddOptions | undefined) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => import("../RESP/types").DoubleReply<number> | null;
            3: () => import("../RESP/types").NullReply | import("../RESP/types").DoubleReply<number>;
        };
    };
    ZADD: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, members: import("./generic-transformers").SortedSetMember | import("./generic-transformers").SortedSetMember[], options?: import("./ZADD").ZAddOptions | undefined) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").BlobStringReply<string>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => import("../RESP/types").DoubleReply<number>;
            3: () => import("../RESP/types").DoubleReply<number>;
        };
    };
    zAdd: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, members: import("./generic-transformers").SortedSetMember | import("./generic-transformers").SortedSetMember[], options?: import("./ZADD").ZAddOptions | undefined) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").BlobStringReply<string>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => import("../RESP/types").DoubleReply<number>;
            3: () => import("../RESP/types").DoubleReply<number>;
        };
    };
    ZCARD: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    zCard: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    ZCOUNT: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, min: number | import("../RESP/types").RedisArgument, max: number | import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    zCount: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, min: number | import("../RESP/types").RedisArgument, max: number | import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    ZDIFF_WITHSCORES: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
            3: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").DoubleReply<number>]>>) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
        };
    };
    zDiffWithScores: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
            3: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").DoubleReply<number>]>>) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
        };
    };
    ZDIFF: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    zDiff: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    ZDIFFSTORE: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, destination: import("../RESP/types").RedisArgument, inputKeys: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    zDiffStore: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, destination: import("../RESP/types").RedisArgument, inputKeys: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    ZINCRBY: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, increment: number, member: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").BlobStringReply<string>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => import("../RESP/types").DoubleReply<number>;
            3: () => import("../RESP/types").DoubleReply<number>;
        };
    };
    zIncrBy: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, increment: number, member: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").BlobStringReply<string>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => import("../RESP/types").DoubleReply<number>;
            3: () => import("../RESP/types").DoubleReply<number>;
        };
    };
    ZINTER_WITHSCORES: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./ZINTER").ZInterKeysType, options?: import("./ZINTER").ZInterOptions | undefined) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
            3: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").DoubleReply<number>]>>) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
        };
    };
    zInterWithScores: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./ZINTER").ZInterKeysType, options?: import("./ZINTER").ZInterOptions | undefined) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
            3: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").DoubleReply<number>]>>) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
        };
    };
    ZINTER: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./ZINTER").ZInterKeysType, options?: import("./ZINTER").ZInterOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    zInter: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./ZINTER").ZInterKeysType, options?: import("./ZINTER").ZInterOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    ZINTERCARD: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").RedisVariadicArgument, options?: number | import("./ZINTERCARD").ZInterCardOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    zInterCard: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").RedisVariadicArgument, options?: number | import("./ZINTERCARD").ZInterCardOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    ZINTERSTORE: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, destination: import("../RESP/types").RedisArgument, keys: import("./generic-transformers").ZKeys, options?: import("./ZINTER").ZInterOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    zInterStore: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, destination: import("../RESP/types").RedisArgument, keys: import("./generic-transformers").ZKeys, options?: import("./ZINTER").ZInterOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    ZLEXCOUNT: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, min: import("../RESP/types").RedisArgument, max: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    zLexCount: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, min: import("../RESP/types").RedisArgument, max: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    ZMPOP: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").RedisVariadicArgument, side: import("./generic-transformers").SortedSetSide, options?: import("./ZMPOP").ZMPopOptions | undefined) => void;
        readonly transformReply: {
            readonly 2: (this: void, reply: import("../RESP/types").UnwrapReply<import("../RESP/types").Resp2Reply<import("./ZMPOP").ZMPopRawReply>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
                key: import("../RESP/types").BlobStringReply<string>;
                members: {
                    value: import("../RESP/types").BlobStringReply<string>;
                    score: import("../RESP/types").DoubleReply<number>;
                }[];
            } | null;
            readonly 3: (this: void, reply: import("../RESP/types").UnwrapReply<import("./ZMPOP").ZMPopRawReply>) => {
                key: import("../RESP/types").BlobStringReply<string>;
                members: {
                    value: import("../RESP/types").BlobStringReply<string>;
                    score: import("../RESP/types").DoubleReply<number>;
                }[];
            } | null;
        };
    };
    zmPop: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").RedisVariadicArgument, side: import("./generic-transformers").SortedSetSide, options?: import("./ZMPOP").ZMPopOptions | undefined) => void;
        readonly transformReply: {
            readonly 2: (this: void, reply: import("../RESP/types").UnwrapReply<import("../RESP/types").Resp2Reply<import("./ZMPOP").ZMPopRawReply>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
                key: import("../RESP/types").BlobStringReply<string>;
                members: {
                    value: import("../RESP/types").BlobStringReply<string>;
                    score: import("../RESP/types").DoubleReply<number>;
                }[];
            } | null;
            readonly 3: (this: void, reply: import("../RESP/types").UnwrapReply<import("./ZMPOP").ZMPopRawReply>) => {
                key: import("../RESP/types").BlobStringReply<string>;
                members: {
                    value: import("../RESP/types").BlobStringReply<string>;
                    score: import("../RESP/types").DoubleReply<number>;
                }[];
            } | null;
        };
    };
    ZMSCORE: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, member: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: {
            readonly 2: (reply: (import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>)[], preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => (import("../RESP/types").DoubleReply<number> | null)[];
            readonly 3: () => import("../RESP/types").ArrayReply<import("../RESP/types").NullReply | import("../RESP/types").DoubleReply<number>>;
        };
    };
    zmScore: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, member: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: {
            readonly 2: (reply: (import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>)[], preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => (import("../RESP/types").DoubleReply<number> | null)[];
            readonly 3: () => import("../RESP/types").ArrayReply<import("../RESP/types").NullReply | import("../RESP/types").DoubleReply<number>>;
        };
    };
    ZPOPMAX_COUNT: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, count: number) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
            3: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").DoubleReply<number>]>>) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
        };
    };
    zPopMaxCount: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, count: number) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
            3: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").DoubleReply<number>]>>) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
        };
    };
    ZPOPMAX: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: {
            readonly 2: (reply: import("../RESP/types").UnwrapReply<import("../RESP/types").TuplesReply<[] | [import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>]>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            } | null;
            readonly 3: (reply: import("../RESP/types").UnwrapReply<import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").DoubleReply<number>] | []>>) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            } | null;
        };
    };
    zPopMax: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: {
            readonly 2: (reply: import("../RESP/types").UnwrapReply<import("../RESP/types").TuplesReply<[] | [import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>]>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            } | null;
            readonly 3: (reply: import("../RESP/types").UnwrapReply<import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").DoubleReply<number>] | []>>) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            } | null;
        };
    };
    ZPOPMIN_COUNT: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, count: number) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
            3: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").DoubleReply<number>]>>) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
        };
    };
    zPopMinCount: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, count: number) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
            3: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").DoubleReply<number>]>>) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
        };
    };
    ZPOPMIN: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: {
            readonly 2: (reply: import("../RESP/types").UnwrapReply<import("../RESP/types").TuplesReply<[] | [import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>]>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            } | null;
            readonly 3: (reply: import("../RESP/types").UnwrapReply<import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").DoubleReply<number>] | []>>) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            } | null;
        };
    };
    zPopMin: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: {
            readonly 2: (reply: import("../RESP/types").UnwrapReply<import("../RESP/types").TuplesReply<[] | [import("../RESP/types").BlobStringReply<string>, import("../RESP/types").BlobStringReply<string>]>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            } | null;
            readonly 3: (reply: import("../RESP/types").UnwrapReply<import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").DoubleReply<number>] | []>>) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            } | null;
        };
    };
    ZRANDMEMBER_COUNT_WITHSCORES: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, count: number) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
            3: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").DoubleReply<number>]>>) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
        };
    };
    zRandMemberCountWithScores: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, count: number) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
            3: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").DoubleReply<number>]>>) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
        };
    };
    ZRANDMEMBER_COUNT: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, count: number) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    zRandMemberCount: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, count: number) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    ZRANDMEMBER: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    zRandMember: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>;
    };
    ZRANGE_WITHSCORES: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, min: number | import("../RESP/types").RedisArgument, max: number | import("../RESP/types").RedisArgument, options?: import("./ZRANGE").ZRangeOptions | undefined) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
            3: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").DoubleReply<number>]>>) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
        };
    };
    zRangeWithScores: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, min: number | import("../RESP/types").RedisArgument, max: number | import("../RESP/types").RedisArgument, options?: import("./ZRANGE").ZRangeOptions | undefined) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
            3: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").DoubleReply<number>]>>) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
        };
    };
    ZRANGE: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, min: number | import("../RESP/types").RedisArgument, max: number | import("../RESP/types").RedisArgument, options?: import("./ZRANGE").ZRangeOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    zRange: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, min: number | import("../RESP/types").RedisArgument, max: number | import("../RESP/types").RedisArgument, options?: import("./ZRANGE").ZRangeOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    ZRANGEBYLEX: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, min: import("../RESP/types").RedisArgument, max: import("../RESP/types").RedisArgument, options?: import("./ZRANGEBYLEX").ZRangeByLexOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    zRangeByLex: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, min: import("../RESP/types").RedisArgument, max: import("../RESP/types").RedisArgument, options?: import("./ZRANGEBYLEX").ZRangeByLexOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    ZRANGEBYSCORE_WITHSCORES: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, min: string | number, max: string | number, options?: import("./ZRANGEBYSCORE").ZRangeByScoreOptions | undefined) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
            3: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").DoubleReply<number>]>>) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
        };
    };
    zRangeByScoreWithScores: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, min: string | number, max: string | number, options?: import("./ZRANGEBYSCORE").ZRangeByScoreOptions | undefined) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
            3: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").DoubleReply<number>]>>) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
        };
    };
    ZRANGEBYSCORE: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, min: string | number, max: string | number, options?: import("./ZRANGEBYSCORE").ZRangeByScoreOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    zRangeByScore: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, min: string | number, max: string | number, options?: import("./ZRANGEBYSCORE").ZRangeByScoreOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    ZRANGESTORE: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, destination: import("../RESP/types").RedisArgument, source: import("../RESP/types").RedisArgument, min: number | import("../RESP/types").RedisArgument, max: number | import("../RESP/types").RedisArgument, options?: import("./ZRANGESTORE").ZRangeStoreOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    zRangeStore: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, destination: import("../RESP/types").RedisArgument, source: import("../RESP/types").RedisArgument, min: number | import("../RESP/types").RedisArgument, max: number | import("../RESP/types").RedisArgument, options?: import("./ZRANGESTORE").ZRangeStoreOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    ZRANK_WITHSCORE: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, member: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: {
            readonly 2: (reply: import("../RESP/types").UnwrapReply<import("../RESP/types").NullReply | import("../RESP/types").TuplesReply<[import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<string>]>>) => {
                rank: import("../RESP/types").NumberReply<number>;
                score: number;
            } | null;
            readonly 3: (reply: import("../RESP/types").UnwrapReply<import("../RESP/types").NullReply | import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").DoubleReply<number>]>>) => {
                rank: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            } | null;
        };
    };
    zRankWithScore: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, member: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: {
            readonly 2: (reply: import("../RESP/types").UnwrapReply<import("../RESP/types").NullReply | import("../RESP/types").TuplesReply<[import("../RESP/types").NumberReply<number>, import("../RESP/types").BlobStringReply<string>]>>) => {
                rank: import("../RESP/types").NumberReply<number>;
                score: number;
            } | null;
            readonly 3: (reply: import("../RESP/types").UnwrapReply<import("../RESP/types").NullReply | import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").DoubleReply<number>]>>) => {
                rank: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            } | null;
        };
    };
    ZRANK: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, member: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").NumberReply<number>;
    };
    zRank: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, member: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").NumberReply<number>;
    };
    ZREM: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, member: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    zRem: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, member: import("./generic-transformers").RedisVariadicArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    ZREMRANGEBYLEX: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, min: number | import("../RESP/types").RedisArgument, max: number | import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    zRemRangeByLex: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, min: number | import("../RESP/types").RedisArgument, max: number | import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    ZREMRANGEBYRANK: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, start: number, stop: number) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    zRemRangeByRank: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, start: number, stop: number) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    ZREMRANGEBYSCORE: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, min: number | import("../RESP/types").RedisArgument, max: number | import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    zRemRangeByScore: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, min: number | import("../RESP/types").RedisArgument, max: number | import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    ZREVRANK: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, member: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").NumberReply<number>;
    };
    zRevRank: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, member: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").NumberReply<number>;
    };
    ZSCAN: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, cursor: import("../RESP/types").RedisArgument, options?: import("./SCAN").ScanCommonOptions | undefined) => void;
        readonly transformReply: (this: void, [cursor, rawMembers]: [import("../RESP/types").BlobStringReply<string>, import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>]) => {
            cursor: import("../RESP/types").BlobStringReply<string>;
            members: {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
        };
    };
    zScan: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, cursor: import("../RESP/types").RedisArgument, options?: import("./SCAN").ScanCommonOptions | undefined) => void;
        readonly transformReply: (this: void, [cursor, rawMembers]: [import("../RESP/types").BlobStringReply<string>, import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>]) => {
            cursor: import("../RESP/types").BlobStringReply<string>;
            members: {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
        };
    };
    ZSCORE: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, member: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => import("../RESP/types").DoubleReply<number> | null;
            3: () => import("../RESP/types").NullReply | import("../RESP/types").DoubleReply<number>;
        };
    };
    zScore: {
        readonly CACHEABLE: true;
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, member: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => import("../RESP/types").DoubleReply<number> | null;
            3: () => import("../RESP/types").NullReply | import("../RESP/types").DoubleReply<number>;
        };
    };
    ZUNION_WITHSCORES: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").ZKeys, options?: import("./ZUNION").ZUnionOptions | undefined) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
            3: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").DoubleReply<number>]>>) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
        };
    };
    zUnionWithScores: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").ZKeys, options?: import("./ZUNION").ZUnionOptions | undefined) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>, preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
            3: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").TuplesReply<[import("../RESP/types").BlobStringReply<string>, import("../RESP/types").DoubleReply<number>]>>) => {
                value: import("../RESP/types").BlobStringReply<string>;
                score: import("../RESP/types").DoubleReply<number>;
            }[];
        };
    };
    ZUNION: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").ZKeys, options?: import("./ZUNION").ZUnionOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    zUnion: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, keys: import("./generic-transformers").ZKeys, options?: import("./ZUNION").ZUnionOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    ZUNIONSTORE: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, destination: import("../RESP/types").RedisArgument, keys: import("./generic-transformers").ZKeys, options?: import("./ZUNIONSTORE").ZUnionOptions | undefined) => any;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    zUnionStore: {
        readonly IS_READ_ONLY: false;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, destination: import("../RESP/types").RedisArgument, keys: import("./generic-transformers").ZKeys, options?: import("./ZUNIONSTORE").ZUnionOptions | undefined) => any;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    VADD: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, vector: number[], element: import("../RESP/types").RedisArgument, options?: import("./VADD").VAddOptions | undefined) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").NumberReply<0 | 1>) => boolean;
            3: () => import("../RESP/types").BooleanReply<boolean>;
        };
    };
    vAdd: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, vector: number[], element: import("../RESP/types").RedisArgument, options?: import("./VADD").VAddOptions | undefined) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").NumberReply<0 | 1>) => boolean;
            3: () => import("../RESP/types").BooleanReply<boolean>;
        };
    };
    VCARD: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    vCard: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    VDIM: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    vDim: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").NumberReply<number>;
    };
    VEMB: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, element: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").BlobStringReply<string>[], preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => import("../RESP/types").DoubleReply<number>[];
            3: () => import("../RESP/types").ArrayReply<import("../RESP/types").DoubleReply<number>>;
        };
    };
    vEmb: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, element: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").BlobStringReply<string>[], preserve?: any, typeMapping?: import("../RESP/types").TypeMapping | undefined) => import("../RESP/types").DoubleReply<number>[];
            3: () => import("../RESP/types").ArrayReply<import("../RESP/types").DoubleReply<number>>;
        };
    };
    VEMB_RAW: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, element: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: {
            2: (reply: any[]) => {
                quantization: import("../RESP/types").SimpleStringReply<string>;
                raw: import("../RESP/types").BlobStringReply<string>;
                l2Norm: import("../RESP/types").DoubleReply<number>;
                quantizationRange?: import("../RESP/types").DoubleReply<number> | undefined;
            };
            3: (reply: any[]) => {
                quantization: import("../RESP/types").SimpleStringReply<string>;
                raw: import("../RESP/types").BlobStringReply<string>;
                l2Norm: import("../RESP/types").DoubleReply<number>;
                quantizationRange?: import("../RESP/types").DoubleReply<number> | undefined;
            };
        };
    };
    vEmbRaw: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, element: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: {
            2: (reply: any[]) => {
                quantization: import("../RESP/types").SimpleStringReply<string>;
                raw: import("../RESP/types").BlobStringReply<string>;
                l2Norm: import("../RESP/types").DoubleReply<number>;
                quantizationRange?: import("../RESP/types").DoubleReply<number> | undefined;
            };
            3: (reply: any[]) => {
                quantization: import("../RESP/types").SimpleStringReply<string>;
                raw: import("../RESP/types").BlobStringReply<string>;
                l2Norm: import("../RESP/types").DoubleReply<number>;
                quantizationRange?: import("../RESP/types").DoubleReply<number> | undefined;
            };
        };
    };
    VGETATTR: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, element: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: typeof import("./generic-transformers").transformRedisJsonNullReply;
    };
    vGetAttr: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, element: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: typeof import("./generic-transformers").transformRedisJsonNullReply;
    };
    VINFO: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: {
            readonly 2: (reply: [import("../RESP/types").SimpleStringReply<"quant-type">, import("../RESP/types").SimpleStringReply<string>, import("../RESP/types").SimpleStringReply<"vector-dim">, import("../RESP/types").NumberReply<number>, import("../RESP/types").SimpleStringReply<"size">, import("../RESP/types").NumberReply<number>, import("../RESP/types").SimpleStringReply<"max-level">, import("../RESP/types").NumberReply<number>, import("../RESP/types").SimpleStringReply<"vset-uid">, import("../RESP/types").NumberReply<number>, import("../RESP/types").SimpleStringReply<"hnsw-max-node-uid">, import("../RESP/types").NumberReply<number>]) => import("./VINFO").VInfoReplyMap;
            readonly 3: () => import("./VINFO").VInfoReplyMap;
        };
    };
    vInfo: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: {
            readonly 2: (reply: [import("../RESP/types").SimpleStringReply<"quant-type">, import("../RESP/types").SimpleStringReply<string>, import("../RESP/types").SimpleStringReply<"vector-dim">, import("../RESP/types").NumberReply<number>, import("../RESP/types").SimpleStringReply<"size">, import("../RESP/types").NumberReply<number>, import("../RESP/types").SimpleStringReply<"max-level">, import("../RESP/types").NumberReply<number>, import("../RESP/types").SimpleStringReply<"vset-uid">, import("../RESP/types").NumberReply<number>, import("../RESP/types").SimpleStringReply<"hnsw-max-node-uid">, import("../RESP/types").NumberReply<number>]) => import("./VINFO").VInfoReplyMap;
            readonly 3: () => import("./VINFO").VInfoReplyMap;
        };
    };
    VLINKS: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, element: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>>;
    };
    vLinks: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, element: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>>;
    };
    VLINKS_WITHSCORES: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, element: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: {
            readonly 2: (reply: any) => Record<string, import("../RESP/types").DoubleReply<number>>[];
            readonly 3: () => import("../RESP/types").MapReply<import("../RESP/types").BlobStringReply<string>, import("../RESP/types").DoubleReply<number>>[];
        };
    };
    vLinksWithScores: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, element: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: {
            readonly 2: (reply: any) => Record<string, import("../RESP/types").DoubleReply<number>>[];
            readonly 3: () => import("../RESP/types").MapReply<import("../RESP/types").BlobStringReply<string>, import("../RESP/types").DoubleReply<number>>[];
        };
    };
    VRANDMEMBER: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, count?: number | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string> | import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    vRandMember: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, count?: number | undefined) => void;
        readonly transformReply: () => import("../RESP/types").NullReply | import("../RESP/types").BlobStringReply<string> | import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    VRANGE: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, start: import("../RESP/types").RedisArgument, end: import("../RESP/types").RedisArgument, count?: number | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    vRange: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, start: import("../RESP/types").RedisArgument, end: import("../RESP/types").RedisArgument, count?: number | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    VREM: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, element: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").NumberReply<0 | 1>) => boolean;
            3: () => import("../RESP/types").BooleanReply<boolean>;
        };
    };
    vRem: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, element: import("../RESP/types").RedisArgument) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").NumberReply<0 | 1>) => boolean;
            3: () => import("../RESP/types").BooleanReply<boolean>;
        };
    };
    VSETATTR: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, element: import("../RESP/types").RedisArgument, attributes: import("../RESP/types").RedisArgument | Record<string, any>) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").NumberReply<0 | 1>) => boolean;
            3: () => import("../RESP/types").BooleanReply<boolean>;
        };
    };
    vSetAttr: {
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, element: import("../RESP/types").RedisArgument, attributes: import("../RESP/types").RedisArgument | Record<string, any>) => void;
        readonly transformReply: {
            2: (reply: import("../RESP/types").NumberReply<0 | 1>) => boolean;
            3: () => import("../RESP/types").BooleanReply<boolean>;
        };
    };
    VSIM: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, query: number[] | import("../RESP/types").RedisArgument, options?: import("./VSIM").VSimOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    vSim: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, query: number[] | import("../RESP/types").RedisArgument, options?: import("./VSIM").VSimOptions | undefined) => void;
        readonly transformReply: () => import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>;
    };
    VSIM_WITHSCORES: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, query: number[] | import("../RESP/types").RedisArgument, options?: import("./VSIM").VSimOptions | undefined) => void;
        readonly transformReply: {
            readonly 2: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>) => Record<string, import("../RESP/types").DoubleReply<number>>;
            readonly 3: () => import("../RESP/types").MapReply<import("../RESP/types").BlobStringReply<string>, import("../RESP/types").DoubleReply<number>>;
        };
    };
    vSimWithScores: {
        readonly IS_READ_ONLY: true;
        readonly parseCommand: (this: void, parser: import("../..").CommandParser, key: import("../RESP/types").RedisArgument, query: number[] | import("../RESP/types").RedisArgument, options?: import("./VSIM").VSimOptions | undefined) => void;
        readonly transformReply: {
            readonly 2: (reply: import("../RESP/types").ArrayReply<import("../RESP/types").BlobStringReply<string>>) => Record<string, import("../RESP/types").DoubleReply<number>>;
            readonly 3: () => import("../RESP/types").MapReply<import("../RESP/types").BlobStringReply<string>, import("../RESP/types").DoubleReply<number>>;
        };
    };
};
export { NON_STICKY_COMMANDS };
//# sourceMappingURL=index.d.ts.map