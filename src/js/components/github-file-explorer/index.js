module.exports = {
    template: require('./template.html'),
    data: function() {
        return {
            path: '/',
            files: [],
	    newCoverImage: null,
	    newCoverImageForm: null
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
    computed: {
        fullRepoUrl: function() {
            return this.username + '/' + this.repo;
        },
        sortedFiles: function() {
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
            });
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
            this.$http.get('https://api.github.com/repos/' + this.fullRepoUrl + '/contents' + this.path,
                function(data) {
                    this.files = data;
                }
            );
        },
        changePath: function(path) {
            this.path = '/' + path;
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
	isDir: function(file){
	    return file.type === 'dir'
	    	&& file.name[0] != '_';
	},
        isContent: function(file){
	    console.log(file);
	    return ["md","html"].indexOf(this.ext(file)) > -1
		&& file.name[0] != '_';
        },
	isMeta: function(file){
	    console.log(file);
	    return ["yml","yaml","json"].indexOf(this.ext(file)) > -1;
        },
	isViewable: function(file){
	    return this.isContent(file)
		|| this.isMeta(file)
		|| this.isDir(file);
	},
	changeCoverImage: function(){
	    this.newCoverImageForm = true;
	}
    },
    watch: {
        repo: function(newVal, oldVal) {
            this.path = '/';
            this.getFiles();
        }
    },
    created: function() {

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
