(function(){
    var filerRules = function(vm, file){
	return [
	    {
		test: /.*[.]md$/,
		icon: "fa-file-o",
		class: "file",
		name: function(){
		    return file.name
		},
		click: function(){
		    vm.$emit('edit',file.url);
		}
	    },
	    {
		test: "_book.yml",
		icon: "fa-th-list",
		class: "metadata",
		name: function(){
		    return "Metadata";
		},
		click: function(){
		    vm.$emit('edit', file.url);
		}
	    },
	    {
		test: "cover.jpg",
		class: "cover",
		html: function(){
		    return "<img src='" + file.download_url + "' alt='cover' />";
		},
		click: function(){
		    null;
		}
	    },
	    {
		test: function(){
		    console.log("testing dir: " + file);
		    return file.type == 'dir'
	    		&& file.name[0] != '_';
		},
		icon: "fa-folder-o",
		class: "directory",
		name: function(){
		    return file.name;
		},
		click: function(){
		    vm.changePath(file.path); 
		}
	    }
	]
    }
    
    var filerRec = function(file, rules){
	if(rules.length > 0){
	    var rule = rules[0];
	    
	    switch (typeof rule.test){
	    case "string":
		if(file.name === rule.test)
		    return rule;
		else
		    return filerRec(file, rules.slice(1));
		break;
	    case "function":
		if(rule.test(file.name))
		    return rule;
		else
		    return filerRec(file, rules.slice(1));
		break;
	    case "object":
		if(rule.test.constructor.name === "RegExp"){
		    if(rule.test.exec(file.name))
			return rule;
		    else
			return filerRec(file, rules.slice(1));
		}
		break;
	    default:
		return filerRec(file, rules.slice(1));
	    }
	}
	else
	    return null;
    }

    var file = function(vm, file){
	console.log("filing " + file);
	return filerRec(file, filerRules(vm, file));
    }
    
    module.exports.file = file;
})();