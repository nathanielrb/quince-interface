var Filer = require('./../../filer/filer.js');

module.exports = {
    template: require('./template.html'),
    data: function() {
        return {
            path: '',
            files: null,
	    newCoverImage: null,
	    newCoverImageForm: null,
	    addFileForm: null,
	    newFileName: null,
	    filer: null,
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
        fileUrl: {
            type: String
        },
	token: {
            type: String,
            required: true
        },

    },
    computed: {
        sortedFiles: function() {
	    if(this.files)
		return this.files.slice(0)
		.sort(this.fileSort)  // abstract out sort
		.map(this.filer.file)
		.filter( function(v){ return v; });
        },
	breadcrumbs: function(){
	    return this.path.split('/')
		.filter(function(e){ return e != '' })
		.reduce(function(prevVal, elem, index, array){
		    return prevVal.concat([  { 
			crumb: elem,
			path: prevVal.length > 1
			    ? prevVal[prevVal.length - 1].path + '/' + elem
			    : elem
		    } ]);
		}, [{crumb: '..', path: ''}]);
	}
    },
    methods: {
	fileSort: function(a, b) {
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
	},
        getFiles: function() {
	    var vm = this;

            this.$http.get('https://api.github.com/repos/' + this.repo + '/contents/' + this.path + '?access_token=' + this.token)
		.then(
                    function(response) {
			vm.files = response.data;
                    },
		    function(response){
			vm.$emit('error', response.data.message, response.data);
		    });
        },
        changePath: function(path) {
	    this.path = path;
            this.getFiles();
	    this.updateHash();
        },
	updateHash: function(){
	    window.location.hash = '#' + this.repo + '/' + this.path;
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
	    return ["md","html", "jpg"].indexOf(this.ext(file)) > -1
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
			vm.filer.file(newfile).click();
			//vm.$emit('edit', {url: newfile.url, editor: vm.filer.file(newfile)});
		    },
		    function(response){
			vm.$emit('error', response.data.message, response.data);
		    });
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
	this.filer = new Filer(this);
	
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
	    var path = hash.substr(1).split('/').slice(2);
	    this.path = '/' + path.join('/');
	}

        if (this.username && this.repo)
	    this.getFiles();
	else
	    console.log("not getting files");
    }
};
