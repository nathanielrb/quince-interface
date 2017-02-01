module.exports = {
    template: require('./template.html'),
    data: function() {
        return {
            path: '/',
            files: [],
	    newCoverImage: null,
	    newCoverImageForm: null,
	    addFileForm: null,
	    newFileName: null
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
        },
	fileUrl: null,
	token: null
    },
    computed: {
        fullRepoUrl: function() {
            return this.username + '/' + this.repo;
        },
        sortedFiles: function() {
	    if(this.files)
		return this.files.slice(0).sort(function(a, b) {
                    if (a.type !== b.type) {
			if (a.type === 'dir') {
                            return -1;
			} else {
                            return 1;
			}
                    } else {
			if (a.name < b.name) {
                            return -1;
			} else {
                            return 1;
			}
                    }
		})
		.filter(this.isViewable);
        },
	breadcrumbs: function(){
	    return this.path.split('/')
		.filter(function(e){ return e != '' })
		.reduce(function(prevVal, elem, index, array){
		    return prevVal.concat([  { 
			crumb: elem,
			path: prevVal.length > 0 ? prevVal[prevVal.length - 1].path + '/' + elem : elem
		    } ]);
		}, [{crumb: '..', path: ''}]);
	},
	coverImage: function(){

	    var cover = this.files.filter(function(file){
		return file.name === "cover.jpg";
	    });
	    return cover ? cover[0] : null;
	}
    },
    methods: {
        getFiles: function() {

	    var vm = this;
            this.$http.get('https://api.github.com/repos/' + this.fullRepoUrl + '/contents' + this.path)
		.then(
                    function(response) {
			vm.files = response.data;
                    });
        },
        changePath: function(path) {
            this.path = path;
            this.getFiles();
	    window.location.hash = '#' + this.repo + this.path;
        },
        goBack: function() {
            this.path = this.path.split('/').slice(0, -1).join('/');
            if (this.path === '') this.path = '/';

            this.getFiles();
        },
	ext: function(file){
            var re = /(?:\.([^.]+))?$/;
            return re.exec(file.path)[1];
	},
	isEditing: function(file){
	    return this.fileUrl == file.url;
	},
	isDir: function(file){
	    return file.type == 'dir'
	    	&& file.name[0] != '_';
	},
        isContent: function(file){
	    return ["md","html"].indexOf(this.ext(file)) > -1
		&& file.name[0] != '_';
        },
	isMeta: function(file){
	    return ["yml","yaml","json"].indexOf(this.ext(file)) > -1;
        },
	isViewable: function(file){
	    return this.isContent(file)
		|| this.isMeta(file)
		|| this.isDir(file);
	},
	showAddFileForm: function(){
	    this.addFileForm = true;
	},
	hideAddFileForm: function(){
	    this.newFileName = null;
	    this.addFileForm = null;
	},
	addFile: function(){
	    var name = this.newFileName;
	    var newpath = this.path + '/' + name;

	    var uri =  'https://api.github.com/repos/'
		+ this.username + '/'
		+ this.repo + '/contents'
		+ newpath + '?access_token=' + this.token;

	    var params = {
		"message": "Created in Quince.",
		"path": newpath,
		"content": ''
	    }

	    var vm = this;
	    this.$http.put(uri,params)
		.then(
		    function(response){
			var newfile = response.data.content;

			vm.files.push(newfile);

			vm.$emit('edit', newfile.url);

		    },
		    function(response){
			vm.errorMsg = response.data.message;
			console.log("error");
			console.log(response);
		    });


	},
	changeCoverImage: function(){
	    this.newCoverImageForm = true;
	}
    },
    watch: {
        repo: function(newVal, oldVal) {
            this.path = '/';
	    window.location.hash = '#' + newVal;
            this.getFiles();
        }
    },
    created: function() {

	var vm = this;
	this.$parent.$on('add-file',
			 function(file){
			     vm.files.push(file);
			 });
	
	this.$parent.$on('remove-file',
			 function(file){
			     var index = vm.files.findIndex(
				 function(f){
				     return f.path == file.path
				 });

			     if(index > -1)
				 vm.files.splice(index, 1);
			 });


	var hash = window.location.hash;
	if(hash != ''){
	    var path = hash.substr(1).split('/');
	    this.path = '/' + path.slice(1).join('/');
	}

        if (this.username && this.repo)
	    this.getFiles();
	else
	    console.log("not getting files");
    }
};
