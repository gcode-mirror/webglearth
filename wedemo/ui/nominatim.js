
/**
 * @fileoverview A class to create a Nominatim autocomplete that will match
 * from an array of data provided via JSONP. The server returns a complex data
 * structure that is used with client-side javascript functions to render the
 * results.
 *
 * More info:
 * http://wiki.openstreetmap.org/wiki/Nominatim
 * http://open.mapquestapi.com/nominatim/
 *
 * @author petr.pridal@klokantech.com (Petr Pridal)
 *
 * Copyright 2011 Klokan Technologies Gmbh (www.klokantech.com)
 */

goog.provide('wedemo.ui.Nominatim');

goog.require('goog.ui.AutoComplete');
goog.require('goog.ui.AutoComplete.InputHandler');
goog.require('goog.ui.AutoComplete.Renderer');

goog.require('wedemo.ui.NominatimMatcher');



/**
 * Factory class to create a rich autocomplete widget that autocompletes an
 * inputbox or textarea from data provided via ajax.  The server returns a
 * complex data structure that is used with client-side javascript functions to
 * render the results.
 * @param {!Element} input Input element or text area.
 * @param {string=} opt_url The Uri of the Nominatim service.
 * @param {Object=} opt_payload Extra parameters for the Jsonp request.
 * @constructor
 * @extends {goog.ui.AutoComplete}
 */
wedemo.ui.Nominatim = function(input, opt_url, opt_payload) {

  // Create a custom renderer that renders rich rows returned from server.
  var customRenderer = {};
  customRenderer.renderRow = function(row, token, node) {
    node.innerHTML = row.data['display_name'] + ' (' + row.data['type'] + ')';
    /* render:
    goog.dom.appendChild(node, goog.dom.createTextNode(
      row.data['display_name']));
    goog.dom.appendChild(node, goog.dom.createDom("span", "ac-type",
        goog.dom.createTextNode(row.data['type'])));
    */
  };

  /**
   * A standard renderer that uses a custom row renderer to display the
   * rich rows generated by this autocomplete widget.
   * @type {!goog.ui.AutoComplete.Renderer}
   */
  var renderer = new goog.ui.AutoComplete.Renderer(null, customRenderer);

  /**
   * A remote matcher that parses rich results returned via JSONP from a server.
   * @type {!wedemo.ui.NominatimMatcher}
   * @private
   */
  this.matcher_ = new wedemo.ui.NominatimMatcher(opt_url, opt_payload);

  /**
   * An input handler that calls select on a row when it is selected.
   * @type {!goog.ui.AutoComplete.InputHandler}
   */
  var inputhandler = new goog.ui.AutoComplete.InputHandler(null, null, false);
  inputhandler.setThrottleTime(300);
  inputhandler.setUpdateDuringTyping(false);
  inputhandler.attachAutoComplete(this);
  inputhandler.attachInputs(input);

  // Create the widget and connect it to the input handler.
  goog.base(this, this.matcher_, renderer, inputhandler);

  this.addEventListener(goog.ui.AutoComplete.EventType.UPDATE, function(e) {
    input.value = e.row['display_name'];
  });

};
goog.inherits(wedemo.ui.Nominatim, goog.ui.AutoComplete);


/**
 * Calls matchHandler on a set of matching rows retrieved from server.
 * @param {string} token The text that should be matched; passed to the server
 *     as the 'token' query param.
 * @param {number} maxMatches The maximum number of matches requested from the
 *     server; passed as the 'max_matches' query param.  The server is
 *     responsible for limiting the number of matches that are returned.
 * @param {Function} matchHandler Callback to execute on the result after
 *     matching.
 */
wedemo.ui.Nominatim.prototype.search =
    function(token, maxMatches, matchHandler) {
  this.matcher_.requestMatchingRows(token, maxMatches, matchHandler);
};
