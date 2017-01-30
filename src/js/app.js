var Vue = require('vue');
Vue.config.debug = true;
Vue.use(require('vue-resource'));

var vm = new Vue({
    el: '#container',
    data: {
        fullRepoName: '',
        username: '',
	repos: ['a','b'],
        repo: null,
        fileToEdit: null,
	github: null,
	loggedIn: false,
	github_params: {
	    id: 'efe3f24dd42bf7881928',
	    redirect_uri: 'http://localhost:8080',
	    state: 'bobo'
	},
	token: null,
	errorMsg: null
    },
    created: function(){
	
	var code = this.getParameter('code'); //window.location.href.match(/\?code=(.*)/);

	history.replaceState({},window.document.title, '/');
	
	if(code){
	    var url = 'http://localhost:9999/authenticate/' + code;
	    var vm = this;
	    this.$http.get(url,
			   function(data){
			       if(data.token){
				   this.loggedIn = true;
				   this.token = data.token;
				   console.log("Logged in: " + this.token);

				   vm.getUserName(vm.getUserRepos);
			       }
			       else{
				   vm.loggedIn = false;
				   vm.errorMsg = data.error;
				   console.log("Error logging in: " + data.error);
			       }
			   });
	}
    },
    methods: {
	getUserName: function(callback){
	    var vm = this;
	    this.$http.get('https://api.github.com/user?'
			   + 'access_token=' + this.token)
		.then(
		    function(data){
			vm.username = data.data.login;
			callback();
		    });
	},
	getUserRepos: function(){
	    var vm = this;
	    console.log("Getting user repos...");
	    this.$http.get('https://api.github.com/user/repos?'
			   + 'access_token=' + this.token)
		.then(
		    function(data){
			var names = data.data.map(function(repo){ return repo.name});
			vm.repos = names;
		    },
		    function(data){
			console.log("error");
			console.log(data);
			vm.errorMsg = data.responseText;
		    });
	},
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
        editFile: function(file){
            console.log("edit " + file.path);
           this.fileToEdit = file;
        },
	login: function(){
	    var github_uri = "https://github.com/login/oauth/authorize?"
		+ 'client_id=' + this.github_params.id
		+ '&redirect_uri=' + this.github_params.redirect_uri
		+ '&state=' + this.github_params.state
		+'&scope=repo';

	    window.location.href = github_uri;
	},
	getParameter: function(parameterName) {
	    var result = null,
		tmp = [];
	    location.search
		.substr(1)
		.split("&")
		.forEach(function (item) {
		    tmp = item.split("=");
		    if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
		});
	    return result;
	}
    },
    components: {
        githubFileExplorer: require('./components/github-file-explorer'),
        githubFileEditor: require('./components/github-file-editor')
    }    
});
