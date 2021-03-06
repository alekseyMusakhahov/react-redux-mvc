import {Component as ReactComponent, createElement} from 'react';
import { object } from 'prop-types';
import {connect} from 'react-redux';
import hoistStatics from 'hoist-non-react-statics'
import isFunction from 'lodash/isFunction';
import BasicController from './controller';

export function withController (Controller = BasicController) {
    return Component => {
        @connect(state => Controller.prototype.mappedProps(state))
        class Wrapper extends ReactComponent {
            static contextTypes = {
                store: object
            };

            static propTypes = Controller.propTypes;

            state = {
                canRender: false
            };

            constructor (props, context) {
                super(props, context);
                this.store = props.store || context.store;
                Controller.prototype.name = Component.prototype.constructor.name + 'Controller';
                Controller.prototype.dispatch = this.store.dispatch;

                Controller.prototype.getGlobalState = function (prop) {
                    return prop ? this.store.getState()[prop] : this.store.getState();
                }.bind(this);

                const controller = new Controller(props, context);
                Component.prototype.controller = controller;
                controller.onInit().then(() => this.setState({canRender: true}));
            }

            render () {
                const {canRender} = this.state;
                return canRender ? createElement(Component, {...this.props}) : null;
            }
        }
        if (isFunction(Component.prototype.componentWillReceiveProps) && isFunction(Controller.prototype.componentWillReceiveProps)) {
            const fn = Component.prototype.componentWillReceiveProps;
            Component.prototype.componentWillReceiveProps = function (nextPops) {
                Controller.prototype.componentWillReceiveProps.call(Component.prototype.controller, this.props, nextPops);
                fn.call(this, nextPops);
            };
        }
        return hoistStatics(Wrapper, Component);
    };
}