// initialize the animation array
animation = [];

// create a shortcut for the floor function
floor = Math.floor;

// create a new priority queue object from an array of keys and data
function priorityQueue(key,data) {
	
	// compute various index relationships within the array
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

// swap the keys and data of 2 locations within the array
	function exchange (location1, location2){
		console.log("inside exchange");

		var tempData = data[location2];
		var tempKey = key[location2];

		data[location2] = data[location1];
		key[location2] = key[location1];

		data[location1] = tempData;
		key[location1] = tempKey;

		// add an animation object signifying that array locations are begin swapped
		animation.push({"type":"swap", elements:[location1,location2]})

	}

// repair the heap from top down given a position
	function maxHeapify(position){
		// console.log("maxHeapify: "+position);
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

// create a max heap by heaping every index in the array
	this.buildMaxHeap = function(){
		for (i = floor((key.length)/2)-1; i>=0 ;i--){
			// add an animation object signifying that the heap build has begun
			animation.push({type:"buildHeapify", time:"start", element:i})
			maxHeapify(i);
			// add an animation object signifying that the heap build has ended
			animation.push({type:"buildHeapify", time:"end", element:i})

		}
	}

	//add new value
	function increaseKey(location, newKey){
		// if the key is not actually being increased sound an error
		if(newKey<key[location]){
			console.log("error new value is smaller than the key at the given location");
			return -1;
		}

		// change the key at the given location and swap it towards the top until it is no longer greater than its parent
		key[location] = newKey;
		while(location > 0 && parentKey(location) < newKey){
			exchange(location, parent(location));
			location = parent(location); 
		}
	}

// extract the minimum value of the queue
	this.extractMax = function(){
		// if there are no items to extract sound an error
		if (key.length<=0){
			console.log("Error, no items to extract");
			return -1;
		}

// get the values of the max item to be extracted
		var maxKey = key[0];
		var maxData = data[0];

// replace the maximum key with the minimum one
		exchange(0, key.length-1);

// add an animation object symbolizing that a node is being returned and a node is being deleted in the priority queue
		animation.push({type:"returnNode", element:key.length-1})
		animation.push({type:"deleteNode", element:key.length-1})
		key.pop();
		data.pop();
// add an animation object symbolizing that an extract heapify operation is beginning
		animation.push({type:"extractHeapify", time:"start", element:0})
		// swap the top element down until the heap is all repaired
		maxHeapify(0);
		// add an animation object symbolizing that an extract heapify operation is beginning
		animation.push({type:"extractHeapify", time:"end", element:0})

// return an object with the key and data of the max item
		return {"key":maxKey, "data": maxData};
	}

// insert a new item into the heap
	this.insert = function(newKey, newData){

// add an animation object symbolizing that a node is being added to the heap
		animation.push({type:"pushNode", element:{id:key.length, data:newData, value: newKey}, parent:parent(key.length)})
		
// insert a new key into the heap at the end
		key[key.length] = Number.NEGATIVE_INFINITY;
		data[data.length] = newData;

// swap the key to the top until the parent is no longer less than the new key
		increaseKey(key.length-1, newKey);

	}
// convert the heap to a tree to be used with the d3 tree;
	this.convertToObject = function(){
		function addData(i){
			// recursively add the children to the current node
			var nodeData = {};
			nodeData.value = key[i];
			nodeData.id = i;
			nodeData.data = data[i];
			nodeData.children = [];

			var l = left(i);
			var r = right(i);
			// recursively add the left and right children to the tree to be returned
			if(l<key.length) nodeData.children.push(addData(l));
			if(r<key.length) nodeData.children.push(addData(r));

			return nodeData;
		}

		// return the whole tree
		return addData(0);
	}
}
