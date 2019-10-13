function prims(G, w, r){		

	for(var i = 0; i < G.length; i++){
		G[i].prev = null;
		G[i].key = Infinity;
	}
	r.key = 0;

	var key = [];
	for (i = 0; i<G.length;i++){
		key.push(G[i].key);
	}

  p = new priorityQueue(key, G, function(a, b){return a<b;});
	
  while(p.size() > 0){
				
  	var e = p.extract();
  	var u = e.data;
  	u.key = e.key;
  	
  	u.connections.forEach(function(v) {
  		if(p.exists(v) && w(u,v) < v.key){
  			v.prev = u;
  			p.changeKey(v, w(u,v));
  		}
  	})
  }
}


