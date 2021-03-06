import DefaultModel from './model';
import {generateGuid} from './helpers';
class Collection {
    models = [];
    static Model = DefaultModel;
    constructor (items = [], options = {}) {
        this.options = options;
        this._prepare(items, this.constructor.Model);
        this.onInit();
        return this;
    }

    onInit () {
        return this;
    }

    _prepare (items, Model) {
        items.forEach(item => {
            item._id = item._id || generateGuid();
            this.models.push(new Model(item));
        });
    }

    /**
     * возвращает массив со стейтами моделей
     * @returns {*}
     */
    getState() {
        return this.models.reduce((res, model) => (res.push(model.getState()), res), []);
    }

    last () {
        return this.models[this.size()];
    }

    first () {
        return this.models[0];
    }

    find (prop, value) {
        return this.models.find(model => model.equals(prop, value));
    }

    filter (prop, value) {
        return this.models.filter(model => model.equals(prop, value));
    }

    /**
     * возвращает первую модель у которой свойство prop содержит значение value
     * @param {String} prop
     * @param {String} value
     * @returns {Model}
     */
    findIncludes (prop, value) {
        return this.models.find(model => model.includes(prop, value));
    }

    /**
     * возвращает модели у которых свойство prop содержит значение value
     * @param {String} prop
     * @param {String} value
     * @returns {Array <Model>}
     */
    filterIncludes (prop, value) {
        return this.models.filter(model => model.includes(prop, value));
    }

    findIndex (prop, value) {
        return this.models.findIndex(model => model.equals(prop, value));
    }

    findByIndex (index) {
        return this.models[index];
    }

    remove (model) {
        const index = this.findIndex('_id', model.getState('_id'));
        this.models.splice(index, 1);
        return this;
    }

    reverse () {
        return this.models.reverse();
    }

    isEmpty () {
        return !this.size();
    }

    size () {
        return this.models.length;
    }

    insert (data, index) {
        const Model = this._modelProto();
        let newModel;

        if (data instanceof Model) {
          newModel = data;
        }
        else {
          newModel = new Model(data);
        }

        if (index) {
            this.models.splice(index, 0, newModel);
        }
        else {
            this.models.push(newModel);
        }
        return newModel;
    }

    add (data) {
        const Model = this._modelProto();
        let newModel;
        if (data instanceof Model) {
            newModel = data;
        }
        else {
            newModel = new Model(data);
        }
        this.models.push(newModel);
        return newModel;
    }

    _modelProto () {
      return this.constructor.Model;
    }

    //todo sort
}

export default Collection;
