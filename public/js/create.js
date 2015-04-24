(function() {
    var ready = false;
    var triggers = [];
    var computedTrigger = null;

    $.get('/create/triggers', '', function(data, status, xhr) {
        triggers = data;
        updateTriggerChannels();
        updateTriggerOptions();
    }, 'json');

    $(function() {
        // on ready
    });

    function appendTrigger(channelId, eventId, parsed, description) {
        var trigger = { channel: channelId, trigger: eventId, params: parsed };
        console.log('appendTrigger ' + JSON.stringify(trigger));

        if (computedTrigger == null)
            computedTrigger = trigger;
        else if (computedTrigger.hasOwnProperty('combinator'))
            computedTrigger.operands.append(trigger);
        else {
            computedTrigger = {
                combinator: 'and',
                operands: [computedTrigger, trigger],
            };
            description = "and " + description; // FIXME!
        }

        var li = $('<li>');
        li.text(description);
        console.log(description);
        $('#triggers-container').append(li);
    }

    function updateTriggerChannels() {
        var container = $('#trigger-channel-select-container');
        container.empty();

        var count = 0;
        var row = null;
        triggers.forEach(function(trigger) {
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

    function updateTriggerOptions() {
        var placeholder = $('#triggers-placeholder');
        placeholder.empty();

        triggers.forEach(function(trigger) {
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
                var button = $('<button>', { 'class': 'btn',
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
                        console.log(paramtext);
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
