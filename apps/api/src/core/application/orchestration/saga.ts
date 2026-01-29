import {type Observable} from 'rxjs';
import {type Command} from '../bus/command';

export interface Saga<TEvent = any> {
  (event$: Observable<TEvent>): Observable<Command<any>>;
}
