/** @jsx React.DOM */

var React = require('react/addons');
var Router = require('react-router');
var FluxChildMixin = require('fluxxor').FluxChildMixin;
var StoreWatchMixin = require('fluxxor').StoreWatchMixin;

var TimesheetForm = require('./timesheet.form');

var TimesheetCreate = React.createClass({

  mixins: [
    FluxChildMixin(React)
  ],

  getInitialState: function () {
    return {
      saveText: 'Create',
      timesheet: {}
    };
  },

  save: function () {
    this.getFlux().actions.timesheets.create(this.state.timesheet);
  },

  cancel: function () {
    Router.transitionTo('timesheets');
  },

  render: function () {
    return (
      <TimesheetForm timesheet={this.state.timesheet} save={this.save} cancel={this.cancel} />
    );
  }
});

module.exports = TimesheetCreate;