// initialize the buttons in the interface
function initInterface(){
    $("#back-button").click(function(){
        back();
    });
    $("#next-button").click(function(){
        next();
    });
    $("#update-button").click(function(){
      update();
    });
    $("#clear-button").click(function(){
      clear();
    });
    $("#play-button").click(function(){
      animate();
    });
    $("#rewind-button").click(function(){
      rewind();
    });
    $("#reset-button").click(function(){
      console.log("reset-button");
      newGraph();
    });
    $("#pause-button").click(function(){
      pause();
    });
    
    $('body').keyup(function(e){
   	if(e.keyCode == 32){ 
       if (animating) pause();
       else animate();
   }
});
}

// initialize visualization parameters
function init(){
  // create an array of timeout ids to allow cancellation 
  timeouts = [];

  // set the width and height of the visualization
  var width = 600;
  var height = 450;
  
  
  sliderHeight = 40;
  sliderWidth = 800;
  sliderMargin = 20;
  sliderBlockHeight = 20;
  blockY = (sliderHeight/2) - (sliderBlockHeight/2); 
	headHeight = 40;
	headWidth = 20;
	headY = (sliderHeight/2) - (headHeight/2);

// set animation parameters
  transitionTime = 50;
  delay = 30;
  currentAction = 0;
  animating = false;

  // create a random graph to use with prims algorithm and the visualization
  graph = randomGraph(10, 30, 3)

// copy the graph to pass to prims algorithm (so the visualization copy isn't affected)
  var G = graph.nodes.copy();
  // set the root node to the element with id 0
  var r = getNodeById(0);
  // create a weight function with searches the link array for an edge corresponding to the specified nodes
  var w = function(node1, node2){
    if(!(node1 && node2)) return Infinity;

    id2 = node2.id;
    var weight = Infinity;
    node1.links.forEach(function(l){
      if(l.target == id2 || l.source == id2) weight = l.weight;
    })
    return weight;
  }

// actually call prims algorithm and fill in the animation array
  prims(G, w, r);


// sort the graph nodes by id so they will correspond to the correct links in the animation
  graph.nodes.sort(function(a,b){
    return a.id-b.id;
  });

	
// create the actual svg for the visualization
  svg = d3.select("#svg-container").insert("svg:svg", "#code-box")
    .attr("width", width)
    .attr("height", height);
   
//   create the svg for the play slider
  sliderSvg = d3.select("#slider-container").append("svg:svg")
  	.attr("width", sliderWidth)
  	.attr("height", sliderHeight);
  	
//  create a scale for the play slider
  sliderXScale = function(i){
  	return i/animation.length * (sliderWidth - 2 * sliderMargin);
  }
  
  
//   build up a list of animation types
  animationTypes = [];
  for (var i = 0; i<animation.length;i++){
  	var a = animation[i];
  	if(animationTypes.indexOf(a.type) == -1) animationTypes.push(a.type);
  } 
  
  //create color scale
  
  colorScale = d3.scale.linear()
  .domain([0, animationTypes.length])
  .range(["yellow","red"]);
  
  colorScale = d3.scale.quantize()
      .domain([0, animationTypes.length])
      .range(d3.range(animationTypes.length).map(function(i) { return "q%d".format(i);}));
  
  
  sliderBlocks = sliderSvg.selectAll(".slider-block")
		.data(animation)
		.enter()
		.append("rect")
		.attr("height", sliderBlockHeight)
		.attr("width", sliderWidth/animation.length)
		.attr("y", blockY)
		.attr("x", function(d,i){
			return sliderXScale(i);
		})
		.attr("class", function(d){
			return colorScale(animationTypes.indexOf(d.type));
		})
  
  
		sliderHead = sliderSvg
			.append("rect")
			.attr("height", headHeight)
			// .attr("width", sliderWidth/animation.length)
			.attr("width", headWidth)
			.attr("x", function(){
				return sliderXScale(currentAction);
			})
			.attr("y", headY)
			.attr("fill", "black")
			.attr("class", "slider-head");
		
		$(".slider-head").bind("move", function(e){
			zeroPos = $("#slider-container svg").offset().left;
			var pos = e.pageX - zeroPos;
			var index = Math.floor(pos/sliderWidth*animation.length);
			setState(index);
			update();
		})

// initialize a force layout object to layout the graph visually
  force = d3.layout.force()
    .gravity(.4)
    .distance(100)
    .charge(-4000)
    .size([width, height]);

// assign the nodes and links to the force object and start the simulation
  force
      .nodes(graph.nodes)
      .links(graph.links)
      .start();
  
//   compute all states for the visualization
      
  animationStates = [];
	
	for (var i = 0; i<animation.length;i++){
		var action = animation[i];
		animationStates.push({"graph":owl.deepCopy(graph), "action": action});
		evaluateNext();
	}
	// graph = animationStates[1].graph;
	currentAction = 0;
}


// create and update svg elements from data
function update(){
  console.log("update()");

// append the new link containers to the graph, bind the link data to them, and assign the selection go a variable
  linkGNew = svg.selectAll("g.link")
      .data(graph.links)
      .enter().append("g")
      // assign the links a color based on their state
      .attr("class", function(d){
        if(d.linetype == "solid") return "link solid" + " ls" +d.source.id + " lt" +d.target.id;
        if(d.linetype == "minimum") return "link minimum" + " ls" +d.source.id + " lt" +d.target.id;
        else return "link dotted" + " link ls" +d.source.id + " lt" +d.target.id;
      })

// append the actual links to the svg link container
  linkl = linkGNew.append("line");

// append the edge weight to a text object in the visualization
  linkText = linkGNew.append("text")
    // the text should be in the center of the edge
      .attr("x", function(d) { return (d.source.x + d.target.x) / 2; })
      .attr("y", function(d) { return (d.source.y + d.target.y) / 2; })
      .attr("text-anchor", "middle")
      .attr("class", "linkText")
      .text(function(d) {
          return d.weight;
      });

      // append new nodes to a node container and bind the node data
    node = svg.selectAll(".node")
      .data(graph.nodes)
      .enter().append("g")
      .attr("class", "node")

// append actual circle svg elements to the node container
    node.append("circle")
        .attr("r", 12)
        .attr("class", "circle")
        .attr("fill", function(d){
          return "#ccc";
        });

// append the node keys to a text object in the svg
    node.append("text")
        .text(function(d) { return d.id })
        .attr("dx", "-5px")
        .attr("dy", "5px")
        .attr("class", "nodeText")
        .style("fill", "white");

// update existing svg links with new data
    linkG = svg.selectAll("g.link")
      .data(graph.links)
      .attr("class", function(d){
        if(d.linetype == "solid") return "link solid" + " ls" +d.source.id + " lt" +d.target.id;
        if(d.linetype == "minimum") return "link minimum" + " ls" +d.source.id + " lt" +d.target.id;
        else return "link dotted" + " link ls" +d.source.id + " lt" +d.target.id;
      })

// update existing svg nodes with new data (color to represent their state in the algorithm)
      svg.selectAll(".node")
        .attr("class", function(d){
          if(d.color)return "node " + d.color;
          else return "node";
        });

	// sliderBlocks = sliderSvg.selectAll(".slider-block")
		// .data(animation)
		// .enter()
		// .append("rect")
		// .attr("height", sliderBlockHeight)
		// .attr("width", sliderWidth/animation.length)
		// .attr("y", 0)
		// .attr("x", function(d,i){
			// return sliderXScale(i);
		// })
		// .attr("fill", function(d){
			// return colorScale(animationTypes.indexOf(d.type));
		// })
		
		sliderHead.attr("x", function(){
				return sliderXScale(currentAction);
		});

}

// specify a function to update the nodes and links every time the state of the particle simulation changes
function start(){
      force.on("tick", function() {
      // change the starting and ending points
      linkl.attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });
      // change the node positions
      node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
      linkText
        .attr("x", function(d) { return (d.source.x + d.target.x) / 2; })
        .attr("y", function(d) { return (d.source.y + d.target.y) / 2; })

    });
    update();
}
//animation operations

// add a previous node to another node by changing the color the edge in the svg
function addPrev(id1add, id2add, id1remove, id2remove){

  console.log("add prev()");
   
  var addIds = [id1add, id2add].sort().join();
  var removeIds = [id1remove, id2remove].sort().join();
  

  for (var j = 0; j<graph.links.length;j++){
    var link = graph.links[j];
    var linkIds = [link.source.id, link.target.id].sort().join();
  
    if(linkIds == addIds) {
    	console.log("adding link");
      link.linetype = "minimum";
    }

    if(linkIds == removeIds){
      console.log("removing");
      link.linetype = "solid";
    }
  }
}

// call a visualization function based on action type
function evaluate(action, shouldNotUpdate){
    console.log("action.type: " + action.type);
    highlight(action.type);
    switch(action.type){
        case "add-prev":
          addPrev(action.add[0], action.add[1], action.remove[0], action.remove[1]);
          break;
        case "extract":
          getNodeById(action.element).color = "extract";
          break;
        case "evaluate":
        // if the animation object indicates the node is being evaluated change its color
          var node = getNodeById(action.element)
          if(node.color == "finish-extract") break;
          else getNodeById(action.element).color = "evaluate";
          break;
        case "change-key":
        // if the action object indicates the key and prev value is changing then change the nodes color
          getNodeById(action.element).color = "change-key";
          break;
          // if the animation object indicates the object is done being considered with other nodes mark it as finished
        case "finish-extract":
          getNodeById(action.element).color = "finish-extract";
          break;
    }
    
    if(!shouldNotUpdate) update();
}

function setState(t){
		if(t>= 0 && t<animation.length){
		currentAction = t;
		graph = animationStates[currentAction].graph;
		update();
		highlight(animationStates[currentAction-1].action.type);
	}
}
// evaluate the next animation object in the animation based on the current action index
function next(){
  if(moreActions()){
  	setState(currentAction+1);
  }
}

// evaluate the next animation object in the animation based on the current action index
function back(){
	console.log("currentAction: " + currentAction);
  if(currentAction > 1){
  	setState(currentAction-1);
  }
}

function evaluateNext(){
	if(!moreActions()){
		console.log("no more actions");
	}
  else{
	  evaluate(animation[currentAction], true);
	  currentAction++;
  }
}
// return the animation to its initial state
function clear(){

  console.log("clear()");

  currentAction = 0;
  update();

// return all links to normal line type
  for (var i = 0; i<graph.links.length;i++){
    var link = graph.links[i];
    link.linetype = "solid";
  }
  // return all node to normal color
  for (var i = 0; i<graph.nodes.length;i++){
    var node = graph.nodes[i];
    node.color = null;
  }

// update the animation to change the actual svg elements
  update();
// call the next function to execute the first action, revealing which node is the root
  next();

}

// evaluate a series of animation objects
function animate(aTransitionTime){

		animating = true;
// if a special transition time is being used set it
    if(!aTransitionTime) var aTransitionTime = transitionTime;
    pTransitionTime = transitionTime;
    transitionTime = aTransitionTime;
    
    var i = currentAction;
    var startAction = currentAction;
    for (i; i<animation.length;i++){

        // push the timeout id's to an array so we can cancel them later
        timeouts.push(window.setTimeout(
            next
            ,(i-startAction) * (transitionTime*1 + delay)
        ));
    }

// return the transition time to the actual value if it was temporarily changed
    window.setTimeout(
      function(){
      	transitionTime = pTransitionTime;
      	animating = false;
      }
      ,(i+1) * (transitionTime*1 + delay)
    );
}

function rewind(aTransitionTime){

// if a special transition time is being used, set it
    if(!aTransitionTime) var aTransitionTime = transitionTime;
    pTransitionTime = transitionTime;
    transitionTime = aTransitionTime;
    
    var i = currentAction;
    var startAction = currentAction;
    for (i; i>=0;i--){

        // push the timeout id's to an array so we can cancel them later
        timeouts.push(window.setTimeout(
            back
            ,(startAction-i) * (transitionTime * 1 + delay)
        ));
    }

// return the transition time to the actual value if it was temporarily changed
    window.setTimeout(
      function(){transitionTime = pTransitionTime;}
      ,(i+1) * (transitionTime*1 + delay)
    );
}

// fade out the visualization, get a new graph and start over
function newGraph(){
  $("svg").fadeOut(300,function(){
    $("svg").remove();
    animation = [];
    init();
    // update();
    start();
    window.setTimeout(next, 2000);
  });
}

// helper methods

// given a node id return the node object itself
function getNodeById(nodeId){
    for (i in graph.nodes){
        if(graph.nodes[i].id == nodeId) return graph.nodes[i];
    }
}

//check if more actions remain to be executed
function moreActions(){
  return (currentAction >= animation.length-1) ? false : true;
}

// clear all the timeouts based on the timeout array to pause the animation
function pause(){
  console.log("pause()");
  for (var i = 0; i<timeouts.length;i++){
    var timeout = timeouts[i];
    window.clearTimeout(timeout);
  }
}
function go(){
	// initialize the interface and visualization and start the force simulation of nodes
	init();
	initInterface();
	start();
	console.log("currentAction: " + currentAction);
	// execute an animation stopping the simulation after 2 seconds
	window.setTimeout(next, 2000);
}