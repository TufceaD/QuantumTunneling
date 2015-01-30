var values = {
		nRegions: 5,
		defaultLength: 0,
		maxY: 20,
		minY: view.viewSize.height - 20,
		minX: 20,
		maxX: view.viewSize.width - 20,
		xAxisHeight: ( view.viewSize.height - 20) * .7,
		maxEnergyHeight: 75,
		walls: [],
		ceilings: [],
		yScale: 1000,
		randomSetup: function(){
			this.defaultLength =  Math.round( (this.maxX - this.minX) / this.nRegions );

			for ( var i = 0; i < this.nRegions-1; i++){
				this.walls[i] = this.defaultLength + this.defaultLength*i;
			}

			for ( var i = 0; i < this.nRegions-2; i++){
				this.ceilings[i] = Math.round( this.maxY + (this.minY - this.maxY)*Math.random() );
			}
		}
};
values.randomSetup();

var physics = {
		hbar: 100,
		mass: 1/2,
		lambda: 1/5,
		rExpPlus: function(x,E,V){
			var xScaled = x*physics.lambda;
			var q = math.sqrt(2*physics.mass*(V-E))/physics.hbar;
			return math.exp(math.complex(xScaled*q,0));
		},
		rExpMinus: function(x,E,V){
			var xScaled = x*physics.lambda;
			var q = math.sqrt(2*physics.mass*(V-E))/physics.hbar;
			return math.exp(math.complex(-xScaled*q,0));
		},
		cExpPlus: function(x,E,V){
			var xScaled = x*physics.lambda;
			var k = math.sqrt(2*physics.mass*(E-V))/physics.hbar;
			return answer = math.exp(math.complex(0,xScaled*k));
		},
		cExpMinus: function(x,E,V){
			var xScaled = x*physics.lambda;
			var k = math.sqrt(2*physics.mass*(E-V))/physics.hbar;
			return answer = math.exp(math.complex(0,-xScaled*k));
		},
		rExpPlusPrime: function(x,E,V){
			var xScaled = x*physics.lambda;
			var q = math.sqrt(2*physics.mass*(V-E))/physics.hbar;
			return math.multiply( math.complex(q,0) , physics.rExpPlus(x,E,V));
		},
		rExpMinusPrime: function(x,E,V){
			var xScaled = x*physics.lambda;
			var q = math.sqrt(2*physics.mass*(V-E))/physics.hbar;
			return math.multiply( math.complex(-q,0) , physics.rExpMinus(x,E,V));
		},
		cExpPlusPrime: function(x,E,V){
			var xScaled = x*physics.lambda;
			var k = math.sqrt(2*physics.mass*(E-V))/physics.hbar;
			return math.multiply( math.complex(0,k) , physics.cExpPlus(x,E,V));
		},
		cExpMinusPrime: function(x,E,V){
			var xScaled = x*physics.lambda;
			var k = math.sqrt(2*physics.mass*(E-V))/physics.hbar;
			return math.multiply( math.complex(0,-k) , physics.cExpMinus(x,E,V));
		},
		linear: function(x,E,V){
			var xScaled = x*physics.lambda;
			return math.complex(xScaled, 0);
		},
		constant: function(x,E,V){
			var xScaled = x*physics.lambda;
			return math.complex(1, 0);
		},
		zero: function(x,E,V){
			var xScaled = x*physics.lambda;
			return math.complex(0, 0);
		}
};


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
	var xAxisArrow = new Path(pXArrowTop, pXArrowRight, pXArrowBottom);
	//Axes group
	axes = new Group(yAxis, yAxisArrow, xAxis, xAxisArrow);
	axes.strokeWidth = 3;
	axes.strokeColor = 'black';
}


var regionsData = {
		pathWalls: [],
		pathCeilings: [],
		pathLeftSide: [],
		pathRightSide: [],
		pathPlotComplex: new Path(),
		pathPlotReal: new Path(),
		pTop: [],
		pMiddleLeft: [],
		pMiddleRight: [],
		pBottom: [],
		pXAxis: [],
		pEnergyLeft: new Point(),
		pEnergyRight: new Point(),
		energy: Math.random()*(values.xAxisHeight - values.maxEnergyHeight),
		potentials: [],
		boundaries: [],
		pathEnergy: new Path(),
		matrixCoefs: math.zeros(values.nRegions*2 - 1, values.nRegions*2 - 1),
		vectorCoefs: [],
		solutionCoefs: [],
		functionHandles: [],
		regionsGroup: new Group(),
		createData: function(){ 
			for (var i = 0; i < values.nRegions-1; i++){
				this.pTop[i] = new Point( values.walls[i], values.minY);
				this.pBottom[i] = new Point( values.walls[i], values.maxY);
				this.pXAxis[i] = new Point( values.walls[i], values.xAxisHeight);
				this.boundaries[i] = values.walls[i];
			}
			for (var i = 0; i < values.nRegions-2; i++){
				this.pMiddleLeft[i] = new Point( values.walls[i],values.ceilings[i]);
				this.pMiddleRight[i] = new Point( values.walls[i+1],values.ceilings[i]);
				this.potentials[i+1] = values.xAxisHeight - values.ceilings[i];
			}
			this.potentials[0] = 0;
			this.potentials[values.nRegions - 1] = 0;
			this.pEnergyLeft = { x: values.minX , y: values.xAxisHeight - this.energy};
			this.pEnergyRight = { x: values.maxX , y: values.xAxisHeight - this.energy};

			for (var i = 0; i < values.nRegions*2 - 1; i++){
				this.vectorCoefs[i] = 0;
			}
			this.vectorCoefs[values.nRegions*2 - 2] = 1;



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
			this.pathPlotComplex.strokeColor = 'red';
			this.pathPlotComplex.strokeWidth = 3;
			this.pathPlotReal.strokeColor = 'green';
			this.pathPlotReal.strokeWidth = 3;

		},
		constraintX: function( newX, temp){
			var answer;
			if ( temp == 0){
				answer = Math.max( newX, values.minX +5);
			}else{
				answer = Math.max( newX, regionsData.pathWalls[temp-1].segments[0].point.x +5);
			}
			if ( temp == values.nRegions - 2){
				answer = Math.min( answer , values.maxX -5);
			}else{
				answer = Math.min( answer , regionsData.pathWalls[temp+1].segments[0].point.x -5 );
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
			answer = Math.min( newEpos, values.xAxisHeight - 2);
			answer = Math.max( answer, values.maxY + 20);
			return answer;
		},
		setFunctionHandles: function() {
			for (var i = 0; i < values.nRegions -1; i++){
				var index = 2*i;
				var E = regionsData.energy;
				var V = regionsData.potentials[i];
				if ( E < V ){
					this.functionHandles[index] = physics.rExpPlus;
					this.functionHandles[index+1] = physics.rExpMinus;
				}else if ( E > V ){
					this.functionHandles[index] = physics.cExpPlus;
					this.functionHandles[index+1] = physics.cExpMinus;
				}else{
					this.functionHandles[index] = physics.linear;
					this.functionHandles[index+1] = physics.constant;
				}
			}
			this.functionHandles[values.nRegions*2 - 2] = physics.cExpPlus;
		},
		setMatrix: function(){
			for (var i = 0 ; i < values.nRegions - 1; i++ ){
				setRightBoundaryConditions(i);
			}
			for (var i = 1 ; i < values.nRegions ; i++ ){
				setLeftBoundaryConditions(i);
			}

			regionsData.matrixCoefs.set([values.nRegions*2 - 2 , 0],1);
			regionsData.matrixCoefs.set([values.nRegions*2 - 2 , 1],0);

			function setRightBoundaryConditions(index){
				var indexI = 2*index;
				var indexJ = 2*index;
				var x = regionsData.boundaries[index];
				var E = regionsData.energy;
				var V = regionsData.potentials[index];
				if ( E < V ){
					regionsData.matrixCoefs.set([indexI, indexJ], physics.rExpPlus(x,E,V));
					regionsData.matrixCoefs.set([indexI, indexJ+1], physics.rExpMinus(x,E,V));
					regionsData.matrixCoefs.set([indexI+1, indexJ], physics.rExpPlusPrime(x,E,V));
					regionsData.matrixCoefs.set([indexI+1, indexJ+1], physics.rExpMinusPrime(x,E,V));
					for (var k = 0; k < values.nRegions*2 -1; k++){
					}
				}else if ( E > V ){
					regionsData.matrixCoefs.set([indexI, indexJ], physics.cExpPlus(x,E,V));
					regionsData.matrixCoefs.set([indexI, indexJ+1], physics.cExpMinus(x,E,V));
					regionsData.matrixCoefs.set([indexI+1, indexJ], physics.cExpPlusPrime(x,E,V));
					regionsData.matrixCoefs.set([indexI+1, indexJ+1], physics.cExpMinusPrime(x,E,V));
				}else{
					regionsData.matrixCoefs.set([indexI, indexJ], physics.linear(x,E,V));
					regionsData.matrixCoefs.set([indexI, indexJ+1], physics.constant(x,E,V));
					regionsData.matrixCoefs.set([indexI+1, indexJ], physics.constant(x,E,V));
					regionsData.matrixCoefs.set([indexI+1, indexJ+1], physics.zero(x,E,V));
				}
			}
			function setLeftBoundaryConditions(index){
				var indexI = 2*index -2;
				var indexJ = 2*index;
				var x = regionsData.boundaries[index-1];
				var E = regionsData.energy;
				var V = regionsData.potentials[index];
				if (index == values.nRegions - 1){
					regionsData.matrixCoefs.set([indexI, indexJ], math.multiply(-1, physics.cExpPlus(x,E,V)));
					regionsData.matrixCoefs.set([indexI+1, indexJ], math.multiply(-1, physics.cExpPlusPrime(x,E,V)));
				} else{
					if ( E < V ){
						regionsData.matrixCoefs.set([indexI, indexJ], math.multiply(-1, physics.rExpPlus(x,E,V)));
						regionsData.matrixCoefs.set([indexI, indexJ+1], math.multiply(-1, physics.rExpMinus(x,E,V)));
						regionsData.matrixCoefs.set([indexI+1, indexJ], math.multiply(-1, physics.rExpPlusPrime(x,E,V)));
						regionsData.matrixCoefs.set([indexI+1, indexJ+1], math.multiply(-1, physics.rExpMinusPrime(x,E,V)));
					}else if ( E > V ){
						regionsData.matrixCoefs.set([indexI, indexJ], math.multiply(-1, physics.cExpPlus(x,E,V)));
						regionsData.matrixCoefs.set([indexI, indexJ+1], math.multiply(-1, physics.cExpMinus(x,E,V)));
						regionsData.matrixCoefs.set([indexI+1, indexJ], math.multiply(-1, physics.cExpPlusPrime(x,E,V)));
						regionsData.matrixCoefs.set([indexI+1, indexJ+1], math.multiply(-1, physics.cExpMinusPrime(x,E,V)));
					}else{
						regionsData.matrixCoefs.set([indexI, indexJ], math.multiply(-1, physics.linear(x,E,V)));
						regionsData.matrixCoefs.set([indexI, indexJ+1], math.multiply(-1, physics.constant(x,E,V)));
						regionsData.matrixCoefs.set([indexI+1, indexJ], math.multiply(-1, physics.constant(x,E,V)));
						regionsData.matrixCoefs.set([indexI+1, indexJ+1], math.multiply(-1, physics.zero(x,E,V)));
					}
				}
			}
		},
		solveCoefs: function() {
			var invA = math.inv(this.matrixCoefs);
			this.solutionCoefs = math.multiply(invA,this.vectorCoefs);
		},
		plotWaves: function() {
			var E = this.energy;
			var V = this.potentials[0];
			this.pathPlotComplex.removeSegments();
			this.pathPlotReal.removeSegments();
			var newPComplex = new Point();
			var newPReal = new Point();
			var index = 0;
			var yScale = values.yScale;
			for (var x = values.minX; x < values.maxX; x++){

				if ((index < values.nRegions - 1) & (x > regionsData.boundaries[index])) {

					index += 1;

				}
				V = this.potentials[index];
				newPComplex.x = x;
				newPReal.x = x;
				if (index == values.nRegions - 1){
					newPReal.y = values.xAxisHeight - yScale*(math.multiply(regionsData.solutionCoefs.get([index*2]),regionsData.functionHandles[index*2](x,E,V))).re;
					newPComplex.y = values.xAxisHeight - yScale*(math.multiply(regionsData.solutionCoefs.get([index*2]),regionsData.functionHandles[index*2](x,E,V))).im;
				}else{
					newPReal.y = values.xAxisHeight - yScale*(math.add(math.multiply(regionsData.solutionCoefs.get([index*2]),regionsData.functionHandles[index*2](x,E,V)) , math.multiply(regionsData.solutionCoefs.get([index*2+1]),regionsData.functionHandles[index*2+1](x,E,V)))).re;
					newPComplex.y = values.xAxisHeight - yScale*(math.add(math.multiply(regionsData.solutionCoefs.get([index*2]),regionsData.functionHandles[index*2](x,E,V)) , math.multiply(regionsData.solutionCoefs.get([index*2+1]),regionsData.functionHandles[index*2+1](x,E,V)))).im;


				}

				this.pathPlotReal.add(newPReal);
				this.pathPlotComplex.add(newPComplex);
			}
		},
		normalize: function() {

			var E = this.energy;
			var V = this.potentials[0];
			var integral = 0;
			var index = 0;
			var xStart = values.minX;
			var xEnd = values.maxX;
			var dx = 0.1;
			var x = xStart;
			var f1,f2 = math.complex();

			for (var i = 0; x < xEnd; i++){
				if ((index < values.nRegions - 1) & (x > regionsData.boundaries[index])) {
					index += 1;
				}
				V = this.potentials[index];
				if (index == values.nRegions - 1){
					f1 = math.multiply(regionsData.solutionCoefs.get([index*2]),regionsData.functionHandles[index*2](x,E,V));

					integral += math.multiply(f1,math.conj(f1))*dx;

				}else{
					f1 = math.multiply(regionsData.solutionCoefs.get([index*2]),regionsData.functionHandles[index*2](x,E,V));
					f2 = math.multiply(regionsData.solutionCoefs.get([index*2+1]),regionsData.functionHandles[index*2+1](x,E,V));
					integral += math.add(math.add(math.multiply(f1,math.conj(f1)) , math.multiply(f2,math.conj(f2))), math.add(math.multiply(f2,math.conj(f1)) , math.multiply(f1,math.conj(f2))))*dx;

				}
				x += dx;
			}
			regionsData.solutionCoefs = math.divide(regionsData.solutionCoefs, Math.sqrt(integral));

		},
		bindMouseEvents: function(){
			for (var i = 0; i < values.nRegions - 1; i++){
				this.pathWalls[i].onMouseDrag = function(event) {
					var temp = regionsData.pathWalls.indexOf(this);

					var newXValue = regionsData.constraintX( event.point.clone().x, temp);
					regionsData.pathWalls[temp].segments[0].point.x = newXValue;
					regionsData.pathWalls[temp].segments[1].point.x = newXValue;
					regionsData.boundaries[temp] = newXValue;

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
					regionsData.setFunctionHandles();
					regionsData.setMatrix();
					regionsData.solveCoefs();
					regionsData.normalize();
					regionsData.plotWaves();


				};
				this.pathWalls[i].onMouseUp = function(event){
					this.selected = false;
				};
				this.pathWalls[i].onMouseLeave = function(event){
					this.selected = false;
				};


			}
			for ( var i = 0; i < values.nRegions - 2; i++){
				this.pathCeilings[i].onMouseDrag = function(event){
					var temp = regionsData.pathCeilings.indexOf(this);
					var newYValue = regionsData.constraintY(event.point.clone().y);

					regionsData.pathCeilings[temp].segments[0].point.y = newYValue;
					regionsData.pathCeilings[temp].segments[1].point.y = newYValue;

					regionsData.pathLeftSide[temp].segments[0].point.y = newYValue;
					regionsData.pathRightSide[temp].segments[0].point.y = newYValue;
					regionsData.potentials[temp+1] = (values.xAxisHeight - newYValue);
					this.selected = true;
					regionsData.setFunctionHandles();
					regionsData.setMatrix();
					regionsData.solveCoefs();
					regionsData.normalize();
					regionsData.plotWaves();


				};
				this.pathCeilings[i].onMouseOn = function(event){
					this.selected = false;
				};
				this.pathCeilings[i].onMouseLeave = function(event){
					this.selected = false;
				};

			}
			this.pathEnergy.onMouseDrag = function(event){
				this.selected = true;
				var newEnergyPos = regionsData.constraintE(event.point.clone().y);
				regionsData.energy = (values.xAxisHeight - newEnergyPos);
				regionsData.pathEnergy.segments[0].point.y = newEnergyPos;
				regionsData.pathEnergy.segments[1].point.y = newEnergyPos;
				regionsData.setFunctionHandles();
				regionsData.setMatrix();
				regionsData.solveCoefs();
				regionsData.normalize();
				regionsData.plotWaves();


			};
			this.pathEnergy.onMouseOn = function(event){
				this.selected = false;
			};
			this.pathEnergy.onMouseLeave = function(event){
				this.selected = false;
			};
		}
};

createMainRect();
createAxes();
regionsData.createData();
regionsData.createRegion();

regionsData.bindMouseEvents();
axes.sendToBack();
for (var i = 0; i < values.nRegions - 1; i++){
	regionsData.pathWalls[i].bringToFront();
}

regionsData.setFunctionHandles();
regionsData.setMatrix();
regionsData.solveCoefs();
regionsData.normalize();
regionsData.plotWaves();



function onResize(){
	console.log(view.viewSize);
}