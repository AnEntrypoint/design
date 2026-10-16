import { fmtFileSize } from './files.js';
import { safeUrl as sharedSafeUrl, renderInline as sharedRenderInline, injectCodeCopy as sharedInjectCodeCopy } from './chat-message-parts.js';
import { hasSelectionInside, makeThreadAutoScroll } from './chat/thread-scroll.js';
import { ChatMessage } from './chat/message.js';
import { ChatComposer } from './chat/composer.js';
import { flashComposerNote, TypingIndicator } from './chat/composer-affordances.js';
import { Chat, AICat, AICatPortrait, ChatSuggestions, AICAT_FACE } from './chat/threads.js';
import './chat/stats.js';

export const fmtBytes = fmtFileSize;

export const safeUrl = sharedSafeUrl;
export const renderInline = sharedRenderInline;

export const injectCodeCopy = sharedInjectCodeCopy;

export {
    hasSelectionInside, makeThreadAutoScroll,
    ChatMessage,
    ChatComposer, flashComposerNote, TypingIndicator,
    Chat, AICat, AICatPortrait, ChatSuggestions, AICAT_FACE,
};
