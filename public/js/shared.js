/* scripts shared between all pages */

window.Rulepedia = {
    URL_PREFIX: 'http://localhost:3000/rule/',

    Util: {
        computeRuleURI: function(rule) {
            return Rulepedia.URL_PREFIX + Base64.encodeURI(RawDeflate.deflate(JSON.stringify(rule)));
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
            triggerLabel.append(" from the condition of the rule");
            triggerLabel.hide();
            column.append(triggerLabel);

            row.append(column);
            container.append(row);

            function syncSensitivity() {
                if (input !== undefined)
                    input.prop('disabled', !(isEnabled && !isTriggerValue));
                else
                    element.toggleClass('disabled', !(isEnabled && !isTriggerValue));

                triggerCheckbox.prop('disabled', !isEnabled);
                if (triggerSelector !== undefined)
                    triggerSelector.prop('disabled', !isEnabled);
            }

            function updateTriggerValueSelectors(producedTriggerValues) {
                var normalizedType = paramspec.type == 'textarea' ? 'text' : paramspec.type;
                var producedValues = producedTriggerValues[normalizedType] || [];

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
                    triggerPlaceholder.empty();
                    triggerPlaceholder.append(triggerSelector);
                }
            }

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
            create: null,
            placeholder: "You will be able to choose a picture when you install this rule",
            text: "a picture of my choice",

            normalize: function(paramspec, input) {
                return 'rulepedia:placeholder/picture/' + paramspec.subType;
            },

            validate: function(paramspec, input) {
                return true;
            },

            reset: function(paramspec, input) {
            },
        },

        'contact': {
            create: null,
            placeholder: "You will be able to choose a contact when you install this rule",
            text: "a contact of my choice",

            normalize: function(paramspec, input) {
                return 'rulepedia:placeholder/object/contact/' + paramspec.subType;
            },

            validate: function(paramspec, input) {
                return true;
            },

            reset: function(paramspec, input) {
            },
        },

        'message-destination': {
            create: null,
            placeholder: "You will be able to choose a contact or group when you install this rule",
            text: "a contact or group of my choice",

            normalize: function(paramspec, input) {
                return 'rulepedia:placeholder/object/message-destination/' + paramspec.subType;
            },

            validate: function(paramspec, input) {
                return true;
            },

            reset: function(paramspec, input) {
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
