import { registerModule } from '../registry.js';

registerModule({
    id: 'hello-room',
    kind: 'channelType',
    channelType: {
        type: 'hello-room',
        label: 'Hello room',
        icon: 'ref-smile',
        railGroup: { id: 'hello', label: 'Hello Rooms', order: 4, voice: false, createType: 'hello-room' },
        headerSub: 'hello',
        traits: { composer: 'standard', members: true },
    },
});
