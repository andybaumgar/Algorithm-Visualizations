floor = Math.floor;

// priorityQueue(keyArray, dataArray, [compare function(a,b): should return true if a has higher priority than b])
function priorityQueue(key, data, compare) {
	
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
		if(l<= key.length && compare(key[l], key[position])) {
			largest = l;
		}
		else largest=position;
		if(r<= key.length && compare(key[r], key[largest])) {
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
		if(compare(key[location], newKey)){
			console.log("error new value is smaller than the key at the given location");
			return -1;
		}

		key[location] = newKey;
		while(location > 0 && compare(newKey, parentKey(location))) {
			exchange(location, parent(location));
			location = parent(location); 
		}
	}

	this.extract = function(){
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
			var nodeData = {};2
			nodeData.value = key[i];
			nodeData.id = i;
			nodeData.data = data[i];
			nodeData.children = [];

			var l = left(i);
			var r = right(i);

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

	this.exists = function(dataEntry){
		return (data.indexOf(dataEntry) == -1) ? false: true; 
	}

	this.changeKey = function(dataEntry, newKey){
		if(!this.exists(dataEntry)){
			console.log("key cannot be changed: data not found");
			return false;
		}
		
		var index = data.indexOf(dataEntry);
		var oldKey = key[index];
		if(compare(newKey, oldKey)){
			increaseKey(index, newKey);
		}
		else{
			key[index] = newKey;
			maxHeapify(index);
		}
	}

	buildMaxHeap();
	// console.log(key);
}