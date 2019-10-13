floor = Math.floor;

function priorityQueue(key,data) {
	
	var parent = function(location){
		return floor((location+1)/2)-1;
	}
	var parentKey = function(location){
		return key[floor((location+1)/2)-1];
	}
	var left = function(location){
		return (location+1)*2-1;
	}
	var right = function(location){
		return (location+1)*2;
	}

	function exchange (location1, location2){
		var tempData = data[location2];
		var tempKey = key[location2];

		data[location2] = data[location1];
		key[location2] = key[location1];

		data[location1] = tempData;
		key[location1] = tempKey;

	}

	function maxHeapify(position){
		l = left(position);
		r = right(position);
		var largest = -1;
		if(l<= key.length && key[l] > key[position]){
			largest = l;
		}
		else largest=position;
		if(r<= key.length && key[r] > key[largest]){
			largest = r;
		}
		if(largest != position){
			exchange(position, largest);
			maxHeapify(largest);
		}
	}

	function buildMaxHeap(){
		for (i = floor((key.length)/2)-1; i>=0 ;i--){
			maxHeapify(i);
			// key.log();
			// data.log();
		}
	}

	//add new value
	function increaseKey(location, newKey){
		if(newKey<key[location]){
			console.log("error new value is smaller than the key at the given location");
			return -1;
		}

		key[location] = newKey;
		while(location > 0 && parentKey(location) < newKey){
			exchange(location, parent(location));
			location = parent(location); 
		}
	}

	this.extractMax = function(){
		if (key.length<=0){
			console.log("Error, no items to extract");
			return -1;
		}

		var maxKey = key[0];
		var maxData = data[0];
		exchange(0, key.length-1);
		key.pop();
		data.pop();

		maxHeapify(0);
		return {"key":maxKey, "data": maxData};
	}

	this.insert = function(newKey, newData){
		key[key.length] = Number.NEGATIVE_INFINITY;
		data[data.length] = newData;

		increaseKey(key.length-1, newKey);

	}
	this.convertToObject = function(){
		function addData(i){
			var nodeData = {};
			nodeData.value = key[i];
			nodeData.id = i;
			nodeData.data = data[i];
			nodeData.children = [];

			// console.log("current node: "+ i);

			var l = left(i);
			var r = right(i);

			// console.log("l: " + l);
			// console.log("r: " + r);

			// if(r<key.length) console.log(addData(r));
			// if(l<key.length) console.log(addData(l));
			if(l<key.length) nodeData.children.push(addData(l));
			if(r<key.length) nodeData.children.push(addData(r));

			// console.log(nodeData);
			return nodeData;
		}

		return addData(0);
	}

	this.size = function(){
		return key.length;
	}

	buildMaxHeap();
	console.log(key);
}

// var key = [10,2,0,4,5,20,19];
// var data = [1,2,3,4,5,6,7];
// p = new priorityQueue(key,data);
// console.log(p.convertToObject());
