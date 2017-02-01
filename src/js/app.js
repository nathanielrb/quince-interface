var Vue = require('vue');
Vue.config.debug = true;
Vue.use(require('vue-resource'));

var vm = new Vue({
    el: '#container',
    data: {
        fullRepoName: '',
        username: '',
	repos: null,
        repo: null,
        fileUrl: null,
	github: null,
	loggedIn: false,
	githubParams: {
	    id: 'efe3f24dd42bf7881928',
	    redirect_uri: 'http://localhost:8080',
	    state: 'bobo',
	    gateway: 'http://localhost:9999/authenticate/'
	},
	token: null,
	errorMsg: null
    },
    created: function(){
	var hash = window.location.hash;

	var code = this.getParameter('code');
	
	if(code){
	    history.replaceState({},window.document.title, '/' + hash);
	    this.getGithubToken(code);
	}	

	if(null && hash != '' && hash != '#'){
	    var path = hash.substr(1).split('/');
	    this.repo = path[0];
	}

	var token = sessionStorage.getItem('token');

	if(token){
	    this.token = token;
	    this.getUserName(this.getUserRepos);
	}
	
    },
    methods: {
	getGithubToken: function(code){
	    var url = this.githubParams.gateway + code;
	    var vm = this;
	    this.$http.get(url,
			   function(data){
			       if(data.token){
				   vm.token = data.token;
				   sessionStorage.setItem('token', vm.token);
				   
			       }
			       else{
				   vm.token = null;
				   vm.errorMsg = data.error;
			       }
			   });
	},
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
        editFile: function(fileUrl){
            this.fileUrl = fileUrl;
        },
	removeFile: function(file){
	    this.$emit('remove-file', file);
	},
	addFile: function(file){
	    this.$emit('add-file', file);
	},
	changeEditingFile: function(fileUrl){
	    this.fileUrl = fileUrl;
	},
	loginGithub: function(){
	    var github_uri = "https://github.com/login/oauth/authorize?"
		+ 'client_id=' + this.githubParams.id
		+ '&redirect_uri=' + this.githubParams.redirect_uri + encodeURIComponent(window.location.hash)
		+ '&state=' + this.githubParams.state
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
