'use strict';

var View = require('mvc/View'),
    Util = require('util/Util');

var HazardCurveDataView = function (options) {
  var _this,
      _initialize,

      // variables
      _curves,
      _selected,

      // methods
      _getColumns,
      _getXValues,
      _onClick,
      _onDeselect,
      _onSelect;

  _this = View(options);

  _initialize = function (options) {

    options = Util.extend({}, options);

    _curves = options.collection;

    _this.render();

    _this.el.addEventListener('click', _onClick);
    _curves.on('add', _this.render);
    _curves.on('remove', _this.render);
    _curves.on('reset', _this.render);
    _curves.on('select', _onSelect);
    _curves.on('deselect', _onDeselect);
  };

  /**
   * Accepts an array of points and returns an array of x-values.
   * Used by render() while building a tbody > th column of x-values.
   *
   * @param  points {Array}
   *         an array of data points in a curve model.
   *
   * @return xPoints {Array}
   *         an array of x-values from the curve model.
   */
  _getXValues = function (points) {
    var xPoints = [];
    for (var i = 0; i < points.length; i++) {
      xPoints.push(points[i][0]);
    }
    return xPoints;
  };

  /**
   * Responds to click event on the HazardCurveDataView.
   * Selects/deselects a curve in the collection when a
   * table column is clicked.
   *
   * @param  e {object}
   *         the click event.
   */
  _onClick = function (e) {
    var el = e.target,
        id,
        selected;

    if (el.nodeName !== 'TD') {
      return;
    }

    // get curve id, and the selected curve in the collection
    id = el.getAttribute('data-id');
    selected = _curves.getSelected();

    // if not selected, select the curve
    if (selected === null || id !== selected.id) {
      _curves.selectById(id);
    }
  };

  /**
   * Responds to a "deselect" event on the curve collection.
   * Removes the "selected" class from all of the selected cells
   * in the table column.
   *
   * @param  curve {object}
   *         the deselected curve.
   */
  _onDeselect = function (curve) {
    var tableCells,
        i;

    // remove selected class
    tableCells = _this.el.querySelectorAll('[data-id="' + curve.id + '"]');
    for (i = 0; i < tableCells.length; i++) {
      tableCells[i].classList.remove('selected');
    }
  };

  /**
   * Responds to a "select" event on the curve collection.
   * Adds the "selected" class to all of the selected cells
   * in the table column.
   *
   * @param  curve {object}
   *         the selected curve.
   */
  _onSelect = function (curve) {
    var tableCells,
        i;

    // add selected class
    tableCells = _this.el.querySelectorAll('[data-id="' + curve.id + '"]');
    for (i = 0; i < tableCells.length; i++) {
      tableCells[i].classList.add('selected');
    }
  };

  /**
   * Render the view.
   */
  _this.render = function () {
    var c,
        i,
        id,
        markup = [],
        label = null,
        point = null,
        curves = [],
        xValues = [];

    curves = _curves.data();

    if (curves.length === 0) {
      _this.el.innerHTML = '<p>There are no curves to display.</p>';
      return;
    }

    // isolate the x-values from the curve data
    xValues = _getXValues(curves[0].get('data'));

    // Build table
    markup.push('<table class="tabular hazard-curve-data-view"><thead>');
    markup.push('<th class="x-values blank"></th>');
    for (c = 0; c < curves.length; c++) {
      label = curves[c].get('label');
      id = curves[c].get('id');
      markup.push('<th>' + label + '</th>');
    }
    markup.push('</thead><tbody>');
    for (i = 0; i < xValues.length; i++) {
      // set x-value as row header
      markup.push('<tr><th>' + xValues[i] + '</th>');
      for (c = 0; c < curves.length; c++) {
        // set y-value as the table cell data
        point = curves[c].get('data')[i][1];
        markup.push('<td data-id="' + id + '">' + point.toExponential(5) + '</td>');
      }
      markup.push('</tr>');
    }
    markup.push('</tbody></table>');
    _this.el.innerHTML = markup.join('');
  };

  /**
   * Clean up event bindings, variables, and methods
   */
  _this.destroy = Util.compose(function () {
    // bindings
    _this.el.removeEventListener('click', _onClick);
    _curves.off('add', _this.render);
    _curves.off('remove', _this.render);
    _curves.off('reset', _this.render);
    _curves.off('select', _onSelect);
    _curves.off('deselect', _onSelect);
    // variables
    _curves = null;
    _selected = null;
    // methods
    _getColumns = null;
    _getXValues = null;
    _onClick = null;
    _onDeselect = null;
    _onSelect = null;
  }, _this.destroy);

  _initialize(options);
  options = null;
  return _this;
};

module.exports = HazardCurveDataView;