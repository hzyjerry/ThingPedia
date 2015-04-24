/* scripts shared between all pages */

window.Rulepedia = {
    Util: {
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
            var input = impl.create(paramspec,
                                    prefix,
                                    currentValue);
            input.attr('class', 'form-control');

            var container;
            if (paramspec.hasOwnProperty('description'))
                container = $('<div>', { 'class': 'form-group' });
            else
                container = $('<span>', { 'class': 'form-group' });
            var checkbox = undefined;
            if (paramspec.optional) {
                checkbox = $('<input>', { 'type': 'checkbox',
                                          'value': 'on',
                                          'id': prefix + '-' + paramspec.id
                                          + '-valid' });
                if (currentValue !== undefined)
                    checkbox.prop('checked', true);
                else
                    input.prop('disabled', true);
                checkbox.on('change', function() {
                    input.prop('disabled', !checkbox.prop('checked'));
                });

                container.append(checkbox);
            }

            var label = $('<label>');
            label.text(paramspec.description);
            label.append(input);
            container.append(label);

            return { element: container,
                     paramspec: paramspec,
                     validate: function() {
                         return impl.validate(paramspec, input, checkbox);
                     },
                     normalize: function() {
                         return impl.normalize(paramspec, input, checkbox);
                     },
                     text: function() {
                         if (paramspec.optional && !checkbox.prop('checked'))
                             return '';
                         else
                             return (paramspec.text + ' ' + input.val()).trim();
                     },
                     reset: function() {
                         impl.reset(paramspec, input);
                         if (checkbox !== undefined) {
                             checkbox.prop('checked', false);
                             input.prop('disabled', true);
                         }
                     },
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

            normalize: function(paramspec, input, checkbox) {
                if (paramspec.optional && !checkbox.prop('checked'))
                    return undefined;
                else
                    return input.val();
            },

            validate: function(paramspec, input, checkbox) {
                if (paramspec.optional && !checkbox.prop('checked'))
                    return true;
                else
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

            normalize: function(paramspec, input, checkbox) {
                if (paramspec.optional && !checkbox.prop('checked'))
                    return undefined;
                else
                    return input.val();
            },

            validate: function(paramspec, input, checkbox) {
                if (paramspec.optional && !checkbox.prop('checked'))
                    return true;
                else
                    return input.val().length > 0;
            },

            reset: function(paramspec, input) {
                input.val('');
            },
        },

        'facebook-contact': {
            create: function(paramspec, prefix, currentValue) {
                if (currentValue === undefined)
                    currentValue = '';

                // FIXME should be a dropdown of some form, populated with
                // FB contacts
                return $('<input>', { 'type': 'text',
                                      'value': currentValue,
                                      'id': prefix + '-' + paramspec.id });
            },

            normalize: function(paramspec, input, checkbox) {
                if (paramspec.optional && !checkbox.prop('checked'))
                    return undefined;
                else
                    return input.val();
            },

            validate: function(paramspec, input, checkbox) {
                // FIXME
                return true;
            },

            reset: function(paramspec, input) {
                input.val('');
            },
        },

        'temperature': {
            create: function(paramspec, prefix, currentValue) {
                if (currentValue === undefined)
                    currentValue = '0.0 °C';

                return $('<input>', { 'type': 'text',
                                      'value': currentValue,
                                      'id': prefix + '-' + paramspec.id });
            },

            normalize: function(paramspec, input, checkbox) {
                if (paramspec.optional && !checkbox.prop('checked'))
                    return undefined;
                else {
                    // FIXME: convert everything to C
                    return input.val();
                }
            },

            validate: function(paramspec, input) {
                var value = input.val();
                if (paramspec.optional && !checkbox.prop('checked') && value.length == 0)
                    return true;
                else
                    value.match(/[-+]?([0-9]+)(\.[0-9]+)?\s*(°C,°F,C,F,K)/) != null;
            },

            reset: function(paramspec, input) {
                input.val('');
            },
        },

        'select': {
            create: function(paramspec, prefix, currentValue) {
                var element = $('<select>', { 'id': prefix + '-' + paramspec.id });
                for (var optId in paramspec.options) {
                    var option = paramspec.options[optId];
                    var optionElement = $('<option>', { 'id': prefix + '-' + paramspec.id + '-' + optId });
                    optionElement.text(option);
                    element.append(option);
                }
                if (currentValue !== undefined)
                    element.val(currentValue);
                else
                    element.val(paramspec.defaultOption);
                return element;
            },

            normalize: function(paramspec, input, checkbox) {
                if (paramspec.optional && !checkbox.prop('checked'))
                    return undefined;
                else
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
