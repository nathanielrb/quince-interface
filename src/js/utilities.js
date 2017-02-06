var Compose = function () {
    var fns = arguments;
    
    return function (result) {
	for (var i = fns.length - 1; i > -1; i--) {
	    result = fns[i].call(this, result);
	}
	
	return result;
    };
}

getParameter = function(parameterName) {
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
