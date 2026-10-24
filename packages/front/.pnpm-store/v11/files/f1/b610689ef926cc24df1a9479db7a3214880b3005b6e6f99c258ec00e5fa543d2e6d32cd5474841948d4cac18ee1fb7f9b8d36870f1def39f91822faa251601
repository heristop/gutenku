import { APIResource } from "../../../core/resource.js";
import * as LiveAPI from "../live.js";
export declare class Sideband extends APIResource {
}
/**
 * Client events accepted by an attached Live sideband WebSocket. The session has
 * already started. Send input audio over the primary connection.
 */
export type ConnectClientEvent = LiveAPI.SessionUpdateEvent | LiveAPI.InputAudioMuteEvent | LiveAPI.InputAudioUnmuteEvent | LiveAPI.OutputAudioFixturePlayEvent | LiveAPI.InstructionsAppendEvent | LiveAPI.ThinkingAppendEvent | LiveAPI.CommentaryAppendEvent | LiveAPI.DecisionCreateEvent | LiveAPI.DecisionItemCreateEvent | LiveAPI.DecisionItemDeleteEvent | LiveAPI.ResponseItemCreateEvent | LiveAPI.ResponseCreateEvent | LiveAPI.SessionCloseEvent;
/**
 * Server events received by an attached Live sideband WebSocket, including
 * reflected input and output audio and transport notifications.
 */
export type ConnectServerEvent = LiveAPI.SessionStartedEvent | LiveAPI.SessionUpdatedEvent | LiveAPI.InputAudioMutedEvent | LiveAPI.InputAudioUnmutedEvent | LiveAPI.OutputAudioFixturePlayingEvent | LiveAPI.OutputAudioFixturePlayedEvent | LiveAPI.InstructionsAppendedEvent | LiveAPI.ThinkingAppendedEvent | LiveAPI.CommentaryAppendedEvent | LiveAPI.InputTranscriptDeltaEvent | LiveAPI.OutputTranscriptDeltaEvent | LiveAPI.DelegationCreatedEvent | LiveAPI.DecisionEvent | LiveAPI.DecisionItemCreatedEvent | LiveAPI.DecisionItemDeletedEvent | LiveAPI.ResponseEvent | LiveAPI.SessionUsageUpdatedEvent | LiveAPI.SessionClosedEvent | LiveAPI.ErrorEvent | LiveAPI.InfoEvent | ConnectServerEvent.SessionInputAudioAppend | LiveAPI.OutputAudioDeltaEvent | ConnectServerEvent.TransportDtmfReceived | ConnectServerEvent.TransportDtmfSend | ConnectServerEvent.TransportRinging | ConnectServerEvent.TransportAnswered | ConnectServerEvent.TransportFailed;
export declare namespace ConnectServerEvent {
    /**
     * Input audio received from the primary transport and reflected to a Live sideband
     * connection before model-input muting.
     */
    interface SessionInputAudioAppend {
        /**
         * Base64-encoded raw mono PCM16LE at 24 kHz received from the primary transport,
         * reflected to the sideband before model-input muting. This server event uses the
         * same audio key as the client command, but is not an acknowledgment of it.
         */
        audio: string;
        /**
         * The event type, always `session.input_audio.append`.
         */
        type: 'session.input_audio.append';
    }
    /**
     * A SIP DTMF keypress received from the caller. Delivered only to sideband
     * observers.
     */
    interface TransportDtmfReceived {
        event: string;
        event_id: string;
        type: 'transport.dtmf.received';
    }
    /**
     * A SIP DTMF keypress successfully sent to the SIP trunk. Delivered only to
     * sideband observers; this is not a client command.
     */
    interface TransportDtmfSend {
        event: string;
        event_id: string;
        type: 'transport.dtmf.send';
        /**
         * The event_id of the client command, when supplied.
         */
        client_event_id?: string;
    }
    /**
     * The outbound SIP provider leg is ringing or providing early media. Delivered
     * only to sideband observers.
     */
    interface TransportRinging {
        event_id: string;
        /**
         * The canonical Live session ID.
         */
        session_id: string;
        type: 'transport.ringing';
    }
    /**
     * The outbound SIP provider leg answered and media is established. Delivered only
     * to sideband observers.
     */
    interface TransportAnswered {
        event_id: string;
        /**
         * The canonical Live session ID.
         */
        session_id: string;
        type: 'transport.answered';
    }
    /**
     * An asynchronous outbound SIP setup failure. Delivered only to sideband
     * observers.
     */
    interface TransportFailed {
        error: TransportFailed.Error;
        event_id: string;
        /**
         * The canonical Live session ID.
         */
        session_id: string;
        type: 'transport.failed';
    }
    namespace TransportFailed {
        interface Error {
            /**
             * The call setup failure code.
             */
            code: string;
            message: string;
            type: 'call_error';
            /**
             * The parameter related to the error, if any. Empty when no parameter applies.
             */
            param?: string;
        }
    }
}
export interface SidebandConnectParams {
    /**
     * Opt in to the graceful WebSocket closing handshake when the session ends. The
     * server may also enable this behavior by default.
     */
    graceful_close?: boolean;
}
export declare namespace Sideband {
    export { type ConnectClientEvent as ConnectClientEvent, type ConnectServerEvent as ConnectServerEvent, type SidebandConnectParams as SidebandConnectParams, };
}
//# sourceMappingURL=sideband.d.ts.map