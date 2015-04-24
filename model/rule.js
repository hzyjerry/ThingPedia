
function Rule() {
    this._init.apply(this, arguments);
}

Rule.prototype = {
    _init: function(name, description) {
        this.name = name;
        this.description = description;
        this.image = this._computeImage();
        this.creator;
        this.code = { // json object of the code
            /*trigger: {
                combinator: 'and',
                operands: [
                    { combinator: 'or',
                      operands: [ ] },
                    { channel: '...', trigger: '...', params: ['...'] }
                ],
                }*/
            trigger: { channel: '...', trigger: '...', params: ['...'] }
            actions: [
                { object: '...', method: '...', params; ['...'] }
            ]
        };
    },

    toURL: function() {
        // converts code into URL
    },

    toJSON: function() {
        // converts to pass down XHR
    }
};

module.exports = {
    Rule: Rule
};
