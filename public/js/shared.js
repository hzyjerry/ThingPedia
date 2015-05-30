/* scripts shared between all pages */

if (!String.prototype.endsWith) {
  String.prototype.endsWith = function(searchString, position) {
      var subjectString = this.toString();
      if (position === undefined || position > subjectString.length) {
        position = subjectString.length;
      }
      position -= searchString.length;
      var lastIndex = subjectString.indexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
  };
}

window.onload = function() {
  if (typeof Android !== 'undefined') {
    $('.navbar').remove();
  }
};

window.Rulepedia = {
    URL_PREFIX: 'https://vast-hamlet-6003.herokuapp.com/rule/',

    Util: {
        getShortenedURL: function(url, callback) {
          var xhr = new XMLHttpRequest();
          xhr.onreadystatechange = function() {
              if (this.readyState == 4 && this.status == 200) {
                  var results = JSON.parse(this.responseText);
                  callback(results["id"]);
              }
          }
          xhr.open('POST', 'https://www.googleapis.com/urlshortener/v1/url?key=AIzaSyBS7QN9vpHN1738eubc8Ic-lZGHs_JSsQA', true);
          xhr.setRequestHeader('Content-type','application/json');
          xhr.send(JSON.stringify({ "longUrl": url } ));
        },

        computeRuleURI: function(rule) {
            //var zstream = ZLIB.deflateInit();
            //return Rulepedia.URL_PREFIX + Base64.encodeURI(zstream.deflate(JSON.stringify(rule)));
            return Rulepedia.URL_PREFIX + Base64.encodeURI(JSON.stringify(rule));
        },

        getBackRule: function(url) {
          url = url.substring(url.lastIndexOf("/") + 1);
          //var zstream = ZLIB.inflateInit();
          //return JSON.parse(zstream.inflate(Base64.decode(url)));
          return JSON.parse(Base64.decode(url));
        },

        makeModalDialog: function(id, title) {
            var modal = $('<div>', { 'class': 'modal fade',
                                     'aria-hidden': 'true',
                                     'role': 'dialog',
                                     'id': id,
                                     'aria-labelled-by': id + '-title' });
            var dialog = $('<div>', { 'class': 'modal-dialog' });
            var content = $('<div>', { 'class': 'modal-content' });
            var header = $('<div>', { 'class': 'modal-header' });
            var close = $('<button>', { 'class': 'close',
                                        'data-dismiss': 'modal',
                                        'aria-label': "Close",
                                      });
            var x = $('<span>', { 'aria-hidden': 'true' });
            x.text('×');
            close.append(x);

            var h4 = $('<h4>', { 'class': 'modal-title',
                                 'id': id + '-title' });
            h4.text(title);
            header.append(close);
            header.append(h4);
            content.append(header);

            var body = $('<div>', { 'class': 'modal-body' });
            content.append(body);
            dialog.append(content);
            modal.append(dialog);

            return { modal: modal, body: body };
        },

        makeParamInput: function(paramspec, prefix, currentValue) {
            var impl = Rulepedia.DataTypes[paramspec.type];
            if (impl === undefined)
                throw new TypeError("Invalid param type " + paramspec.type);
            var input, element;
            if (impl.create) {
                input = impl.create(paramspec,
                                    prefix,
                                    currentValue);
                input.addClass('form-control');
                input.addClass('param-form-control');
                element = input;
            } else if (impl.placeholder) {
                element = $('<small>', {'class': 'block placeholder'});
                element.text(impl.placeholder);
            } else {
                throw new TypeError("Cannot construct input of type " + paramspec.type);
            }

            var container = $('<div>', { 'class': 'form-group container-fluid' });
            var row = $('<div>', { 'class': 'row' });
            var checkbox = undefined;
            var isEnabled = true;
            var isTriggerValue = false;
            var column;
            if (paramspec.optional) {
                isEnabled = false;
                var leftColumn = $('<div>', { 'class': 'col-xs-1' });
                checkbox = $('<input>', { 'type': 'checkbox',
                                          'value': 'on',
                                          'id': prefix + '-' + paramspec.id
                                          + '-valid' });
                if (currentValue !== undefined)
                    checkbox.prop('checked', true);
                else if (input !== undefined)
                    input.prop('disabled', true);
                else
                    element.addClass('disabled');
                checkbox.on('change', function() {
                    isEnabled = checkbox.prop('checked');
                    syncSensitivity();
                });

                leftColumn.append(checkbox);
                row.append(leftColumn);
                column = $('<div>', { 'class': 'col-xs-10' });
            } else {
                column = $('<div>', { 'class': 'col-xs-11' });
            }

            var label = $('<label>');
            label.text(paramspec.description);
            label.append(element);
            column.append(label);

            var syncSensitivity, updateTriggerValueSelectors;

            if (paramspec.canTrigger === false) {
                syncSensitivity = function() {
                    if (input !== undefined)
                        input.prop('disabled', !(isEnabled && !isTriggerValue));
                    else
                        element.toggleClass('disabled', !(isEnabled && !isTriggerValue));
                };

                updateTriggerValueSelectors = function() { };
            } else if (paramspec.type != 'textarea') {
                var triggerSelector = undefined;
                var triggerPlaceholder = $('<span>');
                var selectedTriggerMeta = undefined;
                var triggerLabel = $('<label>');
                var triggerCheckbox = $('<input>', { 'type': 'checkbox' });
                triggerCheckbox.on('change', function() {
                    isTriggerValue = triggerCheckbox.prop('checked');
                    syncSensitivity();
                })
                triggerLabel.append(triggerCheckbox);
                triggerLabel.append("or use ");
                triggerLabel.append(triggerPlaceholder);
                triggerLabel.append(" from the condition of the spell");
                triggerLabel.hide();
                column.append(triggerLabel);

                syncSensitivity = function() {
                    if (input !== undefined)
                        input.prop('disabled', !(isEnabled && !isTriggerValue));
                    else
                        element.toggleClass('disabled', !(isEnabled && !isTriggerValue));

                    triggerCheckbox.prop('disabled', !isEnabled);
                    if (triggerSelector !== undefined)
                        triggerSelector.prop('disabled', !isEnabled);
                };

                updateTriggerValueSelectors = function(producedTriggerValues) {
                    var normalizedType = paramspec.type;
                    var producedValues;

                    // anything goes into text!
                    if (normalizedType == 'text') {
                        producedValues = [];
                        for (var type in producedTriggerValues) {
                            producedValues = producedValues.concat(producedTriggerValues[type]);
                        }
                    } else {
                        producedValues = producedTriggerValues[normalizedType] || [];
                    }

                    if (producedValues.length == 0) {
                        triggerLabel.hide();
                        triggerSelector = undefined;
                    } else if (producedValues.length == 1) {
                        triggerLabel.show();
                        triggerSelector = undefined;
                        triggerPlaceholder.text(producedValues[0].description);
                        selectedTriggerMeta = producedValues[0];
                    } else {
                        triggerLabel.show();
                        triggerSelector = $('<select>');
                        for (var i = 0; i < producedValues.length; i++) {
                            var option = $('<option>', { 'value': producedValues[i].id });
                            option.text(producedValues[i].description);
                            triggerSelector.append(option);
                        }
                        triggerSelector.on('change', function() {
                            var chosen = triggerSelector.val();
                            for (var i = 0; i < producedValues.length; i++) {
                                if (producedValues[i].id == chosen) {
                                    selectedTriggerMeta = producedValues[i];
                                    return;
                                }
                            }
                            selectedTriggerMeta = undefined;
                        });
                        selectedTriggerMeta = producedValues[0];
                        triggerPlaceholder.empty();
                        triggerPlaceholder.append(triggerSelector);
                    }
                };
            } else {
                var triggerSelector = undefined;
                var triggerContainer = $('<span>');
                var selectedTriggerMeta = undefined;
                triggerContainer.hide();
                function clickTriggerLink() {
                    if (selectedTriggerMeta == undefined)
                        return;
                    input.val(input.val() + '{{' + selectedTriggerMeta.id + '}}');
                }
                column.append(triggerContainer);

                syncSensitivity = function() {
                    if (input !== undefined)
                        input.prop('disabled', !isEnabled);
                    else
                        element.toggleClass('disabled', !isEnabled);

                    triggerContainer.toggleClass('disabled', !isEnabled);
                    if (triggerSelector !== undefined)
                        triggerSelector.prop('disabled', !isEnabled);
                };

                updateTriggerValueSelectors = function(producedTriggerValues) {
                    var normalizedType = 'text';
                    var producedValues = [];
                    for (var type in producedTriggerValues) {
                        producedValues = producedValues.concat(producedTriggerValues[type]);
                    }

                    if (producedValues.length == 0) {
                        triggerContainer.hide();
                        triggerSelector = undefined;
                    } else if (producedValues.length == 1) {
                        triggerContainer.show();
                        triggerSelector = undefined;
                        var triggerLink = $('<a>');
                        triggerLink.prop('href', '#');
                        triggerLink.on('click', clickTriggerLink);
                        triggerLink.text("Add " + producedValues[0].description + " from the condition of the spell");
                        triggerContainer.empty();
                        triggerContainer.append(triggerLink);
                        selectedTriggerMeta = producedValues[0];
                    } else {
                        triggerContainer.show();
                        var triggerLeft = $('<a>');
                        triggerLeft.prop('href', '#');
                        triggerLeft.on('click', clickTriggerLink);
                        triggerLeft.text("Add ");
                        triggerSelector = $('<select>');
                        for (var i = 0; i < producedValues.length; i++) {
                            var option = $('<option>', { 'value': producedValues[i].id });
                            option.text(producedValues[i].description);
                            triggerSelector.append(option);
                        }
                        triggerSelector.on('change', function() {
                            var chosen = triggerSelector.val();
                            for (var i = 0; i < producedValues.length; i++) {
                                if (producedValues[i].id == chosen) {
                                    selectedTriggerMeta = producedValues[i];
                                    return;
                                }
                            }
                            selectedTriggerMeta = undefined;
                        });
                        selectedTriggerMeta = producedValues[0];
                        var triggerRight = $('<a>');
                        triggerRight.prop('href', '#');
                        triggerRight.on('click', clickTriggerLink);
                        triggerRight.text(" from the condition of the spell");
                        triggerContainer.empty();
                        triggerContainer.append(triggerLeft);
                        triggerContainer.append(triggerSelector);
                        triggerContainer.append(triggerRight);
                    }
                };
            }

            row.append(column);
            container.append(row);

            return { element: container,
                     paramspec: paramspec,
                     validate: function() {
                         if (paramspec.optional && !isEnabled)
                            return true;
                         if (isTriggerValue)
                            return true;
                         return impl.validate(paramspec, input);
                     },
                     normalize: function() {
                         if (!isEnabled)
                            return undefined;
                         if (isTriggerValue)
                            return { name: paramspec.id,
                                     'trigger-value': selectedTriggerMeta.id };
                         else
                            return { name: paramspec.id,
                                     value: impl.normalize(paramspec, input) };
                     },
                     text: function() {
                         if (paramspec.optional && !isEnabled)
                             return '';
                         else if (isTriggerValue)
                             return ((paramspec.text || '') + ' ' + selectedTriggerMeta.text).trim();
                         else if (impl.placeholder)
                             return ((paramspec.text || '') + ' ' + impl.text).trim();
                         else
                             return ((paramspec.text || '') + ' ' + input.val()).trim();
                     },
                     reset: function() {
                         impl.reset(paramspec, input);
                         if (checkbox !== undefined) {
                             checkbox.prop('checked', false);
                             isEnabled = false;
                         }
                         if (triggerCheckbox !== undefined)
                            triggerCheckbox.prop('checked', false);
                         isTriggerValue = false;
                         syncSensitivity();
                     },
                     updateTriggerValueSelectors: updateTriggerValueSelectors
                   };
        }
    },

    DataTypes: {
        'text': {
            create: function(paramspec, prefix, currentValue) {
                if (currentValue === undefined)
                    currentValue = '';

                return $('<input>', { 'type': 'text',
                                      'value': currentValue,
                                      'id': prefix + '-' + paramspec.id });
            },

            normalize: function(paramspec, input) {
                return input.val();
            },

            validate: function(paramspec, input) {
                return input.val().length > 0;
            },

            reset: function(paramspec, input) {
                input.val('');
            },
        },

        'time': {
            create: function(paramspec, prefix, currentValue) {
                if (currentValue === undefined)
                    currentValue = '';

                return $('<input>', { 'type': 'text',
                                      'value': (currentValue != '' ? currentValue + " ms" : ''),
                                      'id': prefix + '-' + paramspec.id });
            },

            normalize: function(paramspec, input) {
                // FIXME do something better
                var value = input.val();
                if (value.endsWith('ms'))
                    return parseInt(value).toString();
                else if (value.endsWith('s'))
                    return (1000 * parseInt(value)).toString();
                else if (value.endsWith('m'))
                    return (60000 * parseInt(value)).toString();
                else if (value.endsWith('h'))
                    return (3600000 * parseInt(value)).toString();
                else if (value.endsWith('d'))
                    return (24 * 3600 * 1000 * parseInt(value)).toString();
                else
                    throw new TypeError('invalid time specification');
            },

            validate: function(paramspec, input) {
                var value = input.val();
                return value.endsWith('ms') || value.endsWith('s') ||
                    value.endsWith('m') || value.endsWith('h') || value.endsWith('d');
            },

            reset: function(paramspec, input) {
                input.val('');
            },
        },

        'textarea': {
            create: function(paramspec, prefix, currentValue) {
                if (currentValue === undefined)
                    currentValue = '';

                var element = $('<textarea>', { 'id': prefix + '-' + paramspec.id });
                element.text(currentValue);
                return element;
            },

            normalize: function(paramspec, input) {
                return input.val();
            },

            validate: function(paramspec, input) {
                return input.val().length > 0;
            },

            reset: function(paramspec, input) {
                input.val('');
            },
        },

        'picture': {
            create: function(paramspec, prefix, currentValue) {
                if (currentValue === undefined)
                    currentValue = '';

                return $('<input>', { 'type': 'url',
                                      'value': currentValue,
                                      'id': prefix + '-' + paramspec.id });
            },

            normalize: function(paramspec, input) {
                return input.val();
            },

            validate: function(paramspec, input) {
                return input.val().length > 0;
            },

            reset: function(paramspec, input) {
                input.val('');
            },
        },

        'device': {
            create: null,
            placeholder: "Sabrina will choose a device when she learns this spell",
            text: "the closest device",

            normalize: function(paramspec, input) {
                return 'https://rulepedia.stanford.edu/oid/placeholder/device/' + (paramspec.subType || 'any');
            },

            validate: function(paramspec, input) {
                return true;
            },

            reset: function(paramspec, input) {
            },
        },

        'contact': {
            create: function(paramspec, prefix, currentValue) {
                if (currentValue === undefined) {
                    if (paramspec.subType == 'tel')
                        currentValue = 'tel:555-555-5555'
                    else
                        currentValue = '';
                }

                return $('<input>', { 'type': paramspec.subType == 'email' ? 'email' : 'text',
                                      'value': currentValue,
                                      'id': prefix + '-' + paramspec.id });
            },

            normalize: function(paramspec, input) {
                if (paramspec.subType == 'email')
                    return 'mailto:' + input.val().trim();
                else
                    return input.val().trim();
            },

            validate: function(paramspec, input) {
                return input.val().length > 0;
            },

            reset: function(paramspec, input) {
                if (paramspec.subType == 'tel')
                    input.val('tel:555-555-5555');
                else
                    input.val('');
            },
        },

        'message-destination': {
            create: function(paramspec, prefix, currentValue) {
                if (currentValue === undefined)
                    currentValue = 'tel:555-555-5555';

                return $('<input>', { 'type': 'text',
                                      'value': currentValue,
                                      'id': prefix + '-' + paramspec.id });
            },

            normalize: function(paramspec, input) {
                return input.val();
            },

            validate: function(paramspec, input) {
                return input.val().length > 0;
            },

            reset: function(paramspec, input) {
                input.val('tel:555-555-5555');
            },
        },

        'temperature': {
            create: function(paramspec, prefix, currentValue) {
                if (currentValue === undefined)
                    currentValue = '0 °C';

                return $('<input>', { 'type': 'text',
                                      'value': currentValue,
                                      'id': prefix + '-' + paramspec.id });
            },

            normalize: function(paramspec, input) {
                // FIXME: convert everything to C
                return input.val();
            },

            validate: function(paramspec, input) {
                var value = input.val();
                return value.match(/[-+]?([0-9]+)(\.[0-9]+)?\s*(°C|°F|C|F|K)/) != null;
            },

            reset: function(paramspec, input) {
                input.val('0 °C');
            },
        },

        'select': {
            create: function(paramspec, prefix, currentValue) {
                var element = $('<select>', { 'id': prefix + '-' + paramspec.id });
                for (var optId in paramspec.options) {
                    var option = paramspec.options[optId];
                    var optionElement = $('<option>', { 'value': optId });
                    optionElement.text(option);
                    element.append(optionElement);
                }

                if (currentValue !== undefined)
                    element.val(currentValue);
                else
                    element.val(paramspec.defaultOption);
                return element;
            },

            normalize: function(paramspec, input) {
                return input.val();
            },

            validate: function(paramspec, input) {
                return true;
            },

            reset: function(paramspec, input) {
                input.val(paramspec.defaultOption);
            },

        },
    }
};
