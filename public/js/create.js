(function() {
    var ready = false;
    var triggers = [];
    var computedTrigger = {};

    $.get('/create/triggers', '', function(data, status, xhr) {
        triggers = data;
        updateTriggerChannels();
        updateTriggerOptions();
    }, 'json');

    $(function() {
        // on ready
    });

    function updateTriggerChannels() {
        var container = $('#trigger-channel-select-container');
        var count = 0;
        var row = null;
        triggers.forEach(function(trigger) {
            if (row == null || count >= 4) {
                row = $('<div>', { 'class': 'row' });
                container.append(row);
                count = 0;
            }

            var channel = trigger.channel;
            var column = $('<div>', { 'class': 'col-md-1' });
            var button = $('<button>', { 'class': 'btn',
                                         'data-dismiss': 'modal',
                                         'id': 'trigger-button-channel-' + channel.id,
                                       });
            button.text(channel.description);
            column.append(button);
            row.append(column);
            count ++;
        });
    }

    function updateTriggerOptions() {
    }
})();
