(function() {
    var counter = 0;

    var EventSource = {
        'polling':
            { 'polling-interval': { description: "Polling interval (ms)", type: 'integer', default: '30000' } },
        'polling-http':
            { 'polling-interval': { description: "Polling interval (ms)", 'type': 'integer', default: '30000' },
              'url': { description: "URL", type: 'text', default: '{{url}}' } },
        'sse': { 'url': { description: "URL", type: 'text', default: '{{url}}' } },
        'broadcast-receiver':
            { 'intent-action': { description: "Action", type: 'text', default: '' },
              'intent-category': { description: "Category", type: 'text', default: '', optional: true } },
        'omlet': { }
    };

    var ParamTypes = {
        'text': "Text",
        'textarea': "Text area",
        'time': "Time interval",
        'picture': "Picture (base64 data: URI)",
        'contact': "Contact URI",
        'message-destination': "Message destination (contact or group)",
        'temperature': "Temperature",
        'select': "Multiple choice option",
    };

    var GeneratesType = {
        'text': "Free text",
        'time': "Time interval (milliseconds)",
        'number': "Numeric value (int or double)",
        'picture': "Picture (base64 data: URI)",
        'contact': "Contact URI",
        'message-destination': "Message destination (contact or group)",
    };

    function addEventSource(trigger) {
        var container = $('<div>', { 'class': 'event-source well form-inline' });
        var row;

        counter++;
        row = $('<div>', { 'class': 'form-group' });
        row.append($('<label>', { 'for': 'event-source-id-' + counter }).text("Id "));
        row.append($('<input>', { 'type': 'text', 'class': 'form-control event-source-id', 'id': 'event-source-id-' + counter }));
        container.append(row);

        row = $('<div>', { 'class': 'form-group' });
        row.append($('<label>', { 'for': 'event-source-type-' + counter }).text("Type "));
        var select = $('<select class="form-control event-source-type" id="event-source-type="' + counter +'">' +
            '<option value="polling" selected="selected">Periodic poll</option>' +
            '<option value="polling-http">Periodic HTTP GET</option>' +
            '<option value="sse">Server Sent Events</option>' +
            '<option value="broadcast-receiver">Android Intent BroadcastReceiver</option>' +
            '<option value="omlet">Omlet messages</option></select>');
        select.on('change', function() {
            updateParams(select.val());
        })
        row.append(select);
        container.append(row);

        var paramsContainer = $('<div>');
        function updateParams(selected) {
            paramsContainer.empty();

            for (var name in EventSource[selected]) {
                var param = EventSource[selected][name];
                var row = $('<div>', { 'class': 'form-group event-source-param' });
                row.append($('<label>', { 'for': 'event-source-param-' + name + '-' + counter }).text(param.description + " "));
                row.append($('<input>', { 'type': 'text', 'class': 'form-control event-source-param-' + name,
                                          'id': 'event-source-param-' + name + '-' + counter,
                                          'data-param-name': name }).val(param.default));
                paramsContainer.append(row);
            }
        }
        container.append(paramsContainer);
        updateParams('polling');

        row = $('<div>', { 'class': 'form-group' });
        var button = $('<button>', { 'class': 'btn btn-default' }).text("Remove").on('click', function() {
            container.remove();
        });
        row.append(button);
        container.append(row);

        if (trigger == null)
            $('#placeholder-shared-event-sources').append(container);
        else
            trigger.append(container);
    }

    function addParam(outer) {
        var container = $('<div>', { 'class': 'param well' });
        var row;

        counter++;
        row = $('<div>', { 'class': 'form-group' });
        row.append($('<label>', { 'for': 'param-id-' + counter }).text("Id"));
        row.append($('<input>', { 'type': 'text', 'class': 'form-control param-id', 'id': 'param-id-' + counter }));
        container.append(row);

        row = $('<div>', { 'class': 'form-group' });
        row.append($('<label>', { 'for': 'param-description-' + counter }).text("Description"));
        row.append($('<input>', { 'type': 'text', 'class': 'form-control param-description', 'id': 'param-description-' + counter }));
        container.append(row);

        row = $('<div>', { 'class': 'form-group' });
        row.append($('<label>', { 'for': 'param-text-' + counter }).text("Text"));
        row.append($('<input>', { 'type': 'text', 'class': 'form-control param-text', 'id': 'param-text-' + counter }));
        container.append(row);

        row = $('<div>', { 'class': 'form-group' });
        row.append($('<label>', { 'for': 'param-type-' + counter }).text("Type"));
        var select = $('<select>', { 'class': 'form-control param-type', 'id': 'param-type-' + counter });
        for (var type in ParamTypes) {
            var description = ParamTypes[type];
            select.append($('<option>', { 'value': type }).text(description));
        }
        row.append(select);
        container.append(row);

        row = $('<div>', { 'class': 'form-group' });
        row.append($('<input>', { 'type': 'checkbox', 'class': 'form-control param-optional', 'id': 'param-optional-' + counter }));
        row.append($('<label>', { 'for': 'param-optional-' + counter }).text("Optional"));
        container.append(row);

        row = $('<div>', { 'class': 'form-group' });
        var button = $('<button>', { 'class': 'btn btn-default' }).text("Remove").on('click', function() {
            container.remove();
        });
        row.append(button);
        container.append(row);

        outer.append(container);
    }

    function addGenerates(outer) {
        var container = $('<div>', { 'class': 'generates well' });
        var row;

        counter++;
        row = $('<div>', { 'class': 'form-group' });
        row.append($('<label>', { 'for': 'generates-id-' + counter }).text("Id"));
        row.append($('<input>', { 'type': 'text', 'class': 'form-control param-id', 'id': 'generates-id-' + counter }));
        container.append(row);

        row = $('<div>', { 'class': 'form-group' });
        row.append($('<label>', { 'for': 'generates-description-' + counter }).text("Description"));
        row.append($('<input>', { 'type': 'text', 'class': 'form-control param-description', 'id': 'generates-description-' + counter }));
        container.append(row);

        row = $('<div>', { 'class': 'form-group' });
        row.append($('<label>', { 'for': 'generates-text-' + counter }).text("Text"));
        row.append($('<input>', { 'type': 'text', 'class': 'form-control param-text', 'id': 'generates-text-' + counter }));
        container.append(row);

        row = $('<div>', { 'class': 'form-group' });
        row.append($('<label>', { 'for': 'generates-type-' + counter }).text("Type"));
        var select = $('<select>', { 'class': 'form-control param-type', 'id': 'generates-type-' + counter });
        for (var type in GeneratesType) {
            var description = GeneratesType[type];
            select.append($('<option>', { 'value': type }).text(description));
        }
        row.append(select);
        container.append(row);

        row = $('<div>', { 'class': 'form-group' });
        var button = $('<button>', { 'class': 'btn btn-default' }).text("Remove").on('click', function() {
            container.remove();
        });
        row.append(button);
        container.append(row);

        outer.append(container);
    }

    function addTrigger() {
        var container = $('<div>', { 'class': 'trigger well form-inline' });
        var row, block;

        counter++;
        block = $('<div>', { 'class': 'form-block' });
        row = $('<div>', { 'class': 'form-group' });
        row.append($('<label>', { 'for': 'trigger-id-' + counter }).text("Id"));
        row.append($('<input>', { 'type': 'text', 'class': 'form-control trigger-id', 'id': 'trigger-id-' + counter }));
        block.append(row);

        row = $('<div>', { 'class': 'form-group' });
        row.append($('<label>', { 'for': 'trigger-description-' + counter }).text("Description"));
        row.append($('<input>', { 'type': 'text', 'class': 'form-control trigger-description', 'id': 'trigger-description-' + counter }));
        block.append(row);

        row = $('<div>', { 'class': 'form-group' });
        row.append($('<label>', { 'for': 'trigger-text-' + counter }).text("Text"));
        row.append($('<input>', { 'type': 'text', 'class': 'form-control trigger-text', 'id': 'trigger-text-' + counter }));
        block.append(row);
        container.append(block);

        block = $('<div>', { 'class': 'form-block' });
        block.append($('<label>').text("Parameters"));
        var paramPlaceholder = $('<div>');
        block.append(paramPlaceholder);
        block.append($('<button>', { 'type': 'button', 'class': 'btn btn-default placeholder' }).text("Add parameter").on('click', function() {
            addParam(paramPlaceholder);
        }));
        container.append(block);

        block = $('<div>', { 'class': 'form-block' });
        block.append($('<label>').text("Generates"));
        var generatesPlaceholder = $('<div>');
        block.append(generatesPlaceholder);
        block.append($('<button>', { 'type': 'button', 'class': 'btn btn-default placeholder' }).text("Add generated value").on('click', function() {
            addGenerates(generatesPlaceholder);
        }));
        container.append(block);

        block = $('<div>', { 'class': 'form-block' });
        block.append($('<label>').text("Trigger specific event sources"));
        var esPlaceholder = $('<div>');
        block.append(esPlaceholder);
        block.append($('<button>', { 'type': 'button', 'class': 'btn btn-default placeholder' }).text("Add event source").on('click', function() {
            addEventSource(esPlaceholder);
        }));
        container.append(block);

        block = $('<div>', { 'class': 'form-block' });
        block.append($('<label>', { 'for': 'trigger-script-' + counter }).text("Code"));
        block.append($('<textarea>', { 'type': 'text', 'class': 'form-control trigger-script code-input', 'id': 'trigger-text-' + counter })
            .val("function trigger(params, events, context) {\n" +
                 "   // @params contains the parameters to your event\n" +
                 "   // @events contains the event data from the shared and private event sources\n" +
                 "   //         as a map from event source id to value (boolean true if the source\n" +
                 "   //         does not produce a value)\n" +
                 "   // @context is an object that you should update with the values generated\n" +
                 "   //          your trigger\n" +
                 "   // use this to store data across executions of the trigger\n" +
                 "   // use the global object to store data shared across all instances of this channel\n" +
                 "   // return true if the trigger fires\n" +
                 "   return true;\n" +
                 "}"));
        container.append(block);

        row = $('<div>', { 'class': 'form-group' });
        var button = $('<button>', { 'class': 'btn btn-default' }).text("Remove").on('click', function() {
            container.remove();
        });
        row.append(button);
        container.append(row);

        $('#placeholder-triggers').append(container);
    }

    function addAction() {
        var container = $('<div>', { 'class': 'action well form-inline' });
        var block, row;

        counter++;
        block = $('<div>', { 'class': 'form-block' });
        row = $('<div>', { 'class': 'form-group' });
        row.append($('<label>', { 'for': 'action-id-' + counter }).text("Id"));
        row.append($('<input>', { 'type': 'text', 'class': 'form-control action-id', 'id': 'action-id-' + counter }));
        block.append(row);

        row = $('<div>', { 'class': 'form-group' });
        row.append($('<label>', { 'for': 'action-description-' + counter }).text("Description"));
        row.append($('<input>', { 'type': 'text', 'class': 'form-control action-description', 'id': 'action-description-' + counter }));
        block.append(row);

        row = $('<div>', { 'class': 'form-group' });
        row.append($('<label>', { 'for': 'action-text-' + counter }).text("Text"));
        row.append($('<input>', { 'type': 'text', 'class': 'form-control action-text', 'id': 'action-text-' + counter }));
        block.append(row);
        container.append(block);

        block = $('<div>', { 'class': 'form-block' });
        block.append($('<label>').text("Parameters"));
        var placeholder = $('<div>');
        block.append(placeholder);
        block.append($('<button>', { 'type': 'button', 'class': 'btn btn-default placeholder' }).text("Add parameter").on('click', function() {
            addParam(placeholder);
        }));
        container.append(block);

        block = $('<div>', { 'class': 'form-block' });
        block.append($('<label>', { 'for': 'action-script-' + counter }).text("Code"));
        block.append($('<textarea>', { 'type': 'text', 'class': 'form-control action-script code-input', 'id': 'action-text-' + counter })
            .val("function action(params) {\n" +
                 "   // @params contains the parameters to your action\n" +
                 "   // use this to store data across executions of the action\n" +
                 "   // use the global object to store data shared across all instances of this channel\n" +
                 "   // return an object representing the action to take\n" +
                 "   // for HTTP actions, return an object of the form\n" +
                 "   //     { type: 'http', url: 'http://www.example.com/api/v1/ayb', \n" +
                 "   //       method: 'post', data: 'ALL YOUR BASE ARE BELONG TO US' }\n" +
                 "   // (method is optional and defaults to get, data is optional and defaults to empty)\n" +
                 "   // for Intent actions, return an object of the form\n" +
                 "   //     { type: 'intent', action: 'com.example.myapp.AYB', \n" +
                 "   //       categories: ['android.category.DEFAULT'], package: 'com.example.myapp', \n" +
                 "   //       activity: false, extras: {} }\n" +
                 "   // for email actions, return an object of the form\n" +
                 "   //     { type: 'email', to: 'foo@example.com', \n" +
                 "   //       subject: 'Nigerian Scam', body: 'WIN BIG MONEY NOW'}\n" +
                 "   // (category, package, activity, extras are optional, activity defaults to false)\n" +
                 "   return {};\n" +
                 "}"));
        container.append(block);

        row = $('<div>', { 'class': 'form-group' });
        var button = $('<button>', { 'class': 'btn btn-default' }).text("Remove").on('click', function() {
            container.remove();
        });
        row.append(button);
        container.append(row);

        $('#placeholder-actions').append(container);
    }

    function parseEventSource(domSource) {
        var source = {
            id: $('.event-source-id', domSource).val(),
            type: $('.event-source-type', domSource).val()
        };
        $('.event-source-param input', domSource).each(function(index) {
            var param = $(this);
            var name = param.data('param-name');
            var value = param.val();

            var paramspec = EventSource[source.type][name];
            if (paramspec.type == 'integer') {
                value = parseInt(value);
                if (isNaN(value))
                    value = 0;
            }
            if (!paramspec.optional || value)
                source[name] = value;
        });
        return source;
    }

    function parseParam(domParam) {
        var param = ({
            id: $('.param-id', domParam).val(),
            type: $('.param-type', domParam).val(),
            text: $('.param-text', domParam).val(),
            description: $('.param-description', domParam).val(),
        });
        var optionaljq = $('.param-optional', domParam);
        if (optionaljq.length > 0)
            param.optional = !!optionaljq.prop('checked');
        return param;
    }

    function createChannel() {
        return {
            id: $('#channel-id').val(),
            objectId: $('#channel-objectId').val(),
            urlPrefix: $('#channel-urlPrefix').val(),
            urlRegex: $('#channel-urlRegex').val(),
            description: $('#channel-name').val(),
            'event-sources': $('#placeholder-shared-event-sources > .event-source').map(function(index, domSource) {
                return parseEventSource(domSource);
            }).get(),
            services: ['omlet'].map(function(id) {
                return $('#service-' + id).prop('checked') ? id : null;
            }).filter(function(id) { return id !== null; }),
            events: $('#placeholder-triggers > .trigger').map(function(index, domTrigger) {
                return ({
                    id: $('.trigger-id', domTrigger).val(),
                    description: $('.trigger-description', domTrigger).val(),
                    text: $('.trigger-text', domTrigger).val(),
                    script: $('.trigger-script', domTrigger).val(),
                    'event-sources': $('.event-source', domTrigger).map(function(index, domSource) {
                        return parseEventSource(domSource);
                    }).get(),
                    generates: $('.generates', domTrigger).map(function(index, domParam) {
                        return parseParam(domParam);
                    }).get(),
                    params: $('.param', domTrigger).map(function(index, domParam) {
                        return parseParam(domParam);
                    }).get()
                });
            }).get(),
            methods: $('#placeholder-actions > .action').map(function(index, domAction) {
                return ({
                    id: $('.action-id', domAction).val(),
                    description: $('.action-description', domAction).val(),
                    text: $('.action-text', domAction).val(),
                    params: $('.param', domAction).map(function(index, domParam) {
                        return parseParam(domParam);
                    }).get(),
                    script: $('.action-script', domAction).val()
                });
            }).get(),
        };
    }

    $(function() {
        $('#add-new-shared-event-source').on('click', function() {
            addEventSource(null);
        });

        $('#add-new-trigger').on('click', function() {
            addTrigger();
        });

        $('#add-new-action').on('click', function() {
            addAction();
        });

        $('#create-channel').on('click', function() {
            var channel = createChannel();
            console.log(channel);
            $('#channel-json').text(JSON.stringify(channel));
            $('#channel-created-dialog').modal();
        })
    });
})()
