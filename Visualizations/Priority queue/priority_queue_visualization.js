function init(){

    //set visualization parameters
    marginX = 30;
    // set the size to either the current width of 460 pixels, which ever is less
    size = {width:Math.min($(document).width(), 1000) - 2 * marginX, height:460};
    // set the height of the tree compared to the total svg
    heightFraction = .55;
    circleRadius = 10;
    // set the depth of the tree
    expSize = 5;
    valueRange = Math.pow(2,expSize)-2;

    // set animation parameters
    transitionTime = 300;
    fastTime = 100;
    delay = 30;

    // compensate for slow firefox rendering
    if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1)
    {
        delay = 130;
        transitionTime = 200;
        fastTime = 0;
    }
    // set animation easing function
    easeFunction = "linear";

    // lay out the visualization
    eNodeSpacing = 5;
    eOffsetY = 100;
    eOffsetX = 25;
    eBoxHeight = 75;
    enodeY = size.height * heightFraction + eOffsetY;

    // initialize the animation array
    animation = [];

    //create scaling functions to size the circles based on the key value
    sizeScale = function(d){
        return Math.sqrt(d.value/valueRange*400+40);
    }

    enodeScale = function(d,i){
        return "translate(" + String((eNodeSpacing * i) + eOffsetX + eNodeSum) + "," + enodeY  + ")";
    }

    //create color scale
    quantize = d3.scale.quantize()
        .domain([0, valueRange])
        .range(d3.range(8).map(function(i) { return "q" + (i+1) + "-9"; }));

    //make priority queue
    var key = [];
    var data = [];

    for (i = 0; i<valueRange;i++){
        // key[i] = Math.floor(Math.random()*valueRange);
        key[i] = i;
        data[i] = i;
    }

    p = new priorityQueue(key, data);
    p.buildMaxHeap();
    graph = p.convertToObject();


    // initialize the tree  

// create an new tree object to layout the tree
    tree = d3.layout.tree()
        .size([size.width, size.height*heightFraction])

// assign the node to the tree object
    nodes = tree(graph);
    links = tree.links(nodes);

// set the parents to themselves so the children grow from their parents
    graph.parent = graph;
    graph.px = graph.x;
    graph.py = graph.y;

    // create the actual svg element
    svg = d3.select("#container")
     .append("svg:svg").attr("width", size.width).attr("height", size.height)
     .append("svg:g")
     .attr("class", "container")
     .attr("transform", "translate(0," + 30+")");

    // create box for extracted nodes
    eBox = svg
        .append("svg:rect")
        .attr("height", eBoxHeight)
        .attr("width", size.width-eOffsetX*2)
        .attr("x", eOffsetX)
        .attr("y", enodeY - eBoxHeight/2)
        .attr("stroke", "black")
        .attr("class", "dotted-box")
        // .attr("rx", 5)
        // .attr("ry", 5);

// create the text for the extracted node box
    eText = svg
    .append("svg:text")
    .attr("height", eBoxHeight)
    .attr("width", size.width-eOffsetX*2)
    .attr("x", eOffsetX)
    .attr("y", enodeY - eBoxHeight/2)
    .attr("class", "eText")
    .attr("dy", -7)
    .text("extracted nodes")



     // initialize node and link svg elements
    nodeGroup = svg.selectAll(".node"),
    link = svg.selectAll(".link");

    // initialize extracted node values
    eNodes = [];
    eNodeSum = 0;
    eNodeGroup = svg.selectAll(".extracted");

    // create function shortcut
    diagonal = d3.svg.diagonal();
}

// initialize the buttons in the interface
function initInterface(){

    $("#buildheap-button").click(function(){
        var key = [];
        var data = [];

        for (i = 0; i<valueRange;i++){
            // key[i] = Math.floor(Math.random()*valueRange);
            key[i] = i;
            data[i] = i;
        }

        p = new priorityQueue(key, data);
        graph = p.convertToObject();

        animation = [];

        eNodes = [];
        eNodeSum = 0;

        refresh(function(){
            p.buildMaxHeap();
            animate(fastTime)
        });
    });
    $("#restart-button").click(function(){
        restart();
    });
 $("#insert-button").click(function(){
        var insertAmount = Math.round(Number($("#insert-text").val()))%500;
        animation = [];
        p.insert(insertAmount);
        animate();
    });
    $("#extractMax-button").click(function(){
        animation = [];
        p.extractMax();
        animate();

    });
}

// refresh the visualization directly from priority queue data
function refresh(callback){
    console.log("inside refresh");

    graph = p.convertToObject();
    console.log(graph);

    // initialize the tree  
    tree = d3.layout.tree()
        .size([size.width, size.height*heightFraction])
    console.log(nodes);
    nodes = tree(graph);
    links = tree.links(nodes);

    graph.parent = graph;
    graph.px = graph.x;
    graph.py = graph.y;

// fade the tree out
    $("svg").animate({ opacity: 0 }, function(){update(0);})

    if(callback) $("svg").animate({ opacity: 1} , callback);
    else $("svg").animate({ opacity: 1})


}

// restart the queue with new data
function restart(){

// reset the animation array and priority queue
    animation = [];
    var key = [];
    var data = [];

    for (i = 0; i<valueRange;i++){
        // key[i] = Math.floor(Math.random()*valueRange);
        key[i] = i;
        data[i] = i;
    }

    p = new priorityQueue(key, data);
    graph = p.convertToObject();
    // refresh(function(){
    //     animate(100);
    // });

    p.buildMaxHeap();

    eNodes = [];
    eNodeSum = 0;

    refresh();
}

// initially create and then update svg elements
function update(updateTime){

    console.log("inside update");
    // bind data to svg elements
    nodeGroup = svg.selectAll(".node").data(tree(graph), function(d) { return d.id; });
    link = link.data(tree.links(nodes), function(d) { return d.source.id + "-" + d.target.id; });
    eNodeGroup = eNodeGroup.data(eNodes);

    // remove old elements
    link.exit().remove();
    nodeGroup.exit().remove();
    eNodeGroup.exit().remove();

    // add new svg elements

    // add new links
    link.enter().insert("path", ".node")
         .attr("class", function(d){
            var id = d.target.id-1
            return "link l"+id;
         })
         // .attr("d", diagonal)
         .attr("d", function(d) {
            if(!isNaN(d.source.px) && !isNaN(d.source.py)){
                var o = {x: d.source.px, y: d.source.py};
                return diagonal({source: o, target: o});
            }
        })
         .attr("fill", "none")
         .attr("stroke","gray")

    // add new extracted nodes to bottom of page
     newE = eNodeGroup.enter()
         .append("svg:g")
         .attr("transform", function(d,i)
         {
             return enodeScale(d,i);
         })
         .attr("class", function(d){
            return quantize(d.value)+ " enode" ;
         })

// append circle svg elements to extract node groups
     newE.append("svg:circle")
        .attr("r", function(d){
            return sizeScale(d);
         })

// append text to extracted node groups
     newE.append("svg:text")
        .attr("dx", function(d){
            return String(String(d.value).length*(-.3))+"em";
        })
        .attr("dy", function(d){
            return 5;
         })
        .text(function(d)
         {
             return d.value;
         })

    // add new tree nodes
     newGroups = nodeGroup.enter()
         .append("svg:g")
         .attr("transform", function(d)
         {
             return "translate(" + d.parent.px + "," + d.parent.py + ")";
         })
         .attr("class", function(d){
            return quantize(d.value)+ " id" + d.id + " node" ;
         })

// append circles to new nodes
     nodeCircles = newGroups
        .append("svg:circle")
        .attr("r", function(d){
            return sizeScale(d);
         })

// append text to new nodes
     text = newGroups
        .append("svg:text")
        .attr("dx", function(d){
            return String(String(d.value).length*(-.3))+"em";
        })
        .attr("dy", function(d){
            return 5;
         })
        .text(function(d)
         {
             return d.value;
         })


    // move/transition existing elements to new positions

// if a special update time used set it
    if(typeof updateTime === 'undefined') var updateTime = transitionTime;

    if(updateTime == 0) var t = svg
    else var t = svg.transition().duration(updateTime);

    console.log("selecting all .node");
    console.log(svg.selectAll(".node"));

// create a transition object from the selection and animate the nodes according to new data 
    nodeGroupT = t.selectAll(".node")
        .attr("transform", function(d,i)
         {
            d.px = d.x;
            d.py = d.y
            return "translate(" + d.x + "," + d.y + ")";
         })
         .attr("class", function(d){
            return quantize(d.value)+ " id" + d.id + " node" ;
         });

         console.log("node group t");
         console.log(nodeGroupT);


// animate the node svg circles according to new data
     nodeCircles = nodeGroupT.selectAll("circle")
        .attr("r", function(d){
            console.log("this");
            var parentData = d3.select(this.parentNode).data()[0];
            // console.log(parentData);
            return sizeScale(parentData);
         })

        console.log("node circles");
        console.log(nodeCircles);

// transition the new text
     text = nodeGroupT.selectAll("text")
        .attr("dx", function(d){
            var parentData = d3.select(this.parentNode).data()[0];
            return String(String(parentData.value).length*(-.3))+"em";
        })
        .attr("dy", function(d){
            return 5;
         })
        .text(function(d)
         {
            var parentData = d3.select(this.parentNode).data()[0];
             return parentData.value;
         })

// transition the links to new positions.
    t.selectAll(".link")
      .attr("d", diagonal);
}


// helper functions

// return size of d3 selection
d3.selection.prototype.size = function() {
    var n = 0;
    this.each(function() { ++n; });
    return n;
};

// given a node id return the node object itself
function getNodeById(nodeId){
    for (i in nodes){
        if(nodes[i].id == nodeId) return nodes[i];
    }
}

// get all the decendent id's of a given node id
function getChildren(id, nodes){

    var node = getNodeById(id);
    var childrenIds = [];

    function getChildrenHelper(node){
        childrenIds.push(node.id)
        if(node.children){
            for (var i in node.children){ getChildrenHelper(node.children[i])}
        }
    }

    getChildrenHelper(node);
    childrenIds.shift()
    return childrenIds
}

//animation operations

//swap two nodes in the visualization
function swap(n1, n2){
    // get node and svg nodeGroup
    group1 = d3.select(".id"+n1);
    group2 = d3.select(".id"+n2);
    node1 = getNodeById(n1);
    node2 = getNodeById(n2);

    // swap the node data
    node1Temp = {id:node1.id, value:node1.value, data:node1.data};

    node1.value = node2.value;
    node1.data = node2.data;

    node2.value = node1Temp.value;
    node2.data = node1Temp.data;

    //visually swap nodes temporarily
    group1.transition().ease(easeFunction).duration(transitionTime)
        .attr("transform", function(d)
             { return "translate(" + node2.x + "," + node2.y + ")";}
        )
    group2.transition().ease(easeFunction).duration(transitionTime)
        .attr("transform", function(d)
            {return "translate(" + node1.x + "," + node1.y + ")";})
    
    // update tree with real computed data
        .each("end", function(){update(0)})

}

// highlight the child links of a node to indicate a heapify operation
function lightChildLinks(id, isOn){
    var childrenNodes = getChildren(id, nodes)
    var links = childrenNodes.map(function(i){return i-1})
    for(var key in links){
        var color = isOn ? "red" : "grey"
        d3.select(".l"+links[key]).transition().attr("stroke", color);
    }
}

// remove a node from the visualization
function deleteNode(id){

    var deleteNode = getNodeById(id);

// remove the node from all its parents and children
    if("parent" in deleteNode){
        var children = deleteNode.parent.children
        for (i in children){
            if(children[i].id == deleteNode.id) {
                children.splice(i, 1);
                break;
            }
        }
    }

    //delete node in nodes array

    for(i in nodes){
        if(nodes[i].id == id){
            nodes.splice(i, 1);
            break;
        }
    }

    update();
}

// return a node in the visualization
function returnNode(id){
    var nodeGroup = svg.select(".id"+id);

    // mark the node as marked so the user can visually follow it
    nodeGroup.select("circle").attr("id", "marked");

// get the node to returned
    var retNode = getNodeById(id);
    newE = {id:retNode.id, value:retNode.value, data:retNode.data}

// set the position of the extracted node
    if(eNodes.length != 0){
        eNodeSum += sizeScale(newE) + sizeScale(eNodes[eNodes.length-1]); 
    }
    else eNodeSum += sizeScale(newE)*2; 

// add the extracted node to the array 
    eNodes.push(newE);


// transition the elements to visually show the node being extracted
    nodeGroup.transition()
        .duration(transitionTime)
        .attr("transform", function(d,i){
            return enodeScale(d, eNodes.length-1);
        })
        // .each("end", update(0))
}

// push a node into the queue in the visualization
function pushNode(newNode, parent){
    var p = getNodeById(parent);
    if (p.children) p.children.push(newNode); else p.children = [newNode];
    nodes.push(newNode);
    update();
}

// call a visualization function based on action type
function evaluate(action){
    console.log("action.type: " + action.type);
    switch(action.type){
        case "swap":
            swap(action.elements[0], action.elements[1]);
            break;
        case "buildHeapify":
            if(action.time == "start") lightChildLinks(action.element, true)
            else lightChildLinks(action.element, false);
            break;  
        case "deleteNode":
            console.log("case delete node");
            deleteNode(action.element);
            break;
        case "returnNode":
            returnNode(action.element);
            break;
        case "extractHeapify":
            if(action.time == "start") lightChildLinks(action.element, true)
            else lightChildLinks(action.element, false);
            break;
        case "pushNode":
            pushNode(action.element, action.parent);
            break;
    }
}

// evaluate all opperations in the animation queue
function animate(aTransitionTime){

// if a special transition time is set change the global transition time to match
    if(!aTransitionTime) var aTransitionTime = transitionTime;
    pTransitionTime = transitionTime;
    transitionTime = aTransitionTime;

// evaluate a series of animation objects
    for (i = 0; i<animation.length;i++){

        // create closure to evaluate i in global scope of setTimeout()
        function evaluateI(i){return function(){
            evaluate(animation[i])
        }}

        window.setTimeout(
            evaluateI(i)
            ,i * (transitionTime*1 + delay)
        )
    }

// reset the transition time to its original value when the animation is done
    window.setTimeout(
            function(){transitionTime = pTransitionTime;}
            ,(i+1) * (transitionTime*1 + delay)
        );
}

// initialize the interface and visualization and update the values without a transition

initInterface();
init();
update(0);

