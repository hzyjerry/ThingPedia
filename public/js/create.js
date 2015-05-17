(function() {
    var channelMetaData = null;
    // { combinator: ..., trigger: ... }
    // as visible in the UI
    // triggers[0] has combinator == null
    var triggers = [];
    // { combinator: ..., operands: ... }
    // in AST form
    // conversion from triggers to computedTrigger happens in
    // recomputeTrigger
    var computedTrigger = null;
    // map value name -> value meta
    // for the values produced by the current trigger
    var producedTriggerValues = {};

    var actionInputs = [];
    var actions = [];
    var computedActions = [];

    $(function() {
        $.get('/db/channels.json', '', function(data, status, xhr) {
            channelMetaData = data;
            updateTriggerChannels(data);
            updateTriggerOptions(data);
            updateActionChannels(data);
            updateActionOptions(data);
        }, 'json');

        $('#create-rule').click(function() {
            try {
                var rule = computeRule();

                if (typeof Android !== 'undefined') {
                    Android.installRule(JSON.stringify(rule));
                } else {
                    var url = Rulepedia.Util.computeRuleURI(rule);
                    url = Rulepedia.Util.getShortenedURL(url);

                    setTimeout(function() {
                        $('#install-rule-url').attr('href', url).text(url);
                        $('#install-rule-dialog').modal();

                        $.ajax('/create', { contentType: 'application/json',
                                            data: JSON.stringify(rule),
                                            processData: false,
                                            dataType: 'text',
                                            method: 'POST' }).error(function(xhr, status) {
                            showErrorDialog("Sorry, failed to share the rule: " + status);
                        });

                        $("#qr-code").empty();
                        var qrcode = new QRCode("qr-code");
                        qrcode.makeCode(url);
                    }, 200);
                }
            } catch(e) {
                showErrorDialog(e.message);
            }
        });
    });

    function showErrorDialog(msg) {
        $('#generic-error-text').text(msg);
        $('#generic-error').modal();
    }

    function computeRule() {
        var triggerText = recomputeTrigger();
        var actionText = recomputeAction();

        var name = $('#rule-name').val();
        if (name.length == 0)
            throw new Error("You must choose a name for your rule");
        if (computedTrigger == null)
            throw new Error("You must choose at least one condition");
        if (computedActions.length == 0)
            throw new Error("You must choose at least one action");

        return {
            name: name,
            description: "When " + triggerText + ", " + actionText,
            trigger: computedTrigger,
            actions: computedActions
        };
    }

    function recomputeTrigger() {
        if (triggers.length == 0) {
            computedTrigger = null;
            return '';
        }

        if (triggers.length == 1) {
            computedTrigger = triggers[0].trigger;
            return triggers[0].text;
        }

        computedTrigger = {
            combinator: triggers[1].combinator,
            operands: [
                triggers[0].trigger, triggers[1].trigger
            ]
        };
        var triggerText = triggers[0].text + ' ' +
            triggers[1].combinator + ' ' + triggers[1].text;
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
                triggerText += ' ' + triggers[i].combinator + ' ' +
                    triggers[i].text;
            }
        }

        return triggerText;
    }

    function recomputeAction() {
        computedActions = [];
        var actionText = '';
        for (var i = 0; i < actions.length; i++) {
            computedActions.push(actions[i].action);
            if (i > 0)
                actionText += ', ';
            actionText += actions[i].text;
        }
        return actionText;
    }

    function computeOneTriggerValue(generateMeta, params) {
        if (!(generateMeta.type in producedTriggerValues))
            producedTriggerValues[generateMeta.type] = [];

        var copiedMeta = { id: generateMeta.id,
                           type: generateMeta.type,
                           description: generateMeta.description,
                           text: generateMeta.text };
        ['id', 'type', 'description'].forEach(function(key) {
            if (copiedMeta[key].indexOf('{{') > 0) {
                for (k = 0; k < params.length; k++) {
                    var param = params[k];
                    copiedMeta[key] = copiedMeta[key].replace('{{' + param.name + '}}', param.value);
                }
            }
       });

        producedTriggerValues[copiedMeta.type].push(copiedMeta);
    }

    function recomputeTriggerValue() {
        producedTriggerValues = {};

        var i, j, k;
        for(i = 0; i < triggers.length; i++) {
            var eventMeta = triggers[i].eventMeta;
            for (j = 0; j < eventMeta.generates.length; j++)
                computeOneTriggerValue(eventMeta.generates[j], triggers[i].trigger.params);
        }
        for(i = 0; i < actions.length; i++) {
            var methodMeta = actions[i].methodMeta;
            for (j = 0; j < methodMeta.generates.length; j++)
                computeOneTriggerValue(methodMeta.generates[j], actions[i].action.params);
        }

        updateActionTriggerValueSelectors();
    }

    function updateActionTriggerValueSelectors() {
        for(var i = 0; i < actionInputs.length; i++) {
            actionInputs[i].updateTriggerValueSelectors(producedTriggerValues);
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

        recomputeTriggerValue();
    }

    function appendTrigger(channelMeta, eventMeta, parsed, description) {
        var objectId = channelMeta.objectId;
        var eventId = eventMeta.id;

        var trigger = { object: objectId, trigger: eventId, params: parsed };
        console.log('appendTrigger ' + JSON.stringify(trigger));

        var first = triggers.length == 0;
        var obj = { combinator: (first ? undefined : 'and'), trigger: trigger,
                    channelMeta: channelMeta, eventMeta: eventMeta, text: description };
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
        recomputeTriggerValue();
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

    function appendAction(channelMeta, methodMeta, parsed, description) {
        var objectId;
        if (!('objectId' in channelMeta))
            throw new TypeError('Invalid channel');
        objectId = channelMeta.objectId;
        var methodId = methodMeta.id;

        var action = { object: objectId, method: methodId, params: parsed };
        var obj = { action: action, channelMeta: channelMeta, methodMeta: methodMeta, text: description };
        actions.push(obj);
        console.log('appendAction ' + JSON.stringify(action));

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
         recomputeTriggerValue();
    }

    // FIXME: way too many parameters here
    function buildChannelOption(subMeta, kind, subKind, channelMeta, id, prefix, modal, container, callback) {
        var row = $('<div>', { 'class': 'row' });

        var leftColumn = $('<div>', { 'class': 'col-md-6' });
        var button = $('<button>', { 'class': 'btn btn-default btn-block ' + kind + '-' + subKind + '-select-button',
                                     'id': prefix + '-button',
                                   });
        button.text(subMeta.description);
        leftColumn.append(button);

        var rightColumn = $('<div>', { 'class': 'col-md-6' });
        var params = [];
        subMeta.params.forEach(function(paramspec) {
            var impl = Rulepedia.Util.makeParamInput(paramspec,
                                                     prefix,
                                                     undefined);
            rightColumn.append(impl.element);
            params.push(impl);

            if (kind == 'action') // FIXME layering violation
                actionInputs.push(impl);
        });

        button.click(function() {
            if (params.every(function(p) { return p.validate(); })) {
                var parsed = params.map(function(p) {
                    return p.normalize();
                }).filter(function(p) {
                    return p !== undefined
                });

                var paramtext = params.map(function(p) { return p.text(); }).join(' ');

                var text = (subMeta.text + ' ' + paramtext).trim();

                callback(channelMeta, subMeta, parsed, text);
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
                buildChannelOption(subitem, kind, subKind, item, id, prefix, modal, container, callback);
            });

            body.append(container);
            placeholder.append(modal);
        });
    }

    function updateTriggerOptions(channelMetaData) {
        updateChannelOptions(channelMetaData, 'trigger', 'events', "Select an event", appendTrigger);
    }

    function updateActionOptions(channelMetaData) {
        updateChannelOptions(channelMetaData, 'action', 'methods', "Select an action", appendAction);
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

            var length = item[subKind].length;
            if (length == 0)
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

    function updateTriggerChannels(channelMetaData) {
        updateChannelSelector(channelMetaData, 'trigger', 'events');
    }

    function updateActionChannels(channelMetaData) {
        updateChannelSelector(channelMetaData, 'action', 'methods');
    }
})();
