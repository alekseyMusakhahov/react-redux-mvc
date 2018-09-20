import {get as _get} from 'lodash';
import {Dispatch, Action} from 'redux';
import {Model} from './model';

export interface IControllerActions {
  [name: string]: (any);
}

// Базовый контроллер
export class Controller<T extends Model<any>> {
  // список полей, которые надо получить из стора.
  // чтобы получить вложенные, надо указать их через точку: routing.location
  public static connectedState: string[] = [];
  // действия которые надо обернуть dispatch-ем
  public static actions: any = {};
  public storeKey: string | null = null;
  public name: string = 'BasicController';
  public getGlobalState: () => void = () => {};
  public dispatch: (fn: () => any) => Dispatch<Action> = () => {};
  public componentWillReceiveProps: () => void = () => {};
  public Model: T;

  public constructor(Model: T, ...props) {
    this.Model = Model;
    // this.storeKey = Controller.storeKey;
    // this.actions = Controller.actions;
  }

  /**
   * используется для коннекта к стору
   * @example ['currentContract', 'routing.location:location']
   * @param {[String]} state - свойства стора которые надо приконенктить
   * @returns {*}
   */
  public mappedProps(state) {
    return Controller.connectedState.reduce((result, prop) => {
      let key: string = prop;
      if (prop.includes(':')) {
        const parts: string[] = prop.split(':');
        prop = parts[0];
        key = parts[1];
      }
      return (result[key] = _get(state, prop), result);
    }, {});
  }

  /**
   * диспатчит действие
   * @param args
   */
  public action(...args): Dispatch<Action> {
    const [name, ...restArguments] = args;
    if (typeof name === 'function') {
      return this.dispatch(name.apply(undefined, restArguments));
    }
    const action = Controller.actions[name];
    if (typeof action !== 'function') {
      throw Error('Action must be a function');
    }
    return this.dispatch(action.apply(undefined, restArguments));
  }

  /**
   * запсускается при инициализации, для первоначальных загрузок.
   * ! Пока не выполнится, не происходит первый рендер
   */
  public onInit = (): Promise<any> => Promise.resolve();

  /**
   * Возвращает connected state. Может быть вложенным.
   * @example getState('routing'); getState('routing.location')
   * @param {String} prop
   * @returns {undefined}
   */
  public getState(prop?: string): any {
    if (this.storeKey) {
      return prop ? _get(this.getGlobalState()[this.storeKey], prop) : this.getGlobalState()[this.storeKey];
    }
  }

  /**
   * возвращает ожидающие
   * @returns {*}
   */
  public getWaiting(): object | void {
    if (this.Model) {
      return this.Model.constructor(this.getState()).getWaiting();
    }
    else {
      noModelWarning(this.name);
    }
  }

  public isWaiting(prop): boolean | void {
    if (this.Model) {
      return !!this.Model.constructor(this.getState()).isWaiting(prop);
    }
    else {
      noModelWarning(this.name);
    }
  }

  public isFailed(prop): boolean | void {
    if (this.Model) {
      return !!this.Model.constructor(this.getState()).isFailed(prop);
    }
    else {
      noModelWarning(this.name);
    }
  }

  /**
   * возвращает ошибки
   * @returns {*}
   */
  public getFailed(): object | void {
    if (this.Model) {
      return this.Model.constructor(this.getState()).getFailed();
    }
    else {
      noModelWarning(this.name);
    }
  }
}

function noModelWarning(controllerName: string): void {
  throw new Error(`There is Model provided to ${controllerName}`);
}