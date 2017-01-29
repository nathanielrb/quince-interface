module.exports = {
    template: require('./template.html'),
    data: function() {
        return {
            content: null,
            editor: null
        };
    },
    props: ['path'],
    computed: {
        ext: function(){
         var re = /(?:\.([^.]+))?$/;
         return re.exec(file.path)[1];   
        }
    },
    methods: {
        getFile: function(){
            vm = this;
            console.log("getting file from github");
        },
        close: function(){},
        save: function(){},
        initEditor: function(){}
    },
    watch: {
        path: function(){
            if(path)
                this.getFile();
            else
                this.content = null;
        }
    }
 };  
