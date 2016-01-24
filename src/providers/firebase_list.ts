import {Provider} from 'angular2/core';
import {DEFAULT_FIREBASE} from '../angularfire';
import {Observer} from 'rxjs/Observer';
import {FirebaseObservable} from '../utils/firebase_observable';
import {absolutePathResolver} from '../utils/absolute_path_resolver';

export interface FirebaseListConfig {
  token?:any;
  path?: string;
  query?: Array<Array<any>>;
}

export function FirebaseList (config?:FirebaseListConfig):Provider {
  return new Provider(config.token || FirebaseList, {
    useFactory: (url:string) => FirebaseListFactory(absolutePathResolver(url, config.path)),
    deps: [DEFAULT_FIREBASE]
  })
}

export function FirebaseListFactory (absoluteUrl:string): FirebaseObservable<any> {
  return new FirebaseObservable((obs:Observer<any[]>) => {
    var arr:any[] = [];
    this._ref = new Firebase(absoluteUrl);

    this._ref.on('child_added', (child:any) => {
      obs.next(arr = onChildAdded(arr, child));
    });

    this._ref.on('child_moved', (child:any, prevKey:any) => {
      obs.next(arr = onChildMoved(arr, child, prevKey));
    });
  });
}

export function onChildAdded(arr:any[], child:any): any[] {
  var newArray = arr.slice();
  newArray.push(child);
  return newArray;
}

export function onChildMoved(arr:any[], child:any, prevKey:string): any[] {
  return arr.reduce((accumulator:any[], val:any, i:number) => {
    if (!prevKey && i==0) {
      accumulator.push(child);
      accumulator.push(val);
    } else if(val.key() === prevKey) {
      accumulator.push(val);
      accumulator.push(child);
    } else if (val.key() !== child.key()) {
      accumulator.push(val);
    }
    return accumulator;
  }, []);
}