module.exports = {
    throttle: function(func, limit){
        var lastFunc;
        var lastRan;
        return function() {
            var context = this
            var args = arguments
            if (!lastRan) {
            func.apply(context, args)
            lastRan = Date.now()
            } else {
            clearTimeout(lastFunc)
            lastFunc = setTimeout(function() {
                if ((Date.now() - lastRan) >= limit) {
                func.apply(context, args)
                lastRan = Date.now()
                }
            }, limit - (Date.now() - lastRan))
            }
        }
    },
    debounce: function(func, delay) { 
        var debounceTimer;
        return function() { 
            var context = this
            var args = arguments 
                clearTimeout(debounceTimer) 
                    debounceTimer 
                = setTimeout(function(){func.apply(context, args)}, delay) 
        } 
    }  
}