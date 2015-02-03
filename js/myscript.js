
var regionsSetup = {
		nRegions: 5, // number of regions, first and last always have a potential value of zero
		defaultLength: 0,
		walls: [], // arrays of walls separating each region in pixels
		ceilings: [], // height of the potential in pixels
		regions: [],
		randomSetup: function(){
			// setup regions as having a random potential values
			regionsSetup.defaultLength =  Math.round( (layout.maxX - layout.minX) / regionsSetup.nRegions );

			for ( var i = 0; i < regionsSetup.nRegions-1; i++){ // there are nRegions - 1 walls, yAxis does not count as a wall
				regionsSetup.walls[i] = regionsSetup.defaultLength + regionsSetup.defaultLength*i;
			}

			for ( var i = 0; i < regionsSetup.nRegions-2; i++){ // there are nRegions - 2 ceilings, since first and last have zero potential
				regionsSetup.ceilings[i] = Math.round( layout.maxY + (layout.minY - layout.maxY)*Math.random() );
			}

			regionsSetup.regions[0] = new FirstPotential(layout.xAxisHeight, regionsSetup.walls[0]);
			for (var i = 1; i < regionsSetup.nRegions - 1 ; i++){
				regionsSetup.regions[i] = new SquarePotential(layout.xAxisHeight, regionsSetup.walls[i-1], regionsSetup.walls[i], regionsSetup.ceilings[i-1]);
			}
			regionsSetup.regions[regionsSetup.nRegions - 1] = new LastPotential(layout.xAxisHeight, regionsSetup.walls[regionsSetup.nRegions - 2]);

			for (var i = 0; i < regionsSetup.nRegions - 1; i++){
				regionsSetup.regions[i].setRightNeighbor(regionsSetup.regions[i+1]);
			}
			for (var i = 1; i < regionsSetup.nRegions ; i++){
				regionsSetup.regions[i].setLeftNeighbor(regionsSetup.regions[i-1]);
			}
		}
};


var layout = {
		pathMainRect: new Path(),  // Outer rectangle
		// padding inside outer rectangle
		minY: 20,
		maxY: view.viewSize.height - 20,
		minX: 20,
		maxX: view.viewSize.width - 20,
		axes: new Group(),
		xAxisHeight: ( view.viewSize.height - 20) * .7,
		maxEnergyHeight: 75, // Max energy in pixel
		yScale: 1000, // Overall scale of the wavefunction
		boundStateArrows: [],
		createMainRect: function(){
			var topLeftCorner = new Point( 0, 0 );
			var bottomRightCorner = new Point(view.viewSize.width,view.viewSize.height);
			var mainRect = new Rectangle(topLeftCorner,bottomRightCorner);
			layout.pathMainRect = new Path.Rectangle(mainRect);
			layout.pathMainRect.strokeColor = 'black';
			layout.pathMainRect.strokeWidth = 10;	
		},
		createArrows: function(){
			
			for (var i= 0; i < layout.boundStateArrows.length; i++){
				
			
			layout.boundStateArrows[i].destroy();
			
			}
			console.log('bound state energies are', physics.boundStateEnergies);
			for (var i = 0; i < physics.boundStateEnergies.length; i++){
				layout.boundStateArrows[i] = new Arrow(layout.minX - 1, layout.xAxisHeight - physics.boundStateEnergies[i]);
			}
		},
		createAxes: function(){
			// yAxis 
			var pTop = new Point( layout.minX, layout.minY );
			var pBottom = new Point( layout.minX, layout.maxY );
			var yAxis = new Path(pTop, pBottom);
			// yAxis ArrowHead
			var pYArrowLeft = pTop + { x: -5, y: 6 };
			var pYArrowRight = pTop +{ x: 5, y: 6 };
			var pYArrowTop = pTop + { x: 0, y: 0 };
			var yAxisArrow = new Path(pYArrowLeft, pYArrowTop, pYArrowRight);
			// xAxis 
			var pLeft = new Point(layout.minX, layout.xAxisHeight);
			var pRight = new Point( layout.maxX, layout.xAxisHeight);
			var xAxis = new Path(pLeft,pRight);
			// xAxis ArrowHead
			var pXArrowTop = pRight + { x: -6, y: 5};
			var pXArrowRight = pRight + { x: 5, y: 0};
			var pXArrowBottom = pRight + {x: -6, y: -5};
			var xAxisArrow = new Path(pXArrowTop, pXArrowRight, pXArrowBottom);
			//Axes group
			layout.axes = new Group(yAxis, yAxisArrow, xAxis, xAxisArrow);
			layout.axes.strokeWidth = 3;
			layout.axes.strokeColor = 'black';
		}
};


var physics = { // holds physically relevant variables and piecewise eigenfunctions
		hbar: 100,
		mass: 1/2,
		lambda: 1/5,
		matrixCoefs: math.matrix(), //Matrix to solve to find coefficients of wavefunction
		constraintVector: [], // Vector constraint b = Ax, to find coefficients of wavefunction
		solutionCoefs: [], // Solution vector x = Inv(A)b containing coefficients of wavefunction
		boundState: false,
		boundStateConstraint: math.matrix(),
		boundStateEnergies: [],
		rExpPlus: function(x,E,V){ // e^(k*x) when E < V
			var xScaled = x*physics.lambda;
			var q = math.sqrt(2*physics.mass*(V-E))/physics.hbar;
			return math.exp(math.complex(xScaled*q,0));
		},
		rExpMinus: function(x,E,V){ // e^(-k*x) when E < V
			var xScaled = x*physics.lambda;
			var q = math.sqrt(2*physics.mass*(V-E))/physics.hbar;
			return math.exp(math.complex(-xScaled*q,0));
		},
		cExpPlus: function(x,E,V){ // e^(i*k*x) when E > V
			var xScaled = x*physics.lambda;
			var k = math.sqrt(2*physics.mass*(E-V))/physics.hbar;
			return answer = math.exp(math.complex(0,xScaled*k));
		},
		cExpMinus: function(x,E,V){ // e^(-i*k*x) when E > V
			var xScaled = x*physics.lambda;
			var k = math.sqrt(2*physics.mass*(E-V))/physics.hbar;
			return answer = math.exp(math.complex(0,-xScaled*k));
		},
		rExpPlusPrime: function(x,E,V){ // first derivative of rExpPlus
			var xScaled = x*physics.lambda;
			var q = math.sqrt(2*physics.mass*(V-E))/physics.hbar;
			return math.multiply( math.complex(q,0) , physics.rExpPlus(x,E,V));
		},
		rExpMinusPrime: function(x,E,V){ // first derivative of rExpMinus
			var xScaled = x*physics.lambda;
			var q = math.sqrt(2*physics.mass*(V-E))/physics.hbar;
			return math.multiply( math.complex(-q,0) , physics.rExpMinus(x,E,V));
		},
		cExpPlusPrime: function(x,E,V){ // first derivative of cExpPlus
			var xScaled = x*physics.lambda;
			var k = math.sqrt(2*physics.mass*(E-V))/physics.hbar;
			return math.multiply( math.complex(0,k) , physics.cExpPlus(x,E,V));
		},
		cExpMinusPrime: function(x,E,V){ // first derivative of cExpMinus
			var xScaled = x*physics.lambda;
			var k = math.sqrt(2*physics.mass*(E-V))/physics.hbar;
			return math.multiply( math.complex(0,-k) , physics.cExpMinus(x,E,V));
		},
		linear: function(x,E,V){ // Linear function f = x when E = V
			var xScaled = x*physics.lambda;
			return math.complex(xScaled, 0);
		},
		constant: function(x,E,V){ // Constant function f = 1 when E = V, also derivative of Linear
			var xScaled = x*physics.lambda;
			return math.complex(1, 0);
		},
		zero: function(x,E,V){ // Zero functions (also derivative of constant
			var xScaled = x*physics.lambda;
			return math.complex(0, 0);
		},
		minPotential: function(){
			var minV = 0;
			for (var i = 0; i < regionsSetup.nRegions; i++){
				minV = Math.min(minV, regionsSetup.regions[i].potential);
			}
			return minV;
		},
		setConstraintVector: function(){
			var vectorSize = 0;
			physics.constraintVector = [];
			for (var i = 0; i < regionsSetup.nRegions; i++ ){
				if (regionsSetup.regions[i].basisFunction1){
					vectorSize += 1;
				}
				if (regionsSetup.regions[i].basisFunction2){
					vectorSize += 1;
				}
			}
			//Setup constraint vector as [ 0, 0, ..., 1 ]
			for (var i = 0; i < vectorSize - 1; i++){
				physics.constraintVector[i] = 0;
			}

			physics.constraintVector[vectorSize - 1] = 1; // corresponds to setting coefficient A = 1
		},
		setHandles: function(E){
			for (var i = 0; i < regionsSetup.nRegions ; i++){
				regionsSetup.regions[i].setHandles(E);
			}
		},
		setMatrix: function(E){
			var vectorSize = 0;
			var indexI;
			var indexJ;
			for (var i = 0; i < regionsSetup.nRegions; i++ ){
				if (regionsSetup.regions[i].basisFunction1){
					vectorSize += 1;

				}
				if (regionsSetup.regions[i].basisFunction2){
					vectorSize += 1;

				}

			}

			physics.matrixCoefs = math.zeros(vectorSize,vectorSize);


			if (E > 0){
				indexI = 0;
				indexJ = 0;
				for (var i = 0; i < regionsSetup.nRegions - 1; i++){
					setRightBoundaryConditions(regionsSetup.regions[i]);
				}
				indexI = 0;
				indexJ = 2;
				for (var i = 1; i < regionsSetup.nRegions; i++){
					setLeftBoundaryConditions(regionsSetup.regions[i]);
				}
			} else{
				indexI = 0;
				indexJ = 0;
				for (var i = 0; i < regionsSetup.nRegions - 1; i++){
					setRightBoundaryConditions(regionsSetup.regions[i]);
				}
				indexI = 0;
				indexJ = 1;
				for (var i = 1; i < regionsSetup.nRegions; i++){

					setLeftBoundaryConditions(regionsSetup.regions[i]);
				}


			}
			if (E > 0){
				// constrains a linear combination of A and B, the coefficients of the eigenfunctions of the first domain
				physics.matrixCoefs.set([vectorSize - 1 , 0],1);
			}

			function setRightBoundaryConditions(region){ 
				var x = region.right;
				var V = region.potential;

				physics.matrixCoefs.set([indexI,indexJ],region.basisFunction1(x,E,V));
				physics.matrixCoefs.set([indexI+1,indexJ],region.basisFunctionPrime1(x,E,V));
				if ( region.basisFunction2 ){
					physics.matrixCoefs.set([indexI,indexJ+1],region.basisFunction2(x,E,V));
					physics.matrixCoefs.set([indexI+1,indexJ+1],region.basisFunctionPrime2(x,E,V));
					indexI += 2;
					indexJ += 2;
				} else {
					indexI += 2;
					indexJ += 1;
				}

			}
			function setLeftBoundaryConditions(region){ // In, A + B - C - D = 0, this sets the -C - D part of the equations
				var x = region.left;
				var V = region.potential;

				physics.matrixCoefs.set([indexI,indexJ],math.multiply(-1,region.basisFunction1(x,E,V)) );
				physics.matrixCoefs.set([indexI+1,indexJ],math.multiply(-1, region.basisFunctionPrime1(x,E,V)));
				if ( region.basisFunction2 ){
					physics.matrixCoefs.set([indexI,indexJ+1],math.multiply(-1, region.basisFunction2(x,E,V)));
					physics.matrixCoefs.set([indexI+1,indexJ+1],math.multiply(-1, region.basisFunctionPrime2(x,E,V)));
					indexI += 2;
					indexJ += 2;
				} else {
					indexI += 2;
					indexJ += 1;
				}
			}
		},
		normalize: function(E){
			var integral = 0;
			for (var i = 0; i < regionsSetup.nRegions; i++ ){
				integral += regionsSetup.regions[i].integrate(E);
			}
			var index = 0;
			for (var i = 0; i < regionsSetup.nRegions; i++ ){
				if (regionsSetup.regions[i].basisFunction1){
					regionsSetup.regions[i].coef1 = math.divide(physics.solutionCoefs.get([index]), Math.sqrt(integral));
					physics.solutionCoefs.set([index],math.divide(physics.solutionCoefs.get([index]), Math.sqrt(integral)));
					index += 1;

				}
				if (regionsSetup.regions[i].basisFunction2){
					regionsSetup.regions[i].coef2 = math.divide(physics.solutionCoefs.get([index]), Math.sqrt(integral));
					physics.solutionCoefs.set([index],math.divide(physics.solutionCoefs.get([index]), Math.sqrt(integral)));
					index += 1;
				}

			}

		},
		softNormalize: function(E){
			var integral = 0;

			var index = 0;
			for (var i = 0; i < regionsSetup.nRegions; i++ ){
				if (regionsSetup.regions[i].basisFunction1){
					integral += math.abs(physics.solutionCoefs.get([index]));
					index += 1;

				}
				if (regionsSetup.regions[i].basisFunction2){
					regionsSetup.regions[i].coef2 = math.divide(physics.solutionCoefs.get([index]), Math.sqrt(integral));
					integral += math.abs(physics.solutionCoefs.get([index]));
					index += 1;
				}

			}

			var index = 0;
			for (var i = 0; i < regionsSetup.nRegions; i++ ){
				if (regionsSetup.regions[i].basisFunction1){
					regionsSetup.regions[i].coef1 = math.divide(physics.solutionCoefs.get([index]), Math.sqrt(integral));
					physics.solutionCoefs.set([index],math.divide(physics.solutionCoefs.get([index]), Math.sqrt(integral)));
					index += 1;

				}
				if (regionsSetup.regions[i].basisFunction2){
					regionsSetup.regions[i].coef2 = math.divide(physics.solutionCoefs.get([index]), Math.sqrt(integral));
					physics.solutionCoefs.set([index],math.divide(physics.solutionCoefs.get([index]), Math.sqrt(integral)));
					index += 1;
				}

			}

		},
		solveCoefs: function(E) { // solves b = Ax, i.e. x = inv(A)*b
			var invA = null;
			var detA = null;
			if (E > 0){
				invA = math.inv(physics.matrixCoefs);
				physics.solutionCoefs = math.multiply(invA,physics.constraintVector);
			} else {

				for (var i = 0; i < physics.constraintVector.length; i++){
					physics.boundStateConstraint.set([i], physics.matrixCoefs.get([physics.constraintVector.length - 1, i]));
				}
				//discard last row
				for (var i = 0; i < physics.constraintVector.length; i++){
					physics.matrixCoefs.set([physics.constraintVector.length - 1, i], 0);
				}
				// constrains a linear combination of A and B, the coefficients of the eigenfunctions of the first domain
				physics.matrixCoefs.set([physics.constraintVector.length - 1 , 0],1);
				invA = math.inv(physics.matrixCoefs);
				physics.solutionCoefs = math.multiply(invA,physics.constraintVector);


			}

			var index = 0;
			for (var i = 0; i < regionsSetup.nRegions; i++ ){
				if (regionsSetup.regions[i].basisFunction1){
					regionsSetup.regions[i].coef1 = physics.solutionCoefs.get([index]);

					index += 1;

				}
				if (regionsSetup.regions[i].basisFunction2){
					regionsSetup.regions[i].coef2 = physics.solutionCoefs.get([index]);
					index += 1;
				}

			}
		},

		findBoundStates: function(){

			var Emax = 0;
			var Emin = physics.minPotential();
			var E = Emax;
			var deltaE = Emax - Emin;
			var dE = 0.1*deltaE/(layout.maxY - layout.xAxisHeight);
			var interactivedE = dE;
			var agreement = 0;
			var dAgreement = 0;
			var count = 0;
			var countBoundState = 0;
			var boundStateAgreement = [];
			physics.boundStateEnergies = [];


			while(E > Emin){

				dAgreement = agreement;	
				checkConstraint(E);
				dAgreement = Math.min(3000,(agreement - dAgreement)/interactivedE);

				if (agreement < 0.05){
					if (countBoundState == 0){
						physics.boundStateEnergies[0] = E;
						boundStateAgreement[0] = agreement;
						countBoundState += 1;
					}else {
						if ((Math.abs(physics.boundStateEnergies[countBoundState- 1] - E) < 3) & (agreement < boundStateAgreement[countBoundState-1])){
							physics.boundStateEnergies[countBoundState - 1] = E;
							boundStateAgreement[countBoundState - 1] = agreement;
						} else if (Math.abs(physics.boundStateEnergies[countBoundState- 1] - E) > 3 ){
							physics.boundStateEnergies[countBoundState] = E;
							boundStateAgreement[countBoundState] = agreement;
							countBoundState += 1;
						}
					}
				}


				if (dAgreement < 0){
					interactivedE = Math.max(dE/25, Math.min(0.25, dE*math.abs(agreement)/5));

				} else {
					interactivedE = Math.max(dE, Math.min(0.25, dE*agreement));
				}

				E -= interactivedE;

				count += 1;
			}	
			
			function checkConstraint(E){
				physics.setHandles(E);
				physics.setMatrix(E);
				physics.setConstraintVector();
				physics.solveCoefs(E);
				physics.softNormalize();
				agreement = 1000*math.abs(math.dot(physics.boundStateConstraint, physics.solutionCoefs));
			}
		},
		plot: function(E){

			if (E > 0) {
				for (var i = 0; i < regionsSetup.nRegions; i++ ){
					regionsSetup.regions[i].plotWave(E);
				}
			}

			if (E < 0) {
				physics.clearGraph();
				var isAllowedEnergy = false;
				for (var i = 0; i < physics.boundStateEnergies.length; i++){
					if ( math.abs(physics.boundStateEnergies[i] - E) < .1) {
						isAllowedEnergy = true;
					}
				}

				if (isAllowedEnergy){
					for (var i = 0; i < regionsSetup.nRegions; i++ ){
						regionsSetup.regions[i].plotWave(E);
					}
				} else {

				}
			}

		},
		clearGraph: function(){
			for (var i = 0; i < regionsSetup.nRegions; i++ ){
				regionsSetup.regions[i].clearGraph();
			}
		}
};


function Energy(E ){

	this.moveLine = function(newY){
		newY = this.constraintE(newY);
		this.line.segments[0].point.y = newY;
		this.line.segments[1].point.y = newY;
		this.energyY = newY;
		this.energy = layout.xAxisHeight - this.energyY;
	};
	this.constraintE = function(newY){
		var answer;
		var topConstraint = layout.maxEnergyHeight; // bigger is lower, 0 is top
		var bottomConstraint = layout.maxY; // bigger is lower, 0 is top
		answer = Math.max( newY, topConstraint );
		answer = Math.min( answer, bottomConstraint );
		return answer;
	};
	this.init = function(){
		this.line.strokeWidth = 5;
		this.line.strokeColor = 'blue';

		this.line.onMouseDrag = function(event){

			var newYValue = event.point.y;
			var newE = layout.xAxisHeight - newYValue;
			if (newE > 0){
				parent.moveLine(newYValue);
				update();
			}else{
				parent.moveLine(newYValue);
				update();
			}
		};
		this.line.onMouseUp = function(event){
			var newYValue = event.point.y;
			var newE = layout.xAxisHeight - newYValue;
			var index = -1;
			if (newE < 0){


				for (var i = 0; i < physics.boundStateEnergies.length ; i++){
					if (newE < physics.boundStateEnergies[i]){
						index += 1;
					}
				}

				if (index == -1){
					parent.moveLine(layout.xAxisHeight - 0.1);
					update();
				} else{
					parent.moveLine(layout.xAxisHeight - physics.boundStateEnergies[index] );
					update();
				}
			}
		};
		
		
	};

	var parent = this;
	this.energyY = this.constraintE(E); 
	this.energy = layout.xAxisHeight - this.energyY;
	this.line = new Path([ new Point(layout.minX, this.energyY ), new Point(layout.maxX, this.energyY)]);
	this.init();
};

function SquarePotential(xAxis,left,right,ceil){

	this.setHandles = function(E){

		if (E > this.potential){
			this.basisFunction1 = physics.cExpPlus;
			this.basisFunction2 = physics.cExpMinus;
			this.basisFunctionPrime1 = physics.cExpPlusPrime;
			this.basisFunctionPrime2 = physics.cExpMinusPrime;
		} else if (E < this.potential){
			this.basisFunction1 = physics.rExpPlus;
			this.basisFunction2 = physics.rExpMinus;
			this.basisFunctionPrime1 = physics.rExpPlusPrime;
			this.basisFunctionPrime2 = physics.rExpMinusPrime;
		} else {
			this.basisFunction1 = physics.linear;
			this.basisFunction2 = physics.constant;
			this.basisFunctionPrime1 = physics.constant;
			this.basisFunctionPrime2 = physics.zero;
		}
	};
	this.integrate =  function(E) {
		// normalize the wavefunction so that the integral over the whole box is 1

		var V = this.potential;
		var integral = 0;
		var xStart = this.left; // integrate from minX
		var xEnd = this.right; // integrate up to maxX
		var dx = 0.1; // break integral into rectangles of width dx
		var x = xStart; 
		var f1,f2 = math.complex(); // in general there are two eigenfunction to integrate

		while(x < xEnd){

			f1 = math.multiply(this.coef1,this.basisFunction1(x,E,V));
			f2 = math.multiply(this.coef2,this.basisFunction2(x,E,V));
			integral += math.add(math.add(math.multiply(f1,math.conj(f1)) , math.multiply(f2,math.conj(f2))), math.add(math.multiply(f2,math.conj(f1)) , math.multiply(f1,math.conj(f2))))*dx;

			x += dx; // move on to the next rectangle
		}

		return integral;

	};
	this.plotWave = function(E){
		var V = this.potential;
		this.clearGraph();
		var newPComplex = new Point();
		var newPReal = new Point();
		var yScale = layout.yScale; //scale everything when plotting
		for (var x = this.left; x < this.right; x++) {

			newPComplex.x = x;
			newPReal.x = x;
			if (this.basisFunction2){

				newPReal.y = layout.xAxisHeight - yScale*(math.add(math.multiply(this.coef1,this.basisFunction1(x,E,V)) , math.multiply(this.coef2,this.basisFunction2(x,E,V)))).re;
				newPComplex.y = layout.xAxisHeight - yScale*(math.add(math.multiply(this.coef1,this.basisFunction1(x,E,V)) , math.multiply(this.coef2,this.basisFunction2(x,E,V)))).im;

			} else {

				newPReal.y = layout.xAxisHeight - yScale*(math.multiply(this.coef1,this.basisFunction1(x,E,V))).re;
				newPComplex.y = layout.xAxisHeight - yScale*(math.multiply(this.coef1,this.basisFunction1(x,E,V))).im;
			}

			this.pathPlotReal.add(newPReal);
			this.pathPlotComplex.add(newPComplex);
		}
	};
	this.clearGraph = function(){
		this.pathPlotComplex.removeSegments();
		this.pathPlotReal.removeSegments();
	},
	this.moveCeiling = function(newY){
		newY = this.constraintY(newY);
		this.ceiling.segments[0].point.y = newY;
		this.ceiling.segments[1].point.y = newY;
		this.leftSide.segments[1].point.y = newY;
		this.rightSide.segments[1].point.y = newY;
		this.top = newY;
		this.potential = layout.xAxisHeight - this.top;
	};
	this.moveLeftSide = function(newX){
		newX = Math.min(this.constraintX(newX), this.right - this.minLength);
		this.ceiling.segments[0].point.x = newX;
		this.leftSide.segments[0].point.x = newX;
		this.leftSide.segments[1].point.x = newX;
		this.left = newX;
	};
	this.moveRightSide = function(newX){
		newX = Math.max(this.constraintX(newX), this.left + this.minLength);
		this.ceiling.segments[1].point.x = newX;
		this.rightSide.segments[0].point.x = newX;
		this.rightSide.segments[1].point.x = newX;
		this.right = newX;
	};
	this.setLeftNeighbor = function(leftNeighbor){
		this.leftNeighbor = leftNeighbor;
		leftNeighbor.rightNeighbor = this;
		this.moveLeftSide(leftNeighbor.right);
	};
	this.setRightNeighbor = function(rightNeighbor){
		this.rightNeighbor = rightNeighbor;
		rightNeighbor.leftNeighbor = this;
		this.moveRightSide(rightNeighbor.left);
	};
	this.constraintX = function(newX){
		var leftConstraint;
		var rightConstraint;
		var answer;
		if (this.leftNeighbor){
			leftConstraint = this.leftNeighbor.left + this.leftNeighbor.minLength;
		} else {
			leftConstraint = layout.minX;
		}
		if (this.rightNeighbor){
			rightConstraint = this.rightNeighbor.right - this.rightNeighbor.minLength;
		} else {
			rightConstraint = layout.maxX;
		}

		answer = Math.max( newX , leftConstraint );
		answer = Math.min( answer, rightConstraint );
		return answer;
	};
	this.constraintY = function(newY){
		var answer;
		var topConstraint = layout.minY; // bigger is lower, 0 is top
		var bottomConstraint = layout.maxY; // bigger is lower, 0 is top
		answer = Math.max( newY, topConstraint );
		answer = Math.min( answer, bottomConstraint );
		return answer;
	};
	this.init = function(){
		this.leftSide.strokeWidth = 5;
		this.leftSide.strokeColor = 'red';
		this.rightSide.strokeWidth = 5;
		this.rightSide.strokeColor = 'green';
		this.ceiling.strokeWidth = 5;
		this.ceiling.strokeColor = 'blue';
		this.pathPlotComplex.strokeColor = 'red';
		this.pathPlotReal.strokeColor = 'green';

		this.ceiling.onMouseDrag = function(event){

			var newYValue = event.point.y;
			parent.moveCeiling(newYValue);

			if (energy.energy > 0){
				update();
			}
		};
		this.leftSide.onMouseDrag = function(event){
			var newXValue = event.point.x;
			parent.moveLeftSide(newXValue);
			if (parent.leftNeighbor){
				parent.leftNeighbor.moveRightSide(newXValue);
			}

			if (energy.energy > 0){
				update();
			}
		};
		this.rightSide.onMouseDrag = function(event){
			var newXValue = event.point.x;
			parent.moveRightSide(newXValue);
			if (parent.rightNeighbor){
				parent.rightNeighbor.moveLeftSide(newXValue);
			}

			if (energy.energy > 0){
				update();
			}
		};

		this.rightSide.onMouseUp = function(event){
			updateBoundStates();
			update();

		};

		
		this.leftSide.onMouseUp = function(event){
			updateBoundStates();
			update();

		};
		
		this.ceiling.onMouseUp = function(event){
			updateBoundStates();
			update();

		};
		
		this.setHandles(energy.energy);

	};

	var parent = this;
	this.leftNeighbor = null;
	this.rightNeighbor = null;
	this.minLength = 10;
	this.left = this.constraintX(left);
	this.right = this.constraintX(right);
	this.top = this.constraintY(ceil);
	this.basisFunction1 = null;
	this.basisFunction2 = null;
	this.basisFunctionPrime1 = null;
	this.basisFunctionPrime2 = null;
	this.coef1 = math.complex();
	this.coef2 = math.complex();
	this.pathPlotComplex = new Path();
	this.pathPlotReal = new Path();
	this.leftSide = new Path([ new Point(this.left, xAxis ), new Point(this.left, this.top)]);
	this.rightSide = new Path([ new Point(this.right, xAxis ), new Point(this.right, this.top)]);
	this.ceiling = new Path([ new Point(this.left, this.top ), new Point(this.right, this.top)]);
	this.potential = layout.xAxisHeight - this.top;
	this.init();
}

function LastPotential(xAxis,left){
	this.setHandles = function(E){
		if (E > this.potential){
			this.basisFunction1 = physics.cExpPlus;	
			this.basisFunctionPrime1 = physics.cExpPlusPrime;
			this.basisFunction2 = null;
			this.basisFunctionPrime2 = null;

		} else if (E < this.potential){

			this.basisFunction1 = physics.rExpMinus;
			this.basisFunctionPrime1 = physics.rExpMinusPrime;
			this.basisFunction2 = null;
			this.basisFunctionPrime2 = null;
		} else {
			this.basisFunction1 = physics.constant;
			this.basisFunctionPrime1 = physics.zero;
			this.basisFunction2 = null;
			this.basisFunctionPrime2 = null;
		}
	};
	this.integrate =  function(E) {
		// normalize the wavefunction so that the integral over the whole box is 1

		var V = this.potential;
		var integral = 0;
		var xStart = this.left; // integrate from minX
		var xEnd = this.right; // integrate up to maxX
		var dx = 0.1; // break integral into rectangles of width dx
		var x = xStart; 
		var f1,f2 = math.complex(); // in general there are two eigenfunction to integrate

		while( x < xEnd){

			f1 = math.multiply(this.coef1,this.basisFunction1(x,E,V));

			if (this.basisFunction2){
				f2 = math.multiply(this.coef2,this.basisFunction2(x,E,V));
				integral += math.add(math.add(math.multiply(f1,math.conj(f1)) , math.multiply(f2,math.conj(f2))), math.add(math.multiply(f2,math.conj(f1)) , math.multiply(f1,math.conj(f2))))*dx;
			} else {
				integral += math.multiply(f1,math.conj(f1))*dx;
			}
			x += dx; // move on to the next rectangle
		}

		return integral;

	};
	this.plotWave = function(E){

		var V = this.potential;
		this.clearGraph();
		var newPComplex = new Point();
		var newPReal = new Point();
		var yScale = layout.yScale; //scale everything when plotting
		for (var x = this.left; x < this.right; x++){

			newPComplex.x = x;
			newPReal.x = x;
			if (this.basisFunction2){

				newPReal.y = layout.xAxisHeight - yScale*(math.add(math.multiply(this.coef1,this.basisFunction1(x,E,V)) , math.multiply(this.coef2,this.basisFunction2(x,E,V)))).re;
				newPComplex.y = layout.xAxisHeight - yScale*(math.add(math.multiply(this.coef1,this.basisFunction1(x,E,V)) , math.multiply(this.coef2,this.basisFunction2(x,E,V)))).im;

			} else {

				newPReal.y = layout.xAxisHeight - yScale*(math.multiply(this.coef1,this.basisFunction1(x,E,V))).re;
				newPComplex.y = layout.xAxisHeight - yScale*(math.multiply(this.coef1,this.basisFunction1(x,E,V))).im;
			}

			this.pathPlotReal.add(newPReal);
			this.pathPlotComplex.add(newPComplex);
		}
	};
	this.clearGraph = function(){
		this.pathPlotComplex.removeSegments();
		this.pathPlotReal.removeSegments();
	},
	this.moveLeftSide = function(newX){
		newX = Math.min(this.constraintX(newX), this.right - this.minLength);
		this.ceiling.segments[0].point.x = newX;
		this.leftSide.segments[0].point.x = newX;
		this.leftSide.segments[1].point.x = newX;
		this.left = newX;
	};

	this.setLeftNeighbor = function(leftNeighbor){
		this.leftNeighbor = leftNeighbor;
		leftNeighbor.rightNeighbor = this;
		this.moveLeftSide(leftNeighbor.right);
	};

	this.constraintX = function(newX){
		var leftConstraint = 0;
		var rightConstraint = 0;
		var answer = 0;
		if (this.leftNeighbor){
			leftConstraint = this.leftNeighbor.left + this.leftNeighbor.minLength;
		} else {
			leftConstraint = layout.minX;
		}
		rightConstraint = layout.maxX;


		answer = Math.max( newX , leftConstraint );
		answer = Math.min( answer, rightConstraint );
		return answer;
	};
	this.init = function(){
		this.leftSide.strokeWidth = 5;
		this.leftSide.strokeColor = 'red';
		this.rightSide.strokeWidth = 5;
		this.rightSide.strokeColor = 'green';
		this.ceiling.strokeWidth = 5;
		this.ceiling.strokeColor = 'blue';
		this.pathPlotComplex.strokeColor = 'red';
		this.pathPlotReal.strokeColor = 'green';

		this.leftSide.onMouseDrag = function(event){
			var newXValue = event.point.x;
			parent.moveLeftSide(newXValue);
			if (parent.leftNeighbor){
				parent.leftNeighbor.moveRightSide(newXValue);
			}
			if (energy.energy > 0){
				update();
			}
		};
		this.leftSide.onMouseUp = function(event){
			updateBoundStates();
			update();

		};
		
		this.setHandles(energy.energy);

	};
	var parent = this;
	this.leftNeighbor = null;
	this.minLength = 10;
	this.left = this.constraintX(left);
	this.right = layout.maxX;
	this.top = xAxis;
	this.basisFunction1 = null;
	this.basisFunctionPrime1 = null;
	this.basisFunction2 = null;
	this.basisFunctionPrime2 = null;
	this.coef1 = math.complex();
	this.coef2 = math.complex();
	this.pathPlotComplex = new Path();
	this.pathPlotReal = new Path();
	this.leftSide = new Path([ new Point(this.left, xAxis ), new Point(this.left, this.top)]);
	this.rightSide = new Path([ new Point(this.right, xAxis ), new Point(this.right, this.top)]);
	this.ceiling = new Path([ new Point(this.left, this.top ), new Point(this.right, this.top)]);
	this.potential = 0;
	this.init();
}

function FirstPotential(xAxis, right){

	this.setHandles = function(E){
		if (E > this.potential){
			this.basisFunction1 = physics.cExpPlus;
			this.basisFunction2 = physics.cExpMinus;
			this.basisFunctionPrime1 = physics.cExpPlusPrime;
			this.basisFunctionPrime2 = physics.cExpMinusPrime;
		} else if (E < this.potential){
			this.basisFunction1 = physics.rExpPlus;
			this.basisFunctionPrime1 = physics.rExpPlusPrime;
			this.basisFunction2 = null;
			this.basisFunctionPrime2 = null;

		} else {
			this.basisFunction1 = physics.constant;
			this.basisFunctionPrime1 = physics.zero;
			this.basisFunction2 = null;
			this.basisFunctionPrime2 = null;
		}
	};
	this.integrate =  function(E) {
		// normalize the wavefunction so that the integral over the whole box is 1

		var V = this.potential;
		var integral = 0;
		var xStart = this.left; // integrate from minX
		var xEnd = this.right; // integrate up to maxX
		var dx = 0.1; // break integral into rectangles of width dx
		var x = xStart; 
		var f1,f2 = math.complex(); // in general there are two eigenfunction to integrate

		while ( x < xEnd){

			f1 = math.multiply(this.coef1,this.basisFunction1(x,E,V));
			if (this.basisFunction2){
				f2 = math.multiply(this.coef2,this.basisFunction2(x,E,V));
				integral += math.add(math.add(math.multiply(f1,math.conj(f1)) , math.multiply(f2,math.conj(f2))), math.add(math.multiply(f2,math.conj(f1)) , math.multiply(f1,math.conj(f2))))*dx;
			} else {
				integral += math.multiply(f1,math.conj(f1))*dx;
			}
			x += dx; // move on to the next rectangle
		}

		return integral;

	};
	this.plotWave = function(E){

		var V = this.potential;
		this.clearGraph();
		var newPComplex = new Point();
		var newPReal = new Point();
		var yScale = layout.yScale; //scale everything when plotting
		for (var x = this.left; x < this.right; x++){

			newPComplex.x = x;
			newPReal.x = x;
			if (this.basisFunction2){

				newPReal.y = layout.xAxisHeight - yScale*(math.add(math.multiply(this.coef1,this.basisFunction1(x,E,V)) , 
						math.multiply(this.coef2,this.basisFunction2(x,E,V)))).re;
				newPComplex.y = layout.xAxisHeight - yScale*(math.add(math.multiply(this.coef1,this.basisFunction1(x,E,V)) , 
						math.multiply(this.coef2,this.basisFunction2(x,E,V)))).im;

			} else {

				newPReal.y = layout.xAxisHeight - yScale*(math.multiply(this.coef1,this.basisFunction1(x,E,V))).re;
				newPComplex.y = layout.xAxisHeight - yScale*(math.multiply(this.coef1,this.basisFunction1(x,E,V))).im;
			}

			this.pathPlotReal.add(newPReal);
			this.pathPlotComplex.add(newPComplex);
		}
	};
	this.clearGraph = function(){
		this.pathPlotComplex.removeSegments();
		this.pathPlotReal.removeSegments();
	},
	this.moveRightSide = function(newX){
		newX = Math.max(this.constraintX(newX), this.left + this.minLength);
		this.ceiling.segments[1].point.x = newX;
		this.rightSide.segments[0].point.x = newX;
		this.rightSide.segments[1].point.x = newX;
		this.right = newX;
	};
	this.setRightNeighbor = function(rightNeighbor){
		this.rightNeighbor = rightNeighbor;
		rightNeighbor.leftNeighbor = this;
		this.moveRightSide(rightNeighbor.left);
	};
	this.constraintX = function(newX){
		var leftConstraint = 0;
		var rightConstraint = 0;
		var answer = 0;
		leftConstraint = layout.minX;
		if (this.rightNeighbor){
			rightConstraint = this.rightNeighbor.right - this.rightNeighbor.minLength;
		} else {
			rightConstraint = layout.maxX;
		}

		answer = Math.max( newX , leftConstraint );
		answer = Math.min( answer, rightConstraint );
		return answer;
	};
	this.init = function(){
		this.leftSide.strokeWidth = 5;
		this.leftSide.strokeColor = 'red';
		this.rightSide.strokeWidth = 5;
		this.rightSide.strokeColor = 'green';
		this.ceiling.strokeWidth = 5;
		this.ceiling.strokeColor = 'blue';
		this.pathPlotComplex.strokeColor = 'red';
		this.pathPlotReal.strokeColor = 'green';


		this.rightSide.onMouseDrag = function(event){
			var newXValue = event.point.x;
			parent.moveRightSide(newXValue);
			if (parent.rightNeighbor){
				parent.rightNeighbor.moveLeftSide(newXValue);
			}
			if (energy.energy > 0){
				update();
			}
		};

		this.rightSide.onMouseUp = function(event){
			updateBoundStates();
			update();

		};
		
		this.setHandles(energy.energy);

	};
	var parent = this;
	this.rightNeighbor = null;
	this.minLength = 10;
	this.left = layout.minX;
	this.right = this.constraintX(right);
	this.top = xAxis;
	this.basisFunction1 = null;
	this.basisFunctionPrime1 = null;
	this.basisFunction2 = null;
	this.basisFunctionPrime2 = null;
	this.coef1 = math.complex();
	this.coef2 = math.complex();
	this.pathPlotComplex = new Path();
	this.pathPlotReal = new Path();
	this.leftSide = new Path([ new Point(this.left, xAxis ), new Point(this.left, this.top)]);
	this.rightSide = new Path([ new Point(this.right, xAxis ), new Point(this.right, this.top)]);
	this.ceiling = new Path([ new Point(this.left, this.top ), new Point(this.right, this.top)]);
	this.potential = 0;
	this.init();
}

function onMouseMove(event) {
	project.activeLayer.selected = false;
	if (event.item)
		event.item.selected = true;
}

layout.createMainRect();
layout.createAxes();
layout.axes.sendToBack();
energy = new Energy(250);
regionsSetup.randomSetup();
update();
updateBoundStates();

function update(){
	var E = energy.energy;

	physics.setHandles( E)
	physics.setMatrix(E);
	physics.setConstraintVector();
	physics.solveCoefs(E);
	physics.normalize(E);
	physics.plot(E);

}

function updateBoundStates(){
	physics.findBoundStates();
	layout.createArrows();
}

function Arrow(x,y){

	this.init = function(){
		
		// ArrowHead
		var pArrowTop = this.pHead + { x: -7, y: 5};
		var pArrowHead = this.pHead + { x: 0, y: 0};
		var pArrowBottom = this.pHead + {x: -7, y: -5};
		this.arrow = new Path(pArrowTop, pArrowHead, pArrowBottom);
		//Axes group
		
		this.arrow.strokeWidth = 4;
		this.arrow.strokeColor = 'blue';
	};
	this.destroy = function(){
		this.arrow.remove();
		this.pHead = null;
		this.pTop = null;
		this.pBottom = null;
		this.init = null;
	}
	this.arrow = new Path();
	this.pHead = new Point(x,y);
	this.pTop = new Point();
	this.pBottom = new Point();
	this.init();
}

