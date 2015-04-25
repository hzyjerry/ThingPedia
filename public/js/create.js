(function() {
    // { combinator: ..., trigger: ... }
    // as visible in the UI
    // triggers[0] has combinator == null
    var triggers = [];
    // { combinator: ..., operands: ... }
    // in AST form
    // conversion from triggers to computedTrigger happens in
    // recomputeTrigger
    var computedTrigger = null;

    $.get('/db/triggers.json', '', function(data, status, xhr) {
        updateTriggerChannels(data);
        updateTriggerOptions(data);
    }, 'json');

    function recomputeTrigger() {
        if (triggers.length == 0) {
            computedTrigger = null;
            return;
        }

        if (triggers.length == 1) {
            computedTrigger = triggers[0].trigger;
            return;
        }

        computedTrigger = {
            combinator: triggers[1].combinator,
            operands: [
                triggers[0].trigger, triggers[1].trigger
            ]
        };
        for (var i = 2; i < triggers.length; i++) {
            if (triggers[i].combinator == computedTrigger.combinator) {
                computedTrigger.operands.push(triggers[i].trigger);
            } else {
                computedTrigger = {
                    combinator: triggers[i].combinator,
                    operands: [
                        computedTrigger,
                        triggers[i].trigger
                    ]
                };
            }
        }

        console.log(JSON.stringify(computedTrigger));
    }

    function changeTrigger(trigger, combinator) {
        for(var i = 0; i < triggers.length; i++) {
            if (triggers[i].trigger == trigger) {
                if (triggers[i].combinator != combinator) {
                    triggers[i].combinator = combinator;
                    recomputeTrigger();
                }
                break;
            }
        }
    }

    function removeTrigger(trigger) {
        for(var i = 0; i < triggers.length; i++) {
            if (triggers[i].trigger == trigger) {
                triggers[i].row.remove();
                triggers.splice(i, 1);
                if (triggers.length > 0) {
                    triggers[0].combinator = undefined;
                    if (triggers[0].select)
                        triggers[0].select.remove();
                }
                recomputeTrigger();
                break;
            }
        }
    }

    function appendTrigger(channelId, eventId, parsed, description) {
        var trigger = { channel: channelId, trigger: eventId, params: parsed };
        console.log('appendTrigger ' + JSON.stringify(trigger));

        var first = triggers.length == 0;
        var obj = { combinator: (first ? undefined : 'and'), trigger: trigger };
        triggers.push(obj);
        recomputeTrigger();

        var row = $('<li>', { 'class': 'trigger-item row' });
        var combinatorColumn = $('<span>', { 'class': 'col-sm-2' });
        if (!first) {
            var select = $('<select class="form-control center"><option value="and">and</option>' +
                           '<option value="or">or</option></select>');
            select.val('and');
            select.on('change', function() {
                changeTrigger(trigger, select.val());
            });
            obj.select = select;
            combinatorColumn.append(select);
        } else {
            combinatorColumn.text('');
        }
        row.append(combinatorColumn);

        var textColumn = $('<span>', { 'class': 'col-sm-4 trigger-item-text' });
        textColumn.text(description);
        row.append(textColumn);

        var removeColumn = $('<span>', { 'class': 'col-sm-4' });
        var remove = $('<button>', { 'class': 'btn btn-default' });
        remove.click(function() {
            removeTrigger(trigger);
        });
        remove.text('Remove');
        removeColumn.append(remove);
        row.append(removeColumn);
        obj.row = row;

        $('#triggers-container').append(row);
    }

    function updateTriggerChannels(triggerMetaData) {
        var container = $('#trigger-channel-select-container');
        container.empty();

        var count = 0;
        var row = null;
        triggerMetaData.forEach(function(trigger) {
            if (row == null || count >= 4) {
                row = $('<div>', { 'class': 'row' });
                container.append(row);
                count = 0;
            }

            var column = $('<div>', { 'class': 'col-md-3' });
            var button = $('<button>', { 'class': 'btn',
                                         'id': 'trigger-button-channel-' + trigger.id,
                                       });
            button.click(function() {
                $('#trigger-channel-select').modal('hide');
                $('#trigger-' + trigger.id + '-event-select').modal();
            });
            button.text(trigger.description);
            column.append(button);
            row.append(column);
            count ++;
        });
    }

    function updateTriggerOptions(triggerMetaData) {
        var placeholder = $('#triggers-placeholder');
        placeholder.empty();

        triggerMetaData.forEach(function(trigger) {
            var id = trigger.id;

            var prefix = 'trigger-' + id + '-event-select';
            var created = Rulepedia.Util.makeModalDialog(prefix,
                                                         "Select an event");
            var modal = created.modal;
            var body = created.body;

            var container = $('<div>', { 'class': 'container-fluid' });

            trigger.events.forEach(function(event) {
                var row = $('<div>', { 'class': 'row' });

                var leftColumn = $('<div>', { 'class': 'col-md-6' });
                var button = $('<button>', { 'class': 'btn trigger-event-select-button',
                                             'id': prefix + '-button',
                                           });
                button.text(event.description);
                leftColumn.append(button);

                var rightColumn = $('<div>', { 'class': 'col-md-6' });
                var params = [];
                event.params.forEach(function(paramspec) {
                    var impl = Rulepedia.Util.makeParamInput(paramspec,
                                                             prefix,
                                                             undefined);
                    rightColumn.append(impl.element);
                    params.push(impl);
                });

                button.click(function() {
                    if (params.every(function(p) { return p.validate(); })) {
                        var parsed = params.map(function(p) {
                            return { name: p.paramspec.id,
                                     value: p.normalize() };
                        }).filter(function(p) {
                            return p.value !== undefined
                        });

                        var paramtext = params.map(function(p) { return p.text(); }).join(' ');
                        var text = (event.text + ' ' + paramtext).trim();

                        appendTrigger(id, event.id, parsed, text);
                        modal.modal('hide');
                    } else {
                        console.log('validation failed');
                        // FIXME: notify the user
                    }
                });
                modal.on('hidden.bs.modal', function() {
                    params.forEach(function(p) { p.reset(); });
                });

                row.append(leftColumn);
                row.append(rightColumn);
                container.append(row);
            });

            body.append(container);
            placeholder.append(modal);
        });
    }
})();
