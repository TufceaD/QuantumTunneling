var values = {
	nRegions: 5,
	defaultLength: 0,
	maxY: 20,
	minY: view.viewSize.height - 20,
	minX: 20,
	maxX: view.viewSize.width - 20,
	xAxisHeight: ( view.viewSize.height - 20) * .6,
	maxEnergyHeight: 75,
	walls: [],
	ceilings: [],
	Setup: function(){
		this.defaultLength =  Math.round( (this.maxX - this.minX) / this.nRegions );
	
		for ( var i = 0; i < this.nRegions-1; i++){
		this.walls[i] = this.defaultLength + this.defaultLength*i;
		}
	
		for ( var i = 0; i < this.nRegions-2; i++){
		this.ceilings[i] = Math.round( this.maxY + (this.minY - this.maxY)*Math.random() );
		}
	}
}
values.Setup();
	



var pathMainRect;
function createMainRect(){
	var topLeftCorner = new Point( 0, 0 );
	var bottomRightCorner = new Point(view.viewSize.width,view.viewSize.height);
	var mainRect = new Rectangle(topLeftCorner,bottomRightCorner);
	pathMainRect = new Path.Rectangle(mainRect);
	pathMainRect.strokeColor = 'black';
	pathMainRect.strokeWidth = 10;	
}

var axes;
function createAxes(){
	// yAxis 
	var pTop = new Point( values.minX, values.maxY );
	var pBottom = new Point( values.minX, values.minY );
	var yAxis = new Path(pTop, pBottom);
	// yAxis ArrowHead
	var pYArrowLeft = pTop + { x: -5, y: 6 };
	var pYArrowRight = pTop +{ x: 5, y: 6 };
	var pYArrowTop = pTop + { x: 0, y: 0 };
	var yAxisArrow = new Path(pYArrowLeft, pYArrowTop, pYArrowRight);
	// xAxis 
	var pLeft = new Point(values.minX, values.xAxisHeight);
	var pRight = new Point( values.maxX, values.xAxisHeight);
	var xAxis = new Path(pLeft,pRight);
	// xAxis ArrowHead
	var pXArrowTop = pRight + { x: -6, y: 5};
	var pXArrowRight = pRight + { x: 5, y: 0};
	var pXArrowBottom = pRight + {x: -6, y: -5};
	var xAxisArrow = new Path(pXArrowTop, pXArrowRight, pXArrowBottom)
	//Axes group
	axes = new Group(yAxis, yAxisArrow, xAxis, xAxisArrow);
	axes.strokeWidth = 3;
	axes.strokeColor = 'black';
	pXArrowTop = {x:10,y:10};
}


var regionsData = {
	pathWalls: [],
	pathCeilings: [],
	pathLeftSide: [],
	pathRightSide: [],
	pTop: [],
	pMiddleLeft: [],
	pMiddleRight: [],
	pBottom: [],
	pXAxis: [],
	pEnergyLeft: new Point,
	pEnergyRight: new Point,
	energy: Math.round(Math.random()*(values.xAxisHeight - values.maxEnergyHeight)),
	pathEnergy: new Path(),
	regionsGroup: new Group(),
	createData: function(){ 
		for (var i = 0; i < values.nRegions-1; i++){
		this.pTop[i] = new Point( values.walls[i], values.minY);
		this.pBottom[i] = new Point( values.walls[i], values.maxY);
		this.pXAxis[i] = new Point( values.walls[i], values.xAxisHeight);
		}
		for (var i = 0; i < values.nRegions-2; i++){
		this.pMiddleLeft[i] = new Point( values.walls[i],values.ceilings[i]);
		this.pMiddleRight[i] = new Point( values.walls[i+1],values.ceilings[i]);
		}
		this.pEnergyLeft = { x: values.minX , y: values.xAxisHeight - this.energy};
		this.pEnergyRight = { x: values.maxX , y: values.xAxisHeight - this.energy};
	},
	createRegion: function(){
		for (var i = 0; i < values.nRegions-1; i++){
		this.pathWalls[i] = new Path(this.pTop[i],this.pBottom[i]);
		this.regionsGroup.addChild(this.pathWalls[i]);
		this.pathWalls[i].dashArray = [5,5];
		}
	
		for (var i = 0; i < values.nRegions-2; i++){
		this.pathCeilings[i] = new Path(this.pMiddleLeft[i], this.pMiddleRight[i]);
		this.pathLeftSide[i] = new Path(this.pMiddleLeft[i], this.pXAxis[i]);
		this.pathRightSide[i] = new Path(this.pMiddleRight[i], this.pXAxis[i+1]);
	
		this.regionsGroup.addChild(this.pathCeilings[i]);
		this.regionsGroup.addChild(this.pathLeftSide[i]);
		this.regionsGroup.addChild(this.pathRightSide[i]);
		}
		this.pathEnergy.add(this.pEnergyLeft);
		this.pathEnergy.add(this.pEnergyRight);
		
		this.regionsGroup.addChild(this.pathEnergy);
		
		this.regionsGroup.strokeColor = 'black';
		this.regionsGroup.strokeWidth = 3;
		this.pathEnergy.strokeColor = 'blue';
		
	},
	constraintX: function( newX, temp){
	var answer;
	if ( temp == 0){
	 answer = Math.max( newX, values.minX +20);
	}else{
	answer = Math.max( newX, regionsData.pathWalls[temp-1].segments[0].point.x +20);
	}
	if ( temp == values.nRegions - 2){
	 answer = Math.min( answer , values.maxX -20);
	}else{
	answer = Math.min( answer , regionsData.pathWalls[temp+1].segments[0].point.x -20 );
		}
	return answer;
	},
	constraintY: function( newY){
	var answer;
	answer = Math.max( newY, values.maxY );
	answer = Math.min( answer, values.minY );
	return answer;
	},
	constraintE: function( newEpos){
	var answer;
	answer = Math.min( newEpos, values.xAxisHeight);
	answer = Math.max( answer, values.maxY + 20);
	return answer;
	},
	bindMouseEvents: function(){
		for (i = 0; i < values.nRegions - 1; i++){
		this.pathWalls[i].onMouseDrag = function(event) {
			var temp = regionsData.pathWalls.indexOf(this);
			
			var newXValue = regionsData.constraintX( event.point.clone().x, temp);
			regionsData.pathWalls[temp].segments[0].point.x = newXValue;
			regionsData.pathWalls[temp].segments[1].point.x = newXValue;
			
			if ( temp < values.nRegions - 2){
			regionsData.pathLeftSide[temp].segments[0].point.x = newXValue;
			regionsData.pathLeftSide[temp].segments[1].point.x = newXValue;
			regionsData.pathCeilings[temp].segments[0].point.x = newXValue;
			}
			
			if ( temp > 0 ){
			regionsData.pathRightSide[temp-1].segments[0].point.x = newXValue;
			regionsData.pathRightSide[temp-1].segments[1].point.x = newXValue;
			regionsData.pathCeilings[temp-1].segments[1].point.x = newXValue;

			}
			this.selected = true;
		}
		this.pathWalls[i].onMouseUp = function(event){
			this.selected = false;
		}
		this.pathWalls[i].onMouseLeave = function(event){
			this.selected = false;
		}
	}
	for ( i = 0; i < values.nRegions - 2; i++){
	this.pathCeilings[i].onMouseDrag = function(event){
	var temp = regionsData.pathCeilings.indexOf(this);
	var newYValue = regionsData.constraintY(event.point.clone().y);
	
	regionsData.pathCeilings[temp].segments[0].point.y = newYValue;
	regionsData.pathCeilings[temp].segments[1].point.y = newYValue;
	
	regionsData.pathLeftSide[temp].segments[0].point.y = newYValue;
	regionsData.pathRightSide[temp].segments[0].point.y = newYValue;
	
	this.selected = true;
	}
	this.pathCeilings[i].onMouseOn = function(event){
	this.selected = false;
	}
	this.pathCeilings[i].onMouseLeave = function(event){
	this.selected = false;
	}
	
	}
	this.pathEnergy.onMouseDrag = function(event){
	this.selected = true;
	var newEnergyPos = regionsData.constraintE(event.point.clone().y);
	regionsData.energy = Math.round(values.xAxisHeight - newEnergyPos);
	regionsData.pathEnergy.segments[0].point.y = newEnergyPos;
	regionsData.pathEnergy.segments[1].point.y = newEnergyPos;
	
	}
	this.pathEnergy.onMouseOn = function(event){
	this.selected = false;
	}
	this.pathEnergy.onMouseLeave = function(event){
	this.selected = false;
	}
	}
}

createMainRect();
createAxes();
regionsData.createData();
regionsData.createRegion()
regionsData.bindMouseEvents();
axes.sendToBack();
for ( i = 0; i < values.nRegions - 1; i++){
	regionsData.pathWalls[i].bringToFront();
}


console.log(values.walls)
console.log(values.ceilings)


function onResize(){
console.log(view.viewSize);
}