// initialize the buttons
function initInterface(){
    $("#next-button").click(function(){
        next();
        console.log("next()");
    });
    $("#update-button").click(function(){
      update();
    });
    $("#clear-button").click(function(){
      clear();
    });
    $("#animate-button").click(function(){
      if(!moreActions()) clear();
      animate();
    });
    $("#reset-button").click(function(){
      console.log("reset-button");
      newGraph();
    });
    $("#pause-button").click(function(){
      pause();
    });
}

// initialize global variables which control the animation
function init(){
  // array which holds timeout id's and allows them to be canceled
  timeouts = [];

  // visualization size parameters
  width = 600;
  height = 500;

// animation parameters
  transitionTime = 500;
  delay = 30;
  currentAction = 0;

// array size in algorithm
  size = 8;
//  max depth of visualization block structure, used to determine block size
  maxDepth = (Math.round(Math.log(size) / Math.LN2) + 1) * 2;

// range of y value inputs, used to create the y position scale
  range = size*2;
  division = size;
// block sizes
  blockWidth = width/size;
  blockHeight = blockWidth*.5;

  // create random array to be used in in algorithm and map visualization attributes like x and y position onto it
  var a = [];
  while(a.length < size){a.push(Math.floor( Math.random() * range) )}
  data = a.map(function(e, i){
    return {value: e, color: "a", "idX":i, "idY" :0, "posX":i,"posY":0 };
  });

  // final result of merge sort
  result = mergeSort(a);


  // append the actual svg element to the body of the html page
  svg = d3.select("#svg-container").append("svg:svg")
    .attr("width", width)
    .attr("height", height);

// function used to position the rectangles on the x axis
  xScale = d3.scale.linear()
    .domain([0, size])
    .range([0, width]);
// function used to position the rectangles on the y axis
  yScale = d3.scale.linear()
    .domain([0, maxDepth])
    .range([0, 600]);

//function used to assign class values which correspond to colors and array values
  colorScale = d3.scale.quantize()
      .domain([0, range])
      .range(d3.range(8).map(function(i) { return "q" + (i+1) + "-9"; }));
}


// initially creates and updates visualization elements
function update(){
  console.log("update()");

// bind data the array data to the rectangle elements
  rectGroup = svg.selectAll(".rect").data(data);

// remove exiting rectangle elements
  rectGroup.exit().remove();

// append a groups for new rectangle elements and their value text to the svg with attributes specified by functions
  rectGroup
    .enter()
    .append("svg:g")
    .attr("transform", function(d)
    {
      var x = xScale(d.posX);
      var y = yScale(d.posY);
      return "translate(%d, %d)".format(x,y);
    })
    // .classed("rect")
    .attr("class", function(d){
      var classString = "";
      classString += " " + colorScale(d.value);
      classString += " " + "rect";
      return classString;
    })

// append actual rectangle to the rectangle group
  rect = rectGroup
    .append("rect")
    .attr("height", blockHeight)
    .attr("width", blockWidth)

// append the value text to the rectangle group
  text = rectGroup
    .append("svg:text")
    .attr("dx", function(d){
      return blockWidth/2;
    })
    .attr("dy", function(d){
      return blockHeight/2;
     })
    .text(function(d)
     {
      return d.value;
     })

// create a transition to animate existing elements with updated data
  var t = svg.transition().duration(transitionTime);

// actually do the transition on the rectangle elements
  var trans = t.selectAll(".rect")
    .attr("class", function(d){
      var classString = "";
      classString += " " + colorScale(d.value);
      classString += " " + "rect";
      if(d.compare) classString += " compare";
      return classString;
    })
    .attr("transform", function(d)
    {
      var x = xScale(d.posX);
      var y = yScale(d.posY);
      return "translate(%d, %d)".format(x,y);
    })

}


// call a visualization function based on action object type
function evaluate(action){
    console.log("action.type: " + action.type);
    switch(action.type){
        case "split":
          addArray(action);
          break;
        case "start-merge":
          addArray(action, true);
          break;
        case "compare":
          compare(action);
          break;
        case "move":
          move(action);
          break;
    }
}

// move rectangles to a new position
function move(action){
  // invert the depth reported the the algorithm
  var depth = maxDepth - (action.depth+1) - 1;
  // retrieve the position data from the action
  var idX = action.object.idX;
  var posX = action.posX;
  // get the data to be edited
  var dataItem = getById(idX, depth);
  dataItem.posX = posX;
  dataItem.posY = depth;
  // update the animation to actually transition the rectangle svg elements
  update();
}

// add a number of rectangle elements to the visualization all at once
function addArray(action, flipped){

// get data from the action object
  var a = action.array;
  var depth = action.depth;
// if the array is for merging invert the y value so it appears in the bottom half of the visualization
  if(flipped) depth = maxDepth - (depth+1) - 1;
  var posY = flipped ? depth-1 : depth;

// create the new data elements which will correspond to new rectangles
  for (var i = 0; i<a.length;i++){
    var item = a[i];
    var newData = {"value":item, "color":"a", "idX":i+action.start, "idY": depth, "posX":i+action.start,"posY":posY};
    data.push(newData);
  }
// update the visualization to actually create the new rectangle elements from the data added
  update();
}

// highlight elements being compared by adding a "compare" class
function compare(action){
  // un mark all rectangle data
  for(d in data){
    data[d].compare = false;
  }
  // get information about objects being compared
  depth = action.depth;
  // reflect the depth reported by the algorithm so it appears in the bottom half of the visualization
  depth = maxDepth - (depth+1) - 1;
  object1 = action.object1;
  object2 = action.object2;
  // get the data for the rectangles to be updated
  data1 = getById(object1.idX, depth);
  data2 = getById(object2.idX, depth);
  // assign the compare class
  data1.compare = true;
  data2.compare = true;
  // update the visualization so the actual svg rectangles are updated
  update();

}

// execute the next action in the animation array
function next(){
  if(!moreActions()) clear();
  evaluate(animation[currentAction]);
  currentAction++;
}

// clear the visualization to its initial state
function clear(){

  currentAction = 0;

  dataClear = data.slice(0,size);
  data = [];

  update();
  next();

}

// animate all actions after the current action
function animate(aTransitionTime){
// if a special transition time isn't specified animate using the default time
    if(!aTransitionTime) var aTransitionTime = transitionTime;
    pTransitionTime = transitionTime;
    transitionTime = aTransitionTime;
    // iterate through all actions and call them in the future
    var i = currentAction;
    for (i; i<animation.length;i++){

        // create closure to evaluate i in global scope of setTimeout()
        function evaluateI(i){return function(){
            evaluate(animation[i])
            currentAction++;
        }}

// add timeouts to array so they can be cleared in the future
        timeouts.push( window.setTimeout(
            evaluateI(i)
            ,i * (transitionTime*1 + delay)
        ));
    }
// return the transition time to its default value if it was changed for the animation
    window.setTimeout(
      function(){transitionTime = pTransitionTime;}
      ,(i+1) * (transitionTime*1 + delay)
    );
}

// pause the animation by canceling any timeouts in the future
function pause(){
  // iterate through the timeout id array and cancel each one
  for (var i = 0; i<timeouts.length;i++){
    var timeout = timeouts[i];
    window.clearTimeout(timeout);
  }
}

// return the animation to its initial state
function newArray(){
  $("svg").fadeOut(300,function(){
    $("svg").remove();
    animation = [];
    init();
    // update();
    start();
    // how to call attention to action to take
    window.setTimeout(next, 2000);
  });
}

// helper methods

//check if more actions remain to be executed
function moreActions(){
  return (currentAction >= animation.length) ? false : true;
}

// return the data corresponding to a rectangle element given its x and y id's
function getById(idX, idY){
  for (var i = 0; i<data.length;i++){
    var d = data[i];
    if(d.idX == idX && d.idY == idY) return d;
  }
}


// initialize interface and visualization and start the animation
init();
initInterface();
update();
