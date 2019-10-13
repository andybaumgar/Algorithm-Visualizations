function merge(a1, a2){
	var size = a1.length;
	var sent = [];
	while(sent.length < size){
		sent.push(Number.POSITIVE_INFINITY);
	}
	var a1 = a1.concat(sent);
	var a2 = a2.concat(sent);
	var i1 = 0; 
	var i2 = 0; 
	var result = [];
	while(result.length<size*2){
		c1 = a1[i1];
		c2 = a2[i2];
		if(c1<c2){
			result.push(c1);
			i1++;
		}
		else{
			result.push(c2);
			i2++;
		}
	}
	return result;
}

function mergeSort(array){
	if(array.length == 1){
		return [array[0]];
	}
	else{
		var h1 = mergeSort(array.slice(0,Math.floor(array.length/2)));
		var h2 = mergeSort(array.slice(Math.floor(array.length/2)));
		return merge(h1,h2)
	}
}


array = [5,2,4,6,6,2,4,8];
console.log(mergeSort(array));