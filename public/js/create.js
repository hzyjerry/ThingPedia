(function() {
    var triggerMetaData = null;
    // { combinator: ..., trigger: ... }
    // as visible in the UI
    // triggers[0] has combinator == null
    var triggers = [];
    // { combinator: ..., operands: ... }
    // in AST form
    // conversion from triggers to computedTrigger happens in
    // recomputeTrigger
    var computedTrigger = null;

    var actionMetaData = null;
    var actions = [];
    var computedActions = [];

    $(function() {
        $.get('/db/triggers.json', '', function(data, status, xhr) {
            triggerMetaData = data;
            updateTriggerChannels(data);
            updateTriggerOptions(data);
        }, 'json');
        $.get('/db/actions.json', '', function(data, status, xhr) {
            actionMetaData = data;
            updateActionChannels(data);
            updateActionOptions(data);
        }, 'json');

        $('#install-rule').click(function() {
            try {
                var rule = computeRule();

                var url = Rulepedia.Util.computeRuleURI(rule);
                $('#install-rule-url').attr('href', url).text(url);
                $('#install-rule-dialog').modal();
            } catch(e) {
                showErrorDialog(e.message);
            }
        });

        $('#share-rule').click(function() {
            try {
                var rule = computeRule();

                console.log(JSON.stringify(rule));
                $.ajax('/create', { contentType: 'application/json',
                                    data: JSON.stringify(rule),
                                    processData: false,
                                    dataType: 'text',
                                    method: 'POST' }).done(function(data) {
                    document.location.href = '/rule/' + data;
                }).error(function(xhr, status) {
                    showErrorDialog("Sorry, failed to share the rule: " + status);
                });
            } catch(e) {
                showErrorDialog(e.message);
            }
        })
    });

    function showErrorDialog(msg) {
        $('#generic-error-text').text(msg);
        $('#generic-error').modal();
    }

    function computeRule() {
        recomputeTrigger();
        recomputeAction();

        var name = $('#rule-name').val();
        if (name.length == 0)
            throw new Error("You must choose a name for your rule");
        if (computedTrigger == null)
            throw new Error("You must choose at least one condition");
        if (computedActions.length == 0)
            throw new Error("You must choose at least one action");

        return {
            name: name,
            description: "FIXME",
            trigger: computedTrigger,
            actions: computedActions
        };
    }

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

    function recomputeAction() {
        computedActions = [];
        for (var i = 0; i < actions.length; i++) {
            computedActions.push(actions[i].action);
        }
    }

    function changeTrigger(trigger, combinator) {
        for(var i = 0; i < triggers.length; i++) {
            if (triggers[i].trigger == trigger) {
                if (triggers[i].combinator != combinator)
                    triggers[i].combinator = combinator;
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
                break;
            }
        }
    }

    function appendTrigger(channelId, eventId, parsed, description) {
        var objectId;
        for (var i = 0; i < triggerMetaData.length; i++) {
            if (triggerMetaData[i].id == channelId) {
                if (!('objectId' in triggerMetaData[i]))
                    throw new TypeError('Invalid channel');

                objectId = triggerMetaData[i].objectId;
            }
        }
        var trigger = { object: objectId, trigger: eventId, params: parsed };
        console.log('appendTrigger ' + JSON.stringify(trigger));

        var first = triggers.length == 0;
        var obj = { combinator: (first ? undefined : 'and'), trigger: trigger };
        triggers.push(obj);

        var row = $('<li>', { 'class': 'trigger-item row' });
        var combinatorColumn = $('<span>', { 'class': 'col-sm-1' });
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

        var textColumn = $('<span>', { 'class': 'col-sm-6 trigger-item-text' });
        textColumn.append(description);
        row.append(textColumn);

        var removeColumn = $('<span>', { 'class': 'col-sm-3' });
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

    function removeAction(action) {
        for(var i = 0; i < actions.length; i++) {
            if (actions[i].action == action) {
                actions[i].row.remove();
                actions.splice(i, 1);
                break;
            }
        }
    }

    function appendAction(channelId, methodId, parsed, description) {
        var objectId;
        for (var i = 0; i < actionMetaData.length; i++) {
            if (actionMetaData[i].id == channelId) {
                if (actionMetaData[i].interface || !('objectId' in actionMetaData[i]))
                    throw new TypeError('Invalid channel');

                objectId = actionMetaData[i].objectId;
            }
        }

        var action = { object: objectId, method: methodId, params: parsed };
        var obj = { action: action };
        actions.push(obj);

        var row = $('<li>', { 'class': 'action-item row' });
        var emptyColumn = $('<span>', { 'class': 'col-sm-1' });
        row.append(emptyColumn);

        var textColumn = $('<span>', { 'class': 'col-sm-6 action-item-text' });
        textColumn.append(description);
        row.append(textColumn);

        var removeColumn = $('<span>', { 'class': 'col-sm-3' });
        var remove = $('<button>', { 'class': 'btn btn-default' });
        remove.click(function() {
            removeAction(action);
        });
        remove.text('Remove');
        removeColumn.append(remove);
        row.append(removeColumn);
        obj.row = row;

         $('#actions-container').append(row);
    }

    // FIXME: way too many parameters here
    function buildChannelOption(subitem, kind, subKind, channelMeta, isImplements, id, prefix, modal, container, callback) {
        var row = $('<div>', { 'class': 'row' });

        var leftColumn = $('<div>', { 'class': 'col-md-6' });
        var button = $('<button>', { 'class': 'btn btn-default btn-block ' + kind + '-' + subKind + '-select-button',
                                     'id': prefix + '-button',
                                   });
        button.text(subitem.description);
        leftColumn.append(button);

        var rightColumn = $('<div>', { 'class': 'col-md-6' });
        var params = [];
        subitem.params.forEach(function(paramspec) {
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

                // if this subitem comes from an implements, we disambiguate
                // the action text with the name of the channel
                var subitemtext = isImplements ? (subitem.text + " on " + channelMeta.description) :
                    subitem.text;
                var text = (subitemtext + ' ' + paramtext).trim();

                callback(id, subitem.id, parsed, text);
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
    }

    function findInterfaceMeta(metadata, name) {
        for (var i = 0; i < metadata.length; i++) {
            if (metadata[i].id == name)
                return metadata[i];
        }

        throw new Error("Failed to find interface " + name);
    }

    function updateChannelOptions(metadata, kind, subKind, dialogTitle, callback) {
        var placeholder = $('#' + kind + '-placeholder');
        placeholder.empty();

        metadata.forEach(function(item) {
            var id = item.id;

            var prefix = kind + '-' + id + '-' + subKind + '-select';
            var created = Rulepedia.Util.makeModalDialog(prefix,
                                                         dialogTitle);
            var modal = created.modal;
            var body = created.body;

            var container = $('<div>', { 'class': 'container-fluid' });

            item[subKind].forEach(function(subitem) {
                buildChannelOption(subitem, kind, subKind, item, false, id, prefix, modal, container, callback);
            });

            if ('implements' in item) {
                item.implements.forEach(function(interface) {
                    findInterfaceMeta(metadata, interface)[subKind].forEach(function(subitem) {
                        buildChannelOption(subitem, kind, subKind, item, true, id, prefix, modal, container, callback);
                    });
                });
            }

            body.append(container);
            placeholder.append(modal);
        });
    }

    function updateTriggerOptions(triggerMetaData) {
        updateChannelOptions(triggerMetaData, 'trigger', 'events', "Select an event", appendTrigger);
    }

    function updateActionOptions(actionMetaData) {
        updateChannelOptions(actionMetaData, 'action', 'methods', "Select an action", appendAction);
    }

    function updateChannelSelector(metadata, kind, subKind) {
        var container = $('#' + kind + '-channel-select-container');
        container.empty();

        var count = 0;
        var row = null;
        metadata.forEach(function(item) {
            if (row == null || count >= 4) {
                row = $('<div>', { 'class': 'row' });
                container.append(row);
                count = 0;
            }

            if (item.interface)
                return;

            var column = $('<div>', { 'class': 'col-md-3' });
            var button = $('<button>', { 'class': 'btn btn-default btn-block',
                                         'id': kind + '-button-channel-' + item.id,
                                       });
            button.click(function() {
                $('#' + kind + '-channel-select').modal('hide');
                $('#' + kind + '-' + item.id + '-' + subKind + '-select').modal();
            });
            button.text(item.description);
            column.append(button);
            row.append(column);
            count ++;
        });
    }

    function updateTriggerChannels(triggerMetaData) {
        updateChannelSelector(triggerMetaData, 'trigger', 'events');
    }

    function updateActionChannels(actionMetaData) {
        updateChannelSelector(actionMetaData, 'action', 'methods');
    }
})();
