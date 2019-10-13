jsCode = "";
jsCodeLines = [];
jsCodeOffset = [];
jsCodeRemoved = [];
jsCodeFinal = [];

String.prototype.contains = function(s){
	return this.indexOf(s) != -1;
}


$(document).ready(function(){
	$.ajax({
	  type: 'GET',
	  url: "prims_visedit.js",
	  success:function(data){
	   jsCode = data;
	   jsCodeLines = jsCode.split("\n");
	   codeNoTabs = jsCodeLines.map(function(e){
	   	return e.replace(/\t/g, "").toString();
	   });
	   
	   	currentOffset = 0;
			for (var i = 0; i<jsCodeLines.length;i++){
				var line = jsCodeLines[i];
				if(line.contains("animation")){
					console.log("line: " + line);
					currentOffset++;
					jsCodeRemoved[i] = line; 
				}
				else{
					jsCodeFinal.push(line);
				}
				
				jsCodeOffset[i] = currentOffset;
			} 
			highlight();
			go();
	  }
	});
})

function highlight(type){
	
	var hLine = null;			
	for (var i = 0; i<jsCodeLines.length;i++){
		var line = jsCodeLines[i];
		if(line.contains('"%s"'.format(type))) hLine = i+1;
	}
	
	if(hLine == null){
		beginningCode = jsCodeFinal;
		middleCode = [];
		endCode = [];
	}
	else{
		var finalLine = hLine - jsCodeOffset[hLine];
		var beginningCode = jsCodeFinal.slice(0,finalLine);
		var middleCode = jsCodeFinal.slice(finalLine,finalLine+1);
		var endCode = jsCodeFinal.slice(finalLine+1);
	}
	
	beginningCode = beginningCode.join("\n");
	middleCode = middleCode.join("\n");
	endCode = endCode.join("\n");
	
	$("#code-box .beginning").html("");
	$("#code-box .middle").html("");
	$("#code-box .end").html("");
		
	$("#code-box .beginning").append("<pre><code class='language-javascript'>%s</code></pre>".format(beginningCode));
	$("#code-box .middle").append("<pre><code class='language-javascript'>%s</code></pre>".format(middleCode));
	$("#code-box .end").append("<pre><code class='language-javascript'>%s</code></pre>".format(endCode));
	$('pre code').each(function(i, e) {
		hljs.highlightBlock(e);
	});
	
	
	var beginning = $("#code-box .beginning").html();
	var middle = $("#code-box .middle").html();
	var end = $("#code-box .end").html();
	
	beginning = beginning.replace(/\t/g, "&nbsp&nbsp");
	middle = middle.replace(/\t/g, "&nbsp&nbsp");
	end = end.replace(/\t/g, "&nbsp&nbsp");
	
	beginning = beginning.replace(" < ", "&lt;");
	middle = middle.replace(" < ", "&lt;");
	end = end.replace(" < ", "&lt;");
	
	beginning = beginning.replace(" > ", "&gt;");
	middle = middle.replace(" > ", "&gt;");
	end = end.replace(" > ", "&gt;");
	
	$("#code-box .beginning").html(beginning);   
	$("#code-box .middle").html(middle);
	$("#code-box .end").html(end);   
}
