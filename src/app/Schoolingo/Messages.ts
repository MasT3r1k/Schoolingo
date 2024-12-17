import { BehaviorSubject } from 'rxjs';
import { MessageTag, MessageType, messageTypes } from './Messages.d';
export type { MessageTag, MessageType, messageTypes };

export class MessageManager {

    public types: MessageType[] = [
      {       // 0
        label: 'message',
        perms: ['all']
      }, {    // 1
        label: 'homework',
        icon: 'briefcase-2',
        color: 'hsl(197, 42%, 49%)',
        perms: ['student']
      }, {    // 2
        label: 'excusestudent',
        icon: 'file-report',
        color: 'hsl(356, 87%, 41%)',
        perms: ['parent']
      }, {    // 3
        label: 'ratestudent',
        icon: 'thumb-up',
        color: 'hsl(94, 54%, 38%)',
        perms: ['teacher', 'principal']
      }, {    // 5
        label: 'system',
        icon: 'shield',
        color: '#608796',
        perms: ['principal']
      }
    ];

    public tags: MessageTag[] = [
      {
        label: "Vyžaduje potvrzení"
      },
      {
        label: "Důležité"
      }
    ];

    public unreadMessage = new BehaviorSubject(12);

    


}