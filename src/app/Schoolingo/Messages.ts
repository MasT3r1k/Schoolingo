import { MessageType } from './Messages.d';
export type { MessageType };

export class MessageManager {

    public types: MessageType[] = [
        {       // 0
          label: 'message',
          perms: ['all']
        }, {    // 1
          label: 'homework',
          perms: ['student']
        }, {    // 2
          label: 'excusestudent',
          perms: ['parent']
        }, {    // 3
          label: 'ratestudent',
          perms: ['teacher', 'principal']
        }, {    // 4
          label: 'noticeboard',
          perms: ['teacher', 'principal']
        }
    ];

    


}