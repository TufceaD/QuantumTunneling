var values = {
	nregions: 5,
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
		this.defaultLength =  Math.round( (this.maxX - this.minX) / this.nregions );
	
		for ( var i = 0; i < this.nregions-1; i++){
		this.walls[i] = this.defaultLength + this.defaultLength*i;
		}
	
		for ( var i = 0; i < this.nregions-2; i++){
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
	energy: Math.random()*(values.xAxisHeight - values.maxEnergyHeight),
	regionsGroup: new Group(),
	createData: function(){ 
		for (var i = 0; i < values.nregions-1; i++){
		this.pTop[i] = new Point( values.walls[i], values.minY);
		this.pBottom[i] = new Point( values.walls[i], values.maxY);
		this.pXAxis[i] = new Point( values.walls[i], values.xAxisHeight);
		}
		for (var i = 0; i < values.nregions-2; i++){
		this.pMiddleLeft[i] = new Point( values.walls[i],values.ceilings[i]);
		this.pMiddleRight[i] = new Point( values.walls[i+1],values.ceilings[i]);
		}
	},
	createregion: function(){
		for (var i = 0; i < values.nregions-1; i++){
		this.pathWalls[i] = new Path(this.pTop[i],this.pBottom[i]);
		this.regionsGroup.addChild(this.pathWalls[i]);
		this.pathWalls[i].dashArray = [5,5];
		}
	
		for (var i = 0; i < values.nregions-2; i++){
		this.pathCeilings[i] = new Path(this.pMiddleLeft[i], this.pMiddleRight[i]);
		this.pathLeftSide[i] = new Path(this.pMiddleLeft[i], this.pXAxis[i]);
		this.pathRightSide[i] = new Path(this.pMiddleRight[i], this.pXAxis[i+1]);
	
		this.regionsGroup.addChild(this.pathCeilings[i]);
		this.regionsGroup.addChild(this.pathLeftSide[i]);
		this.regionsGroup.addChild(this.pathRightSide[i]);
		}
		this.regionsGroup.strokeColor = 'black';
		this.regionsGroup.strokeWidth = 3;
	},
	bindMouseEvents: function(){
		for (i = 0; i < values.nregions - 1; i++){
		this.pathWalls[i].onMouseDrag = function(event) {
			var temp = this.index;
			var newXValue = event.point.clone().x;
			regionsData.pathWalls[temp].segments[0].x = newXValue;
			regionsData.pathWalls[temp].segments[1].x = newXValue;
			this.selected = true;
		}
		this.pathWalls[i].onMouseUp = function(event){
			this.selected = false;
		}
	}
	}
}

createMainRect();
createAxes();
regionsData.createData();
regionsData.createregion()
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