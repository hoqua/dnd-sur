"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatSDKError = exports.visibilityBySurface = void 0;
exports.getMessageByErrorCode = getMessageByErrorCode;
exports.visibilityBySurface = {
    database: 'log',
    chat: 'response',
    auth: 'response',
    stream: 'response',
    api: 'response',
    history: 'response',
    vote: 'response',
    document: 'response',
    suggestions: 'response',
};
class ChatSDKError extends Error {
    constructor(errorCode, cause) {
        super();
        const [type, surface] = errorCode.split(':');
        this.type = type;
        this.cause = cause;
        this.surface = surface;
        this.message = getMessageByErrorCode(errorCode);
        this.statusCode = getStatusCodeByType(this.type);
    }
    toResponse() {
        const code = `${this.type}:${this.surface}`;
        const visibility = exports.visibilityBySurface[this.surface];
        const { message, cause, statusCode } = this;
        if (visibility === 'log') {
            console.error({
                code,
                message,
                cause,
            });
            return Response.json({ code: '', message: 'Something went wrong. Please try again later.' }, { status: statusCode });
        }
        return Response.json({ code, message, cause }, { status: statusCode });
    }
}
exports.ChatSDKError = ChatSDKError;
function getMessageByErrorCode(errorCode) {
    if (errorCode.includes('database')) {
        return 'An error occurred while executing a database query.';
    }
    switch (errorCode) {
        case 'bad_request:api':
            return "The request couldn't be processed. Please check your input and try again.";
        case 'unauthorized:auth':
            return 'You need to sign in before continuing.';
        case 'forbidden:auth':
            return 'Your account does not have access to this feature.';
        case 'rate_limit:chat':
            return 'You have exceeded your maximum number of messages for the day. Please try again later.';
        case 'not_found:chat':
            return 'The requested chat was not found. Please check the chat ID and try again.';
        case 'forbidden:chat':
            return 'This chat belongs to another user. Please check the chat ID and try again.';
        case 'unauthorized:chat':
            return 'You need to sign in to view this chat. Please sign in and try again.';
        case 'offline:chat':
            return "We're having trouble sending your message. Please check your internet connection and try again.";
        case 'not_found:document':
            return 'The requested document was not found. Please check the document ID and try again.';
        case 'forbidden:document':
            return 'This document belongs to another user. Please check the document ID and try again.';
        case 'unauthorized:document':
            return 'You need to sign in to view this document. Please sign in and try again.';
        case 'bad_request:document':
            return 'The request to create or update the document was invalid. Please check your input and try again.';
        default:
            return 'Something went wrong. Please try again later.';
    }
}
function getStatusCodeByType(type) {
    switch (type) {
        case 'bad_request':
            return 400;
        case 'unauthorized':
            return 401;
        case 'forbidden':
            return 403;
        case 'not_found':
            return 404;
        case 'rate_limit':
            return 429;
        case 'offline':
            return 503;
        default:
            return 500;
    }
}
