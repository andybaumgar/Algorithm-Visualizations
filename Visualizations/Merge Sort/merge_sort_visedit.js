// create the animation array
animation = [];

// merging function
function merge(a1, a2, depth, start){
	// get the size of the arrays to be merged
	var size = a1.length;
	// create an array of sentential values to make merging easier
	var sent = [];
	while(sent.length < size){
		sent.push(Number.POSITIVE_INFINITY);
	}

	// add the sentential values to the actual arrays
	var a1 = a1.concat(sent);
	var a2 = a2.concat(sent);
	// initialize the iterator variables
	var i1 = 0; 
	var i2 = 0; 
	// initialize the array to hold the result of the merge
	var result = [];
	// while the result is incomplete keep merging
	while(result.length<size*2){
		c1 = a1[i1];
		c2 = a2[i2];

		// if the value isn't a sentential create an object to use in the instrumentation later
		if(c1 != Number.POSITIVE_INFINITY){
			var object1 = {"idX":i1+start};
		}
		if(c2 != Number.POSITIVE_INFINITY){
			var object2 = {"idX":i2+start+size};
		}
		// push the animation object signifying two values are being compared
		animation.push({"type": "compare", "depth": depth, "object1": object1, "object2":object2});

		// compare the values and add them to the resulting array
		if(c1<c2){
			result.push(c1);
			// add a animation action signifying the number has been added to the new array
			animation.push({"type": "move", "object": object1, "posX": start + result.length - 1, "depth":depth});
			i1++;
		}
		else{
			result.push(c2);
			// add a animation action signifying the number has been added to the new array
			animation.push({"type": "move", "object": object2, "posX": start + result.length - 1, "depth":depth});
			i2++;
		}
	}
	return result;
}

// recursive part of merge sort, splits up values and merges them
function mergeSortR(array, depth, start){

	// add animation action signifying the variables have been split into new arrays
	animation.push({"type": "split", "array":array, "start":start, "depth": depth})

// if the recursion has bottomed out and the array is only return 1 value then return it (it's already sorted)
	if(array.length == 1){
		return [array[0]];
	}
	// otherwise obtain two half sized sorted arrays and merge them
	else{
		var highMiddle = Math.floor(array.length/2);
		var array1 = array.slice(0, highMiddle);
		var array2= array.slice(highMiddle);

		var h1 = mergeSortR(array1, depth+1, start);
		var h2 = mergeSortR(array2, depth+1, start + highMiddle);

		// add animation action signifying the merging has begun
		animation.push({"type": "start-merge", "array":h1.concat(h2), "start":start, "depth": depth})
		return merge(h1,h2, depth, start)
	}
}

// initialize the depth and array start values and begin the recursion
function mergeSort(array){
	depth = 0;
	start = 0;

	return mergeSortR(array, depth, start);
}