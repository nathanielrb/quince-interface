module.exports = {
    template: require('./template.html'),
    data: function() {
        return {
            path: '/',
            files: []
        };
    },
    props: {
        username: {
            type: String,
            required: true
        },
        repo: {
            type: String,
            required: true
        }
    },
    computed: {},
    methods: {},
    watch: {}
 };  
