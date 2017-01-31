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
		}, [{crumb: '..', path: '/'}]);
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
        },
        goBack: function() {
            this.path = this.path.split('/').slice(0, -1).join('/');
            if (this.path === '') this.path = '/';

            this.getFiles();
        },
        editable: function(file){
            var re = /(?:\.([^.]+))?$/;
            var ext = re.exec(file.path)[1];
            return ext === "md";
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
        if (this.username && this.repo) this.getFiles();
    }
};
