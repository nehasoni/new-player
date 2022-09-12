var scripts = [];

var loader = function(files, success, error){
  var successCount = 0
  var optionalFileFailCount = 0
  var finalFiles = files.filter(function(file){
    return scripts.indexOf(file.url) == -1
  })
  if(finalFiles.length == 0){
    success();
  }else{
    finalFiles.map(function(file){
      var script = document.createElement("script");
      script.onload = function(){
        scripts.push(file.url);
        successCount++
        if((successCount + optionalFileFailCount) == finalFiles.length){
          success();
        }
      };
      script.onerror = function(){
        if(!file.optional){
          console.error("Error loading:", file.url)
          error();
        }else {
          optionalFileFailCount++
          if((successCount + optionalFileFailCount) == finalFiles.length){
            success();
          }
        }
      }
      script.src = file.url;

      var body = document.getElementsByTagName("body")[0];
      body.appendChild(script);
    })
  }
}

module.exports = loader;