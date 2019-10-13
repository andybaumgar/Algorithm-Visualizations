animation = [];

function prims(G, w, r){		
	for(var i = 0; i < G.length; i++){
		G[i].prev = null;
		G[i].key = Infinity;
	}  
	r.key = 0;
	var key = [];
	for (i = 0; i < G.length;i++){
		key.push(G[i].key);
	}
	p = new priorityQueue(key, G, function(a, b){return a < b;});
	while(p.size() > 0){
		var e = p.extract();
		var u = e.data;
		animation.push({"type":"extract", element:u.id});
		u.key = e.key;
		u.connections.forEach(function(v) {
			animation.push({"type":"evaluate", "element": v.id});
			if(p.exists(v) && w(u,v) < v.key){
				animation.push({"type":"change-key", "element": v.id});
				if(w(v,v.prev) > w(u,v)){
					animation.push({"type":"add-prev", add:[u.id, v.id], remove:[v.id, (v.prev) ? v.prev.id : null]});  
					v.prev = u;
					p.changeKey(v, w(u,v));
				}
			}
		})  
		animation.push({"type":"finish-extract", "element": u.id});
	}
	animation.push({"type":"return"});
	return G;
}