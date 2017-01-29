var Vue = require('vue');
Vue.config.debug = true;
Vue.use(require('vue-resource'));

var vm = new Vue({
    el: '#container',
    data: {
        fullRepoName: '',
        username: '',
        repo: '',
        editPath: null
    },
    methods: {
        changeRepo: function() {
            var splitData = this.fullRepoName.split('/');
            this.username = splitData[0];
            this.repo = splitData[1];

            console.group("Vue Data");
            console.log("fullRepoName:", this.fullRepoName);
            console.log("username:", this.username);
            console.log("repo:", this.repo);
            console.groupEnd("Vue Data");
        },
        editPath: function(path){
           console.log(path);  
            this.editPath = path;
        }
    },
    components: {
        githubFileExplorer: require('./components/github-file-explorer'),
        githubFileEditor: require('./components/github-file-editor')
    }
});
