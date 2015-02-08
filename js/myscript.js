var layout = {
		pathMainRect: new Path(),  // Outer rectangle
		// padding inside outer rectangle
		minY: 20,
		maxY: view.viewSize.height - 20,
		minX: 20,
		maxX: view.viewSize.width - 20,
		axes: new Group(),
		xAxisHeight: ( view.viewSize.height - 20) * .7,
		yScale: 1000, // Overall scale of the wavefunction
		boundStateArrows: [], //Holds the arrows showing which energy the boundstates have
		layer: new Layer(),
		createMainRect: function(){ //creates a black rectangle around the canvas
			var topLeftCorner = new Point( 0, 0 );
			var bottomRightCorner = new Point(view.viewSize.width,view.viewSize.height);
			var mainRect = new Rectangle(topLeftCorner,bottomRightCorner);
			layout.pathMainRect = new Path.Rectangle(mainRect);
			layout.pathMainRect.strokeColor = 'black';
			layout.pathMainRect.strokeWidth = 10;	
			layout.layer.addChild(layout.pathMainRect);
		},
		createArrows: function(){ //Creates arrows pointing to the bound state energies

			for (var i= 0; i < layout.boundStateArrows.length; i++){
				layout.boundStateArrows[i].destroy(); //Remove the old arrows
			}
			for (var i = 0; i < solver.boundStateEnergies.length; i++){
				layout.boundStateArrows[i] = new BoundStateArrowHead(layout.minX - 1, layout.xAxisHeight - solver.boundStateEnergies[i]);
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
			layout.layer.addChild(layout.axes);
		}
};


var regionsSetup = { // Stores the regions and methods to create preset regions
		nRegions: 5, // number of regions, first and last always have a potential value of zero
		defaultLength: 0,
		walls: [], // arrays of walls separating each region in pixels
		ceilings: [], // height of the potential in pixels
		regions: [], // holds the region objects
		boundState: false,
		maxEnergyHeight: 20, // Max energy in pixel
		randomSetup: function(){ // setup regions as having a random potential values
			regionsSetup.defaultLength =  Math.round( (layout.maxX - layout.minX) / regionsSetup.nRegions );

			for ( var i = 0; i < regionsSetup.nRegions-1; i++){ // there are nRegions - 1 walls, yAxis does not count as a wall
				regionsSetup.walls[i] = layout.minX + regionsSetup.defaultLength + regionsSetup.defaultLength*i;
			}

			for ( var i = 0; i < regionsSetup.nRegions-2; i++){ // there are nRegions - 2 ceilings, since first and last have zero potential
				regionsSetup.ceilings[i] = Math.round( layout.maxY + (layout.minY - layout.maxY)*Math.random() );
			}

			// First region has zero potential 
			regionsSetup.regions[0] = new FirstPotential(layout.xAxisHeight, regionsSetup.walls[0]);
			for (var i = 1; i < regionsSetup.nRegions - 1 ; i++){
				regionsSetup.regions[i] = new SquarePotential(layout.xAxisHeight, regionsSetup.walls[i-1], regionsSetup.walls[i], regionsSetup.ceilings[i-1]);
			}
			// Last region has zero potential
			regionsSetup.regions[regionsSetup.nRegions - 1] = new LastPotential(layout.xAxisHeight, regionsSetup.walls[regionsSetup.nRegions - 2]);

			for (var i = 0; i < regionsSetup.nRegions - 1; i++){
				regionsSetup.regions[i].setRightNeighbor(regionsSetup.regions[i+1]);
			}
			for (var i = 1; i < regionsSetup.nRegions ; i++){
				regionsSetup.regions[i].setLeftNeighbor(regionsSetup.regions[i-1]);
			}
		},
		circleSetup: function(){ // setups regions as approximating a half circle
			regionsSetup.defaultLength =  Math.round( (layout.maxX - layout.minX) / regionsSetup.nRegions );
			for ( var i = 0; i < regionsSetup.nRegions-1; i++){ // there are nRegions - 1 walls, yAxis does not count as a wall
				regionsSetup.walls[i] = layout.minX + regionsSetup.defaultLength + regionsSetup.defaultLength*i;
			}
			var circleRadius =  3*(layout.xAxisHeight - layout.minY)/5;
			var x = 0;
			var circleCenterX = layout.minX - (layout.maxX - layout.minX)/2;
			for ( var i = 0; i < regionsSetup.nRegions-2; i++){ // there are nRegions - 2 ceilings, since first and last have zero potential
				x = regionsSetup.walls[i] - regionsSetup.defaultLength*.5;
				regionsSetup.ceilings[i] = circleYCoord(x, circleRadius, circleCenterX);
				
			}

			// First region has zero potential 
			regionsSetup.regions[0] = new FirstPotential(layout.xAxisHeight, regionsSetup.walls[0]);
			// Setup the regions in the middle
			for (var i = 1; i < regionsSetup.nRegions - 1 ; i++){
				regionsSetup.regions[i] = new SquarePotential(layout.xAxisHeight, regionsSetup.walls[i-1], regionsSetup.walls[i], regionsSetup.ceilings[i-1]);
			}
			// Last region has zero potential
			regionsSetup.regions[regionsSetup.nRegions - 1] = new LastPotential(layout.xAxisHeight, regionsSetup.walls[regionsSetup.nRegions - 2]);

			for (var i = 0; i < regionsSetup.nRegions - 1; i++){
				regionsSetup.regions[i].setRightNeighbor(regionsSetup.regions[i+1]);
			}
			for (var i = 1; i < regionsSetup.nRegions ; i++){
				regionsSetup.regions[i].setLeftNeighbor(regionsSetup.regions[i-1]);
			}
			
			function circleYCoord(x, circleRadius, circleCenterX){ //returns the Y coordinate of the circle
				var yCoord = math.sqrt( math.pow(circleRadius,2) - math.pow(x + circleCenterX,2)/3 );
				if (math.im(yCoord)){
					return layout.xAxisHeight;
				} else {
					return layout.xAxisHeight - yCoord;
				}
				
			};
		}
};

var physics = { // holds physically relevant variables and piecewise eigenfunctions
		hbar: 100,
		mass: 1/2,
		lambda: 1/5,
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
		minPotential: function(){ // returns the smallest potential value
			var minV = 0;
			for (var i = 0; i < regionsSetup.nRegions; i++){
				minV = Math.min(minV, regionsSetup.regions[i].potential);
			}
			return minV;
		},


};

var solver = {
		matrixCoefs: math.matrix(), //Matrix to solve to find coefficients of wavefunction
		constraintVector: [], // Vector constraint b = Ax, to find coefficients of wavefunction
		solutionCoefs: [], // Solution vector x = Inv(A)b containing coefficients of wavefunction

		boundStateConstraint: math.matrix(),
		boundStateEnergies: [],
		setConstraintVector: function(){ // sets vector b in Ax = b;
			var vectorSize = 0;
			solver.constraintVector = [];
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
				solver.constraintVector[i] = 0;
			}

			solver.constraintVector[vectorSize - 1] = 1; // corresponds to setting coefficient A = 1
		},
		setHandles: function(E){ //sets each piecewise eigenfunction according to an energy E
			for (var i = 0; i < regionsSetup.nRegions ; i++){
				regionsSetup.regions[i].setHandles(E);
			}
		},
		setMatrix: function(E){ // sets matrix A in Ax = b;
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

			solver.matrixCoefs = math.zeros(vectorSize,vectorSize);


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
			if (E > 0){ // When E > 0, the system is always consistent
				// constrains a linear combination of A and B, the coefficients of the eigenfunctions of the first domain
				solver.matrixCoefs.set([vectorSize - 1 , 0],1);
			} else { // Otherwise, a boundstate might not exist

				// Make a constraint vector that will check if the system is not over-constrained and a boundstate exists
				for (var i = 0; i < solver.constraintVector.length; i++){
					solver.boundStateConstraint.set([i], solver.matrixCoefs.get([solver.constraintVector.length - 1, i]));
				}
				//discard last row
				for (var i = 0; i < solver.constraintVector.length; i++){
					solver.matrixCoefs.set([solver.constraintVector.length - 1, i], 0);
				}
				// constrains a linear combination of A and B, the coefficients of the eigenfunctions of the first domain
				solver.matrixCoefs.set([solver.constraintVector.length - 1 , 0],1);
				
			}

			function setRightBoundaryConditions(region){ // In, A + B - C - D = 0, this sets the A + B part of the equations
				var x = region.right;
				var V = region.potential;

				solver.matrixCoefs.set([indexI,indexJ],region.basisFunction1(x,E,V)); //sets continuity
				solver.matrixCoefs.set([indexI+1,indexJ],region.basisFunctionPrime1(x,E,V)); 
				if ( region.basisFunction2 ){
					solver.matrixCoefs.set([indexI,indexJ+1],region.basisFunction2(x,E,V)); //sets continuity
					solver.matrixCoefs.set([indexI+1,indexJ+1],region.basisFunctionPrime2(x,E,V)); // sets differentiability
					//Increase indices for next function call
					indexI += 2;
					indexJ += 2;
				} else {
					//Increase indices for next function call, indexJ += 1 because there was only one basis function
					indexI += 2;
					indexJ += 1;
				}

			}
			function setLeftBoundaryConditions(region){ // In, A + B - C - D = 0, this sets the -C - D part of the equations
				var x = region.left;
				var V = region.potential;

				solver.matrixCoefs.set([indexI,indexJ],math.multiply(-1,region.basisFunction1(x,E,V)) ); //sets continuity
				solver.matrixCoefs.set([indexI+1,indexJ],math.multiply(-1, region.basisFunctionPrime1(x,E,V))); // sets differentiability
				if ( region.basisFunction2 ){
					solver.matrixCoefs.set([indexI,indexJ+1],math.multiply(-1, region.basisFunction2(x,E,V))); //sets continuity
					solver.matrixCoefs.set([indexI+1,indexJ+1],math.multiply(-1, region.basisFunctionPrime2(x,E,V))); // sets differentiability
					//Increase indices for next function call
					indexI += 2;
					indexJ += 2;
				} else {
					//Increase indices for next function call, indexJ += 1 because there was only one basis function
					indexI += 2;
					indexJ += 1;
				}
			}
		},
		integrateRegion:  function(region, E) { 
			// normalize the wavefunction so that the integral over the whole box is 1
			// the function handles have already been set, make sure the right energy was passed
			
			var V = region.potential;
			var integral = 0;
			var xStart = region.left; // integrate from minX
			var xEnd = region.right; // integrate up to maxX
			var dx = 1; // break integral into rectangles of width dx
			var x = xStart; 
			var f1,f2 = math.complex(); // in general there are two eigenfunction to integrate

			while ( x < xEnd){

				f1 = math.multiply(region.coef1,region.basisFunction1(x,E,V));
				if (region.basisFunction2){
					f2 = math.multiply(region.coef2,region.basisFunction2(x,E,V));
					integral += math.add(math.add(math.multiply(f1,math.conj(f1)) , math.multiply(f2,math.conj(f2))), 
							math.add(math.multiply(f2,math.conj(f1)) , math.multiply(f1,math.conj(f2))))*dx;

				} else {
					integral += math.multiply(f1,math.conj(f1))*dx;
				}
				x += dx; // move on to the next rectangle
			}

			return integral;

		},
		normalize: function(E){ 
			// the function handles have already been set, make sure the right energy was passed
			// Computes the integral
			var integral = 0;
			for (var i = 0; i < regionsSetup.nRegions; i++ ){

				integral += solver.integrateRegion(regionsSetup.regions[i], E);
			}
			
			// Sets the normalized coefficients 
			var index = 0;
			for (var i = 0; i < regionsSetup.nRegions; i++ ){
				if (regionsSetup.regions[i].basisFunction1){
					regionsSetup.regions[i].coef1 = math.divide(solver.solutionCoefs.get([index]), Math.sqrt(integral));
					solver.solutionCoefs.set([index],math.divide(solver.solutionCoefs.get([index]), Math.sqrt(integral)));
					index += 1;

				}
				if (regionsSetup.regions[i].basisFunction2){
					regionsSetup.regions[i].coef2 = math.divide(solver.solutionCoefs.get([index]), Math.sqrt(integral));
					solver.solutionCoefs.set([index],math.divide(solver.solutionCoefs.get([index]), Math.sqrt(integral)));
					index += 1;
				}

			}

		},
		softNormalize: function(E){
			// normalizes the sum of |coefficients| to be one, to give a sense of scale
			var sum = 0;

			// compute the sum
			var index = 0;
			for (var i = 0; i < regionsSetup.nRegions; i++ ){
				if (regionsSetup.regions[i].basisFunction1){
					sum += math.abs(solver.solutionCoefs.get([index]));
					index += 1;

				}
				if (regionsSetup.regions[i].basisFunction2){
					sum += math.abs(solver.solutionCoefs.get([index]));
					index += 1;
				}

			}
			// Sets the normalized coefficients 
			var index = 0;
			for (var i = 0; i < regionsSetup.nRegions; i++ ){
				if (regionsSetup.regions[i].basisFunction1){
					regionsSetup.regions[i].coef1 = math.divide(solver.solutionCoefs.get([index]), Math.sqrt(sum));
					solver.solutionCoefs.set([index],math.divide(solver.solutionCoefs.get([index]), Math.sqrt(sum)));
					index += 1;

				}
				if (regionsSetup.regions[i].basisFunction2){
					regionsSetup.regions[i].coef2 = math.divide(solver.solutionCoefs.get([index]), Math.sqrt(sum));
					solver.solutionCoefs.set([index],math.divide(solver.solutionCoefs.get([index]), Math.sqrt(sum)));
					index += 1;
				}

			}

		},
		solveCoefs: function(E) { // solves b = Ax, i.e. x = inv(A)*b
			var invA = null;
			
			//compute the coefficients
			invA = math.inv(solver.matrixCoefs);
			solver.solutionCoefs = math.multiply(invA,solver.constraintVector);
			
			// store the coefficients
			var index = 0;
			for (var i = 0; i < regionsSetup.nRegions; i++ ){
				if (regionsSetup.regions[i].basisFunction1){
					regionsSetup.regions[i].coef1 = solver.solutionCoefs.get([index]);

					index += 1;

				}
				if (regionsSetup.regions[i].basisFunction2){
					regionsSetup.regions[i].coef2 = solver.solutionCoefs.get([index]);
					index += 1;
				}

			}
		},
		findBoundStates: function(){

			var Emax = 0;
			var Emin = physics.minPotential();
			var E = Emax;
			var deltaE = Emax - Emin;
			var dE = 0.05*deltaE/(layout.maxY - layout.xAxisHeight);
			var interactivedE = dE;
			var agreement = 0;
			var dAgreement = 0;
			var count = 0;
			var countBoundState = 0;
			var boundStateAgreement = [];
			solver.boundStateEnergies = [];


			while(E > Emin){

				dAgreement = agreement;	
				checkConstraint(E);
				dAgreement = Math.min(3000,(agreement - dAgreement)/interactivedE);

				if (agreement < 0.01){
					if (countBoundState == 0){
						solver.boundStateEnergies[0] = E;
						boundStateAgreement[0] = agreement;
						countBoundState += 1;
					}else {
						if ((Math.abs(solver.boundStateEnergies[countBoundState- 1] - E) < 0.5) & (agreement < boundStateAgreement[countBoundState-1])){
							solver.boundStateEnergies[countBoundState - 1] = E;
							boundStateAgreement[countBoundState - 1] = agreement;
						} else if (Math.abs(solver.boundStateEnergies[countBoundState- 1] - E) > 0.5 ){
							solver.boundStateEnergies[countBoundState] = E;
							boundStateAgreement[countBoundState] = agreement;
							countBoundState += 1;
						}
					}
				}


				if (dAgreement < 0){
					interactivedE = Math.max(dE/25, Math.min(0.1, dE*math.abs(agreement)/5));

				} else {
					interactivedE = Math.max(dE, Math.min(0.1, dE*agreement));
				}

				E -= interactivedE;

				count += 1;
			}	

			function checkConstraint(E){ // Checks if the boundstate constraint is satisfied at a given energy ( < 0 )
				solver.setHandles(E);
				solver.setConstraintVector();
				solver.setMatrix(E);
				solver.solveCoefs(E);
				solver.softNormalize(); // softNormalize is quicker than normalize, but rougher
				agreement = 1000*math.abs(math.dot(solver.boundStateConstraint, solver.solutionCoefs)); //scaled up to be a bigger number
			}

			console.log(count);
		}

};
var plotter = {
		layer: new Layer,
		plot: function(E){

			if (E > 0) { // Plots scattering
				plotter.clearGraph();
				for (var i = 0; i < regionsSetup.nRegions; i++ ){

					plotter.plotRegion(regionsSetup.regions[i],E);
				}
			}else { // In the case of negative energy, there might not be a boundstate
				plotter.clearGraph();
				var isAllowedEnergy = false;
				//Check if the energy is close to a boundstate
				for (var i = 0; i < solver.boundStateEnergies.length; i++){
					if ( math.abs(solver.boundStateEnergies[i] - E) < .1) {
						isAllowedEnergy = true;
					}
				}

				if (isAllowedEnergy){ //Only plot function if it is a boundstate
					for (var i = 0; i < regionsSetup.nRegions; i++ ){
						plotter.plotRegion(regionsSetup.regions[i],E);
					}
				} else {
					//TODO: perhaps display that there are no boundstates
				}
			}

		},
		plotRegion: function(region, E){ //plots the wavefunction in a region at energy E
			var V = region.potential;
			var newPComplex = new Point();
			var newPReal = new Point();
			var yScale = layout.yScale; //scale everything when plotting
			for (var x = region.left; x < region.right; x = x + 5) {

				newPComplex.x = x;
				newPReal.x = x;
				if (region.basisFunction2){

					newPReal.y = layout.xAxisHeight - yScale*(math.add(math.multiply(region.coef1,region.basisFunction1(x,E,V)) , math.multiply(region.coef2,region.basisFunction2(x,E,V)))).re;
					newPComplex.y = layout.xAxisHeight - yScale*(math.add(math.multiply(region.coef1,region.basisFunction1(x,E,V)) , math.multiply(region.coef2,region.basisFunction2(x,E,V)))).im;

				} else {

					newPReal.y = layout.xAxisHeight - yScale*(math.multiply(region.coef1,region.basisFunction1(x,E,V))).re;
					newPComplex.y = layout.xAxisHeight - yScale*(math.multiply(region.coef1,region.basisFunction1(x,E,V))).im;
				}

				region.pathPlotReal.add(newPReal);
				region.pathPlotComplex.add(newPComplex);
			}

			// Add a point at the right endpoint too
			x = region.right;
			newPComplex.x = x;
			newPReal.x = x;
			if (region.basisFunction2){

				newPReal.y = layout.xAxisHeight - yScale*(math.add(math.multiply(region.coef1,region.basisFunction1(x,E,V)) , math.multiply(region.coef2,region.basisFunction2(x,E,V)))).re;
				newPComplex.y = layout.xAxisHeight - yScale*(math.add(math.multiply(region.coef1,region.basisFunction1(x,E,V)) , math.multiply(region.coef2,region.basisFunction2(x,E,V)))).im;

			} else {

				newPReal.y = layout.xAxisHeight - yScale*(math.multiply(region.coef1,region.basisFunction1(x,E,V))).re;
				newPComplex.y = layout.xAxisHeight - yScale*(math.multiply(region.coef1,region.basisFunction1(x,E,V))).im;
			}

			region.pathPlotReal.add(newPReal);
			region.pathPlotComplex.add(newPComplex);

		},
		clearRegion: function(region){
			region.pathPlotComplex.removeSegments();
			region.pathPlotReal.removeSegments();

		},
		clearGraph: function(){
			for (var i = 0; i < regionsSetup.nRegions; i++ ){
				plotter.clearRegion(regionsSetup.regions[i]);
			}
		}
};

layout.createMainRect();
layout.createAxes();
layout.axes.sendToBack();
plotter.layer.activate();
energy = new Energy(250);



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
		var topConstraint = regionsSetup.maxEnergyHeight; // bigger is lower, 0 is top
		var bottomConstraint = layout.maxY; // bigger is lower, 0 is top
		answer = Math.max( newY, topConstraint );
		answer = Math.min( answer, bottomConstraint );
		return answer;
	};

	var parent = this;
	this.energyY = this.constraintE(E); 
	this.energy = layout.xAxisHeight - this.energyY;
	this.line = new Path([ new Point(layout.minX, this.energyY ), new Point(layout.maxX, this.energyY)]);

	this.line.strokeWidth = 5;
	this.line.strokeColor = 'red';
	plotter.layer.addChild(this.line);
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


			for (var i = 0; i < solver.boundStateEnergies.length ; i++){
				if (newE < solver.boundStateEnergies[i]){
					index += 1;
				}
			}

			if (index == -1){
				parent.moveLine(layout.xAxisHeight - 0.1);
				update();
			} else{
				parent.moveLine(layout.xAxisHeight - solver.boundStateEnergies[index] );
				update();
			}
		}
	};
};

function SquarePotential(xAxis,left,right,ceil){

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

	this.leftSide.strokeWidth = 5;
	this.leftSide.strokeColor = 'blue';
	this.rightSide.strokeWidth = 5;
	this.rightSide.strokeColor = 'blue';
	this.ceiling.strokeWidth = 5;
	this.ceiling.strokeColor = 'blue';
	this.pathPlotComplex.strokeColor = 'red';
	this.pathPlotReal.strokeColor = 'green';
	plotter.layer.addChildren([this.leftSide,this.rightSide,this.ceiling,this.pathPlotComplex,this.pathPlotReal]);

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

}
SquarePotential.prototype.setHandles = function(E){
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
SquarePotential.prototype.moveCeiling = function(newY){
	newY = this.constraintY(newY);
	this.ceiling.segments[0].point.y = newY;
	this.ceiling.segments[1].point.y = newY;
	this.leftSide.segments[1].point.y = newY;
	this.rightSide.segments[1].point.y = newY;
	this.top = newY;
	this.potential = layout.xAxisHeight - this.top;
};
SquarePotential.prototype.moveLeftSide = function(newX){
	newX = Math.min(this.constraintX(newX), this.right - this.minLength);
	this.ceiling.segments[0].point.x = newX;
	this.leftSide.segments[0].point.x = newX;
	this.leftSide.segments[1].point.x = newX;
	this.left = newX;
};
SquarePotential.prototype.moveRightSide = function(newX){
	newX = Math.max(this.constraintX(newX), this.left + this.minLength);
	this.ceiling.segments[1].point.x = newX;
	this.rightSide.segments[0].point.x = newX;
	this.rightSide.segments[1].point.x = newX;
	this.right = newX;
};
SquarePotential.prototype.setLeftNeighbor = function(leftNeighbor){
	this.leftNeighbor = leftNeighbor;
	leftNeighbor.rightNeighbor = this;
	this.moveLeftSide(leftNeighbor.right);
};
SquarePotential.prototype.setRightNeighbor = function(rightNeighbor){
	this.rightNeighbor = rightNeighbor;
	rightNeighbor.leftNeighbor = this;
	this.moveRightSide(rightNeighbor.left);
};
SquarePotential.prototype.constraintX = function(newX){
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
SquarePotential.prototype.constraintY = function(newY){
	var answer;
	var topConstraint = layout.minY; // bigger is lower, 0 is top
	var bottomConstraint = layout.maxY; // bigger is lower, 0 is top
	answer = Math.max( newY, topConstraint );
	answer = Math.min( answer, bottomConstraint );
	return answer;
};


LastPotential.prototype = new SquarePotential();
LastPotential.prototype.constructor = LastPotential;
function LastPotential(xAxis,left){

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

	this.leftSide.strokeWidth = 5;
	this.leftSide.strokeColor = 'blue';
	this.rightSide.strokeWidth = 5;
	this.rightSide.strokeColor = 'blue';
	this.ceiling.strokeWidth = 5;
	this.ceiling.strokeColor = 'blue';
	this.pathPlotComplex.strokeColor = 'red';
	this.pathPlotReal.strokeColor = 'green';
	plotter.layer.addChildren([this.leftSide,this.rightSide,this.ceiling,this.pathPlotComplex,this.pathPlotReal]);

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

}
LastPotential.prototype.setHandles = function(E){
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
LastPotential.prototype.constraintX = function(newX){
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


FirstPotential.prototype = new SquarePotential();
FirstPotential.prototype.constructor = FirstPotential;
function FirstPotential(xAxis, right){


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

	this.leftSide.strokeWidth = 5;
	this.leftSide.strokeColor = 'blue';
	this.rightSide.strokeWidth = 5;
	this.rightSide.strokeColor = 'blue';
	this.ceiling.strokeWidth = 5;
	this.ceiling.strokeColor = 'blue';
	this.pathPlotComplex.strokeColor = 'red';
	this.pathPlotReal.strokeColor = 'green';
	plotter.layer.addChildren([this.leftSide,this.rightSide,this.ceiling,this.pathPlotComplex,this.pathPlotReal]);

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


}
FirstPotential.prototype.setHandles = function(E){
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
FirstPotential.prototype.constraintX = function(newX){
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


function onMouseMove(event) {
	project.activeLayer.selected = false;
	if (event.item) {
		if (event.item.isChild(project.activeLayer)){
			event.item.selected = true;
			//TODO: fix this, it doesn't see the items as being children of the active layer
		}
	}
}


function update(){
	var E = energy.energy;

	solver.setHandles( E);
	solver.setConstraintVector();
	solver.setMatrix(E);
	solver.solveCoefs(E);
	solver.normalize(E);
	plotter.plot(E);

}

function updateBoundStates(){
	if (regionsSetup.boundState){
		solver.findBoundStates();
		layout.createArrows();
	}
}

function BoundStateArrowHead(x,y){ //Create arrowhead pointing right with the tip at (x,y)

	this.init = function(){

		// ArrowHead
		var pArrowTop = this.pHead + { x: -7, y: 5};
		var pArrowHead = this.pHead + { x: 0, y: 0};
		var pArrowBottom = this.pHead + {x: -7, y: -5};
		this.arrow = new Path(pArrowTop, pArrowHead, pArrowBottom);
		//Axes group

		this.arrow.strokeWidth = 4;
		this.arrow.strokeColor = 'red';
	};
	this.destroy = function(){
		this.arrow.remove();
		this.pHead = null;
		this.pTop = null;
		this.pBottom = null;
		this.init = null;
	};
	this.arrow = new Path();
	this.pHead = new Point(x,y);
	this.pTop = new Point();
	this.pBottom = new Point();
	this.init();
}

regionsSetup.randomSetup();
energy.line.bringToFront();
update();
updateBoundStates();
