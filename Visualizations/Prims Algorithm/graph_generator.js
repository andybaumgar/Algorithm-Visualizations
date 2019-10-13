// helper function to copy arrays
Array.prototype.copy = function() {
	return this.map(function(e){return e;});
};

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

// pop an elements given its index in the rray
Array.prototype.popByIndex = function(index){
  if(this.length == 0) return null;
  var element = this[index];
  this.remove(index);
  return element;
}

// generate a random integer from low to high
function randomIntInclusive(low, heigh){
   return Math.floor(((heigh-low+1) * Math.random() ) + low);
}

// pup an random node from an array
Array.prototype.popRandomNode = function(){
   var nodeIndex = randomIntInclusive(0 , this.length-1);
   return this.popByIndex(nodeIndex);
}

// generate a random graph based on the total number of nodes, total number of links and the max links allowed per vertex
function randomGraph(numNodes, numLinks, maxLinksEach){

// initialize graph to return
  var graph = {"nodes":[], "links":[]};
  
  // initialize nodes who have reached maximum number of links and those with no links
  var fullNodes = [];
  var idWithoutLinks = [];

  // create all vertexes in the graph and append them to the graph array
  for(var i = 0; i<numNodes; i++){
    graph.nodes.push({"id":i, "connections":[], "links": []});
  }

// create links until the desired amount is obtained
  for (var i = 0; i<numLinks; i++){  

// get two nodes from the graph to consider for creating an edge
    node1 = graph.nodes.popRandomNode();
    
// if the nodes have already reached their edge limit don't consider them and continue
    if(node1 == null){
       continue;
    }
    node2 = graph.nodes.popRandomNode();
    if(node2 == null){
      graph.nodes.push(node1);
      continue;
    }

// if the edge hasn't already been added add it to the nodes adjacency list and the link list
    if(node1.connections.indexOf(node2) == -1 && node2.connections.indexOf(node1)== -1){
      // add nodes to the adjacency list for each node
      node1.connections.push(node2);
      node2.connections.push(node1);

// create a link add add it to the link list
      tempLink = {"source":node1.id, "target":node2.id, "weight":Math.floor(Math.random()*30)};
      graph.links.push(tempLink);
      node1.links.push(tempLink);
      node2.links.push(tempLink);
    }
// if the nodes now have reached the max number of links allowed push them into a separate list so they are no longer considered
    (node1.connections.length < maxLinksEach) ? graph.nodes.push(node1) : fullNodes.push(node1);
    (node2.connections.length < maxLinksEach) ? graph.nodes.push(node2) : fullNodes.push(node2);

  }
  // combine the full nodes and graph nodes (those with 1 less than the maximum allowed links) and return the result
  graph.nodes.push.apply(graph.nodes, fullNodes);
  return graph;
}