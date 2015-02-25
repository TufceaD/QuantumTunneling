var layout = {
		layer: new Layer(),
		pathMainRect: new Path.Rectangle(),  // Outer rectangle
		// padding inside outer rectangle
		minY: 40,
		maxY: view.viewSize.height - 40,
		minX: 40,
		maxX: view.viewSize.width - 40,
		//axes and scales
		axes: new Group(),
		xAxisHeight: ( view.viewSize.height - 80) * .75,
		maxEnergyHeight: 45, // Max energy in pixel
		yScale: 2, // Overall scale of the wavefunction
		defaultyScale: 2,
		yScaleProb: 2,
		defaultyScaleProb: 2,
		boundStateArrows: [], //Holds the arrows showing which energy the boundstates have
		createMainRect: function(){ //creates a black rectangle around the canvas
			var topLeftCorner = new Point( 0, 0 );
			var bottomRightCorner = new Point(view.viewSize.width,view.viewSize.height);
			var mainRect = new Rectangle(topLeftCorner,bottomRightCorner);
			layout.pathMainRect = new Path.Rectangle(mainRect);
			layout.pathMainRect.strokeColor = 'black';
			layout.pathMainRect.strokeWidth = 10;	
			layout.layer.addChild(layout.pathMainRect);
		},
		removeArrows: function(){
			for (var i= 0; i < layout.boundStateArrows.length; i++){
				layout.boundStateArrows[i].destroy(); //Remove the old arrows
			}
		},
		createArrows: function(){ //Creates arrows pointing to the bound state energies
			layout.removeArrows();
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
			// yLabel
			var yLabel = new PointText(pTop + {x: -20, y: -10});
			yLabel.content = "E, φ";
			yLabel.fontSize = 20;
			yLabel.visible = true;
			// xAxis 
			var pLeft = new Point(layout.minX, layout.xAxisHeight);
			var pRight = new Point( layout.maxX, layout.xAxisHeight);
			var xAxis = new Path(pLeft,pRight);
			// xAxis ArrowHead
			var pXArrowTop = pRight + { x: -6, y: 5};
			var pXArrowRight = pRight + { x: 5, y: 0};
			var pXArrowBottom = pRight + {x: -6, y: -5};
			var xAxisArrow = new Path(pXArrowTop, pXArrowRight, pXArrowBottom);
			// xLabel
			var xLabel = new PointText(pRight + {x: 8, y: 15});
			xLabel.content = 'x';
			xLabel.fontSize = 20;
			xLabel.visible = true;
			
			
			//Axes group
			layout.axes = new Group(yAxis, yAxisArrow, yLabel, xAxis, xAxisArrow, xLabel);
			layout.axes.strokeWidth = 2.5;
			layout.axes.strokeColor = 'black';
			xLabel.strokeWidth = .5;
			yLabel.strokeWidth = .5;
			layout.layer.addChild(layout.axes);
		},
};

var grid = {
		layer: new Layer(),
		createGrid: function() {
			var xStep = (layout.maxX - layout.minX)/21;
			var yStep = (layout.maxY - layout.minY)/21;
			var xVals = [];
			var yVals = [];
			var xPaths = [];
			var yPaths = [];
			for (var i = 0; i < 22; i++){
				xVals[i] = 40 + i*xStep;
				yVals[i] = 40 + i*yStep;
			}
			for (var i = 0; i < 22; i++){
				xPaths[i] = new Path();
				yPaths[i] = new Path();
				for (var j = 0; j < 22; j++){
					xPaths[i].add(new Point(xVals[j], yVals[i]));
					yPaths[i].add(new Point(xVals[i], yVals[j]));
				}
				xPaths[i].strokeColor = 'grey';
				yPaths[i].strokeColor = 'grey';
				grid.layer.addChild(xPaths[i]);
				grid.layer.addChild(yPaths[i]);
			}
		},
		setVisible: function(visible){
			grid.layer.visible = visible;
		}
};

var legend = {
		layer: new Layer(),
		pathRect: new Path(),
		pathLegendEnergy: new Path(),
		pathLegendPotential: new Path(),
		pathLegendReal: new Path(),
		pathLegendIm: new Path(),
		pathLegendProb: new Path(),
		textLegendEnergy: new PointText(),
		textLegendPotential: new PointText(),
		textLegendIm: new PointText(),
		textLegendReal: new PointText(),
		textLegendProb: new PointText(),
		createLegend: function(){
			var Px = view.viewSize.width - 120;
			var Py = 0 + 15;
			
			legend.pathRect = new Path.Rectangle(new Point(Px , Py), new Size( 105, 6*15));
			legend.pathRect.fillColor = 'white';
			legend.pathRect.strokeColor = 'black';
			legend.layer.addChild(legend.pathRect);
			
			Py += 12;
			createLegendLine(legend.pathLegendEnergy, legend.textLegendEnergy, Px, Py, 'Energy', 'orange');
			
			Py += 16;
			createLegendLine(legend.pathLegendPotential, legend.textLegendPotential, Px, Py, 'Potential', 'blue');
			
			Py += 16;
			createLegendLine(legend.pathLegendReal, legend.textLegendReal, Px, Py, 'Real', 'green');
			
			Py += 16;
			createLegendLine(legend.pathLegendIm, legend.textLegendIm, Px, Py, 'Imaginary', 'red');
			
			Py += 16;
			createLegendLine(legend.pathLegendProb, legend.textLegendProb, Px, Py, 'Probability', 'grey');
			
			function createLegendLine(path, text, Px, Py, label, color){
				text.point = { x: Px + 30, y: Py +5 }; 
				text.content = label;
				text.fillColor = color;
				text.fontSize = 15;
				text.visible = true;
				text.bringToFront();
				legend.layer.addChild(text);
				
				path.add({x: Px + 5, y: Py}, {x: Px + 25, y: Py});
				path.strokeColor = color;
				path.strokeWidth = 3;
				legend.layer.addChild(path);
			}	
			legend.layer.on('mousedrag', function(event){
				
				legend.layer.translate(event.delta);
				if (layout.pathMainRect.bounds.contains(legend.layer.bounds) == false){
					legend.layer.translate(-event.delta);
				}
			});
		},
		setVisible: function(visible){
			legend.layer.visible = visible;
		}
};

var regionsSetup = { // Stores the regions and methods to create preset regions
		nRegions: 5, // number of regions, first and last always have a potential value of zero
		defaultnRegions: 5,
		Length: 0,
		walls: [], // arrays of walls separating each region in pixels
		ceilings: [], // height of the potential in pixels
		regions: [], // holds the region objects
		randomSetup: function(){ // setup regions as having a random potential values
			regionsSetup.Length =  Math.round( (layout.maxX - layout.minX) / regionsSetup.nRegions );
			for ( var i = 0; i < regionsSetup.nRegions-1; i++){ // there are nRegions - 1 walls, yAxis does not count as a wall
				regionsSetup.walls[i] = layout.minX + regionsSetup.Length + regionsSetup.Length*i;
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
		circleUpSetup: function(){ // setups regions as approximating a half circle
			regionsSetup.Length =  Math.round( (layout.maxX - layout.minX) / regionsSetup.nRegions );
			for ( var i = 0; i < regionsSetup.nRegions-1; i++){ // there are nRegions - 1 walls, yAxis does not count as a wall
				regionsSetup.walls[i] = layout.minX + regionsSetup.Length + regionsSetup.Length*i;
			}
			var circleRadius =  3*(layout.xAxisHeight - layout.minY)/5;
			var x = 0;
			var circleCenterX = layout.minX - (layout.maxX - layout.minX)/2;
			for ( var i = 0; i < regionsSetup.nRegions-2; i++){ // there are nRegions - 2 ceilings, since first and last have zero potential
				x = regionsSetup.walls[i];
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
		},circleDownSetup: function(){ // setups regions as approximating a half circle
			regionsSetup.Length =  Math.round( (layout.maxX - layout.minX) / regionsSetup.nRegions );
			for ( var i = 0; i < regionsSetup.nRegions-1; i++){ // there are nRegions - 1 walls, yAxis does not count as a wall
				regionsSetup.walls[i] = layout.minX + regionsSetup.Length + regionsSetup.Length*i;
			}
			var circleRadius =  (layout.maxY - layout.xAxisHeight );
			var x = 0;
			var circleCenterX = layout.minX - (layout.maxX - layout.minX)/2;
			for ( var i = 0; i < regionsSetup.nRegions-2; i++){ // there are nRegions - 2 ceilings, since first and last have zero potential
				x = regionsSetup.walls[i];
				regionsSetup.ceilings[i] = negCircleYCoord(x, circleRadius, circleCenterX);

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

			function negCircleYCoord(x, circleRadius, circleCenterX){ //returns the -Y coordinate of the circle
				var yCoord = math.sqrt( math.pow(circleRadius,2) - math.pow(x + circleCenterX,2)/4 );
				if (math.im(yCoord)){
					return layout.xAxisHeight;
				} else {
					return layout.xAxisHeight + yCoord;
				}
			};
		},
		destroy: function() {
			for (var i = 0; i < regionsSetup.nRegions; i++){
				regionsSetup.regions[i].destroy();
			}
		},
};


var physics = { // holds physically relevant variables and piecewise eigenfunctions
		hbar: 100,
		mass: 1/2,
		lambda: 1/5,
		timeEvolution: function(E, time){
			t = math.mod(time, 1000);
			return math.exp(math.complex(0, - E*t/physics.hbar));
		},
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
		boundStateConstraint: math.matrix(), // The constraint to verify a boundstate
		boundState: false, // true if we looked for a boundstate in the current configuration
		boundStateEnergies: [], 
		boundStateIndex: -1, // The index of the boundstate closest to the current energy
		boundStateAgreement: [], // How well we satisfy the boundStateConstraint
		time: 0,
		currentlyComputing: false, // Are we currently trying to find boundstates
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
			var newCoef1 = 0;
			var newCoef2 = 0;
			for (var i = 0; i < regionsSetup.nRegions; i++ ){
				if (regionsSetup.regions[i].basisFunction1){
					newCoef1 = math.divide(solver.solutionCoefs.get([index]), Math.sqrt(integral));
					regionsSetup.regions[i].coef1 = newCoef1;
					solver.solutionCoefs.set([index], newCoef1);
					index += 1;

				}
				if (regionsSetup.regions[i].basisFunction2){
					newCoef2 = math.divide(solver.solutionCoefs.get([index]), Math.sqrt(integral));
					regionsSetup.regions[i].coef2 = newCoef2;
					solver.solutionCoefs.set([index], newCoef2);
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
			var newCoef1 = 0;
			var newCoef2 = 0;
			for (var i = 0; i < regionsSetup.nRegions; i++ ){
				if (regionsSetup.regions[i].basisFunction1){
					newCoef1 = math.divide(solver.solutionCoefs.get([index]), Math.sqrt(sum));
					regionsSetup.regions[i].coef1 = newCoef1;
					solver.solutionCoefs.set([index], newCoef1);
					index += 1;

				}
				if (regionsSetup.regions[i].basisFunction2){
					newCoef2 = math.divide(solver.solutionCoefs.get([index]), Math.sqrt(sum));
					regionsSetup.regions[i].coef2 = newCoef2;
					solver.solutionCoefs.set([index], newCoef2);
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
		clearBoundStates: function(){
			solver.boundStateEnergies = [];
			solver.boundStateAgreement = [];
			boundStateIndex = -1;
		},
		findBoundStates: function(){
			// Finds all the boundstates and stores them
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
			solver.clearBoundStates();
			solver.currentlyComputing = true;
			plotter.displayText('Looking for boundstates...');
			while(E > Emin){

				dAgreement = agreement;	
				checkConstraint(E);
				dAgreement = Math.min(3000,(agreement - dAgreement)/interactivedE);

				if (agreement < 0.005){
					if (countBoundState == 0){
						solver.boundStateEnergies[0] = E;
						solver.boundStateAgreement[0] = agreement;
						countBoundState += 1;
					}else {
						if ((Math.abs(solver.boundStateEnergies[countBoundState- 1] - E) < 2) & (agreement < solver.boundStateAgreement[countBoundState-1])){
							solver.boundStateEnergies[countBoundState - 1] = E;
							solver.boundStateAgreement[countBoundState - 1] = agreement;
						} else if (Math.abs(solver.boundStateEnergies[countBoundState- 1] - E) > 2 ){
							solver.boundStateEnergies[countBoundState] = E;
							solver.boundStateAgreement[countBoundState] = agreement;
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
			solver.currentlyComputing = false;
			plotter.clearText();

			function checkConstraint(E){ // Checks if the boundstate constraint is satisfied at a given energy ( < 0 )
				solver.setHandles(E);
				solver.setConstraintVector();
				solver.setMatrix(E);
				solver.solveCoefs(E);
				solver.softNormalize(); // softNormalize is quicker than normalize, but rougher
				agreement = 1000*math.abs(math.dot(solver.boundStateConstraint, solver.solutionCoefs)); //scaled up to be a bigger number
			}
		}
};


var plotter = {
		layer: new Layer(),
		text: new PointText(),
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
				} 
			}

		},
		plotRegion: function(region, E){ //plots the wavefunction in a region at energy E
			var V = region.potential;
			var newPComplex = new Point();
			var newPReal = new Point();
			var newPProb = new Point();
			var time = solver.time;
			var tempF1;
			var tempF2;
			var tempF1pF2;
			var yScale = layout.yScale * (layout.maxY - layout.minY)*(layout.maxX - layout.minX)/500; //scale wavefunction when plotting
			var yScaleProb = 15* layout.yScaleProb * (layout.maxY - layout.minY)*(layout.maxX - layout.minX)/500; //scale probability when plotting
			for (var x = region.left; x < region.right; x = x + 4) {

				newPComplex.x = x;
				newPReal.x = x;
				newPProb.x = x;
				if (region.basisFunction2){

					tempF1 = math.multiply(region.coef1,region.basisFunction1(x,E,V));
					tempF2 = math.multiply(region.coef2,region.basisFunction2(x,E,V));
					tempF1pF2 = math.add(tempF1, tempF2);
					tempF1pF2 = math.multiply(tempF1pF2, physics.timeEvolution(E, time));

					newPReal.y = layout.xAxisHeight - yScale*tempF1pF2.re;
					newPComplex.y = layout.xAxisHeight - yScale*tempF1pF2.im;
					newPProb.y = layout.xAxisHeight - yScaleProb*math.pow(math.abs(tempF1pF2), 2);

				} else {
					tempF1 = math.multiply(region.coef1,region.basisFunction1(x,E,V));
					tempF1 = math.multiply(tempF1, physics.timeEvolution(E, time));
					newPReal.y = layout.xAxisHeight - yScale*tempF1.re;
					newPComplex.y = layout.xAxisHeight - yScale*tempF1.im;
					newPProb.y = layout.xAxisHeight - yScaleProb*math.pow(math.abs(tempF1), 2);

				}

				region.pathPlotReal.add(newPReal);
				region.pathPlotComplex.add(newPComplex);
				region.pathPlotProb.add(newPProb);
			}

			// Add a point at the right endpoint too
			x = region.right;
			newPComplex.x = x;
			newPReal.x = x;
			newPProb.x = x;
			if (region.basisFunction2){

				tempF1 = math.multiply(region.coef1,region.basisFunction1(x,E,V));
				tempF2 = math.multiply(region.coef2,region.basisFunction2(x,E,V));
				tempF1pF2 = math.add(tempF1, tempF2);
				tempF1pF2 = math.multiply(tempF1pF2, physics.timeEvolution(E, time));

				newPReal.y = layout.xAxisHeight - yScale*tempF1pF2.re;
				newPComplex.y = layout.xAxisHeight - yScale*tempF1pF2.im;
				newPProb.y = layout.xAxisHeight - yScaleProb*math.pow(math.abs(tempF1pF2), 2);

			} else {
				tempF1 = math.multiply(region.coef1,region.basisFunction1(x,E,V));
				tempF1 = math.multiply(tempF1, physics.timeEvolution(E, time));
				newPReal.y = layout.xAxisHeight - yScale*tempF1.re;
				newPComplex.y = layout.xAxisHeight - yScale*tempF1.im;
				newPProb.y = layout.xAxisHeight - yScaleProb*math.pow(math.abs(tempF1), 2);
			}
			
			region.pathPlotReal.add(newPReal);
			region.pathPlotComplex.add(newPComplex);
			region.pathPlotProb.add(newPProb);

			region.pathPlotReal.bringToFront();
			region.pathPlotComplex.bringToFront();
			region.pathPlotProb.bringToFront();

		},
		clearRegion: function(region){
			region.pathPlotComplex.removeSegments();
			region.pathPlotReal.removeSegments();
			region.pathPlotProb.removeSegments();

		},
		clearGraph: function(){
			for (var i = 0; i < regionsSetup.nRegions; i++ ){
				plotter.clearRegion(regionsSetup.regions[i]);
			}
		},
		displayText: function(text){
			plotter.text.point = {x: (layout.maxX - layout.minX)/3 , y: (layout.maxY - layout.minY)/2 };
			plotter.text.content = text;
			plotter.text.fillColor = 'black';
			plotter.text.fontSize = 25;
			plotter.text.visible = true;
			plotter.text.bringToFront();
		},
		clearText: function(){
			plotter.text.visible = false;
		},
		setVisible: function(visible, pathName){

			if (visible == true){
				try {
					for (var i = 0; i < regionsSetup.nRegions; i++){
						regionsSetup.regions[i][pathName].visible = true;
					}
				}
				catch(err) {
					console.log(err);
				}

			} else {

				try {
					for (var i = 0; i < regionsSetup.nRegions; i++){

						regionsSetup.regions[i][pathName].visible = false;
					}
				}
				catch(err) {
					console.log(err);
				}
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
		var bottomConstraint;
		if (solver.boundState == true){
			bottomConstraint = layout.maxY; // bigger is lower, 0 is top
		} else { // don't allow negative or very small energy, E > 1
			bottomConstraint = layout.xAxisHeight - 1;
		}
		answer = Math.max( newY, topConstraint );
		answer = Math.min( answer, bottomConstraint );
		return answer;
	};

	this.updateEnergy = function(E){
		var newE = E ;

		if (newE < 0){
			if (solver.boundStateIndex == -1){
				parent.moveLine(layout.xAxisHeight - 10);

			} else{
				parent.moveLine(layout.xAxisHeight - solver.boundStateEnergies[solver.boundStateIndex] );
			}
		}
	};

	var parent = this;
	this.energyY = this.constraintE(E); 
	this.energy = layout.xAxisHeight - this.energyY;
	this.line = new Path([ new Point(5, this.energyY ), new Point(view.viewSize.width - 5, this.energyY)]);

	this.line.strokeWidth = 5;
	this.line.strokeColor = 'orange';
	plotter.layer.addChild(this.line);
	this.line.selectable = true;
	this.line.draggable_ns = true;

	this.line.onMouseDrag = function(event){
		var newYValue = event.point.y;
		var newE = layout.xAxisHeight - newYValue;
		parent.moveLine(newYValue);
		updateBoundStates();
		updateEnergy();
	};

	this.line.onMouseUp = function(event){
		var newYValue = event.point.y;
		var newE = layout.xAxisHeight - newYValue;
		updateBoundStates();
		parent.updateEnergy(newE);
		updateEnergy();
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
	this.pathPlotProb = new Path();
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
	this.pathPlotComplex.strokeWidth = 3.5;
	this.pathPlotReal.strokeColor = 'green';
	this.pathPlotReal.strokeWidth = 3.5;
	this.pathPlotProb.strokeColor = 'grey';
	this.pathPlotProb.strokeWidth = 3.5;

	plotter.layer.addChildren([this.leftSide,this.rightSide,this.ceiling,this.pathPlotComplex,this.pathPlotReal,this.pathPlotProb]);
	this.rightSide.selectable = true;
	this.rightSide.draggable_ew = true;
	this.leftSide.selectable = true;
	this.leftSide.draggable_ew = true;
	this.ceiling.selectable = true;
	this.ceiling.draggable_ns = true;

	this.ceiling.onMouseDrag = function(event){
		var newYValue = event.point.y;
		parent.moveCeiling(newYValue);
		updateRegion();
	};

	this.leftSide.onMouseDrag = function(event){
		var newXValue = event.point.x;
		parent.moveLeftSide(newXValue);
		if (parent.leftNeighbor){
			parent.leftNeighbor.moveRightSide(newXValue);
		}
		updateRegion();
	};

	this.rightSide.onMouseDrag = function(event){
		var newXValue = event.point.x;
		parent.moveRightSide(newXValue);
		if (parent.rightNeighbor){
			parent.rightNeighbor.moveLeftSide(newXValue);
		}	
		updateRegion();
	};

	this.rightSide.onMouseUp = function(event){

		updateRegion();
	};

	this.leftSide.onMouseUp = function(event){
		updateRegion();
	};

	this.ceiling.onMouseUp = function(event){
		updateRegion();
	};
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
SquarePotential.prototype.destroy = function(){

	this.pathPlotComplex.remove();
	this.pathPlotReal.remove();
	this.pathPlotProb.remove();
	this.leftSide.remove();
	this.rightSide.remove();
	this.ceiling.remove();

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
	this.pathPlotProb = new Path();
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
	this.pathPlotComplex.strokeWidth = 3.5;
	this.pathPlotReal.strokeColor = 'green';
	this.pathPlotReal.strokeWidth = 3.5;
	this.pathPlotProb.strokeColor = 'grey';
	this.pathPlotProb.strokeWidth = 3.5;

	plotter.layer.addChildren([this.leftSide,this.rightSide,this.ceiling,this.pathPlotComplex,this.pathPlotReal, this.pathPlotProb]);
	this.leftSide.selectable = true;
	this.leftSide.draggable_ew = true;


	this.leftSide.onMouseDrag = function(event){
		var newXValue = event.point.x;
		parent.moveLeftSide(newXValue);
		if (parent.leftNeighbor){
			parent.leftNeighbor.moveRightSide(newXValue);
		}
		updateRegion();

	};
	this.leftSide.onMouseUp = function(event){
		updateRegion();
	};

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
	this.pathPlotProb = new Path();
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
	this.pathPlotComplex.strokeWidth = 3.5;
	this.pathPlotReal.strokeColor = 'green';
	this.pathPlotReal.strokeWidth = 3.5;
	this.pathPlotProb.strokeColor = 'grey';
	this.pathPlotProb.strokeWidth = 3.5;

	plotter.layer.addChildren([this.leftSide,this.rightSide,this.ceiling,this.pathPlotComplex,this.pathPlotReal, this.pathPlotProb]);
	this.rightSide.selectable = true;
	this.rightSide.draggable_ew = true;

	this.rightSide.onMouseDrag = function(event){
		var newXValue = event.point.x;
		parent.moveRightSide(newXValue);
		if (parent.rightNeighbor){
			parent.rightNeighbor.moveLeftSide(newXValue);
		}
		updateRegion();
	};

	this.rightSide.onMouseUp = function(event){
		updateRegion();
	};

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

function BoundStateArrowHead(x,y){ //Create arrowhead pointing right with the tip at (x,y)

	this.init = function(){

		// ArrowHead
		var pArrowTop = this.pHead + { x: -7, y: 5};
		var pArrowHead = this.pHead + { x: 0, y: 0};
		var pArrowBottom = this.pHead + {x: -7, y: -5};
		this.arrow = new Path(pArrowTop, pArrowHead, pArrowBottom);
		//Axes group

		this.arrow.strokeWidth = 4;
		this.arrow.strokeColor = 'orange';
		this.arrow.closed = true;
		this.arrow.fillColor = 'orange';
		this.arrow.strokeJoin = 'round';
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



function solve(){
	// Solves the system for the current energy
	var E = energy.energy;
	solver.setHandles( E);
	solver.setConstraintVector();
	solver.setMatrix(E);
	solver.solveCoefs(E);
	solver.normalize(E);
}


function plot(){
	// Plots the wavefunction for the current energy, if there is an allowed wavefunction.
	var E = energy.energy;
	plotter.clearGraph();
	if (E > 0){
		plotter.plot(E);
	}else{
		for(var i=0; i < solver.boundStateEnergies.length; i++){
			if (Math.abs(E - solver.boundStateEnergies[i]) < 0.05){
				plotter.plot(E);
			}
		}
	}
}

function findBoundStates(){
	// Finds the boundstates and plots arrow corresponding to their energies.
	solver.boundState = true;
	solver.findBoundStates();
	layout.createArrows();
	solve();	
}


function resetBoundStates(){
	// Clears the boundState data and arrows.
	solver.clearBoundStates();
	layout.removeArrows();
}

function updateBoundStateIndex(E){
	// Updates the corresponding boundStateEnergies index based on the current energy.
	var index = -1;
	for (var i = 0; i < solver.boundStateEnergies.length ; i++){
		if (E < solver.boundStateEnergies[i]){
			index += 1;
		}
	}
	solver.boundStateIndex = index;
}


function updateBoundStateBtns(){
	// Updates which buttons are clickable depending on the current boundstate index.
	if ( (solver.boundStateEnergies.length)&&( solver.boundStateIndex < (solver.boundStateEnergies.length - 1) ) ){
		$("#prevBoundStateBtn")[0].disabled = false;	
	}else {
		$("#prevBoundStateBtn")[0].disabled = true;
	}

	if ( (solver.boundStateEnergies.length)&&( solver.boundStateIndex > 0 )){
		$("#nextBoundStateBtn")[0].disabled = false;
	}else {
		$("#nextBoundStateBtn")[0].disabled = true;
	}
}

function updateBoundStates(){
	// Updates the current boundstate index and the boundstate buttons.
	var E = energy.energy;
	updateBoundStateIndex(E);
	updateBoundStateBtns();
}


function launchPreset(presetName){
	switch(presetName) {
	case "Random Potential":
	{regionsSetup.randomSetup();}
	break;
	case "Half-circle dome":
	{regionsSetup.circleUpSetup();}
	break;
	case "Half-circle well":
	{regionsSetup.circleDownSetup();}
	break;
	default:
	{regionsSetup.randomSetup();}
	}

	updateRegion();
	energy.line.bringToFront();
}

function setVisibility(){
	// Sets the visibility of each wavefunction.
	plotter.setVisible($("#realCheckbox").prop('checked'), 'pathPlotReal');
	plotter.setVisible($("#complexCheckbox").prop('checked'), 'pathPlotComplex');
	plotter.setVisible($("#probCheckbox").prop('checked'), 'pathPlotProb');
	grid.setVisible($("#gridCheckbox").prop('checked'));
	legend.setVisible($("#legendCheckbox").prop('checked'));
}

function boundStateMsg(){
	// Returns the message once the boundstates have been found.
	var msg = '';
	if (solver.boundStateEnergies.length < 1){
		msg = ' <h3> Oops! There doesn\'t seem to be any allowed boundstates. <\h3>';
		msg += '<p> Perhaps try another configuration? <\p>';
	}else {
		msg = ' <h3>The search has found ' + solver.boundStateEnergies.length.toString() + ' boundstates. <\h3>';
		msg += '<p>Use the previous and next boundstate buttons to navigate between boundstates or ';
		msg += 'drag and drop the energy line to view the wavefunction <\p>';
	}
	return msg;
}

function updateEnergy(){
	// Controls what happens when we drag or drop the energy line.
	solve();
}


function updateRegion(){
	// Controls what happens when we drag or drop region boundaries.
	var E = energy.energy;
	$('#boundStateBtn')[0].disabled = false;
	solver.boundState = false;
	resetBoundStates();
	updateBoundStates();
	energy.updateEnergy(E);
	solve();
}

function onFrame(event){
	// Plot the wavefunction up to 60/3 = 20 frames per second.
	solver.time = event.time; //Update time
	if (event.count % 3){
		plot();
	}
}

function onMouseMove(event) {
	// Controls the mouse cursor depending on which path we hover over.
	project.activeLayer.selected = false;
	document.getElementById("canvas").style.cursor = "default";
	if (event.item) {
		if (event.item.selectable){
			event.item.selected = true;
		}
		if (event.item.draggable_ns){
			document.getElementById("canvas").style.cursor = "ns-resize";
		}
		if (event.item.draggable_ew){
			document.getElementById("canvas").style.cursor = "ew-resize";
		}
	}
}


$(function(){
	// On document load, disable the prev and next boundstate buttons
	$("#prevBoundStateBtn")[0].disabled = true;
	$("#nextBoundStateBtn")[0].disabled = true;

	// And start up everything
	layout.createMainRect();
	layout.createAxes();
	layout.axes.sendToBack();
	grid.createGrid();
	legend.createLegend();
	plotter.layer.activate();
	energy = new Energy(150);
	regionsSetup.randomSetup();
	
	energy.line.bringToFront();
	updateRegion();
	legend.layer.insertAbove(project.activeLayer);
	grid.layer.insertBelow(layout.layer);
});

$(function(){
	// Constrols the button to find bounstates.
	$("#boundStateBtn").click( function(){
		$('#boundStateBtn')[0].disabled = true;
		solver.boundState = true;
		resetBoundStates();
		findBoundStates();
		updateEnergy();

		//Pops up a modal and tells the user how many boundstates were found
		$('#boundStatesFound').html(boundStateMsg());
		$("#basicModal").modal('show');
		setTimeout(function() {$('#basicModal').modal('hide');}, 10000);
	});
});

$(function(){
	//Constrols the previous boundstate button
	$("#prevBoundStateBtn").click( function(){
		solver.boundStateIndex += 1;
		updateBoundStateBtns();
		energy.moveLine(layout.xAxisHeight - solver.boundStateEnergies[solver.boundStateIndex] );
		solve();


	});
	//Controls the next boundstate button
	$("#nextBoundStateBtn").click( function(){
		solver.boundStateIndex -= 1;
		updateBoundStateBtns();
		energy.moveLine(layout.xAxisHeight - solver.boundStateEnergies[solver.boundStateIndex] );
		solve();
	});
});

$(function(){
	// Constrols the input that changes how many regions there are.
	$("#nRegions").attr('value', regionsSetup.nRegions);
	$("#nRegions").change( function(){
		regionsSetup.destroy();
		var newValue = jQuery.isNumeric(this.value)? Math.round(this.value) : regionsSetup.defaultnRegions;
		newValue = Math.max(Math.min(newValue, 50), 3);
		regionsSetup.nRegions = newValue;
		this.value = regionsSetup.nRegions;
		launchPreset($("#presetPotential").val());
		setVisibility();
	});
});

$(function(){
	// Controls the input that changes the y-scale of the real and complex wavefunctions.
	$("#yScale").attr('value', layout.yScale);
	$("#yScale").change( function(){
		var newValue = jQuery.isNumeric(this.value)? this.value : layout.defaultyScale;
		newValue = Math.max(Math.min(newValue, 5), .5);
		layout.yScale = newValue;
		this.value = layout.yScale;

	});
});

$(function(){
	// Controls the input that changes the y-scale of the probability wavefunction.
	$("#yScaleProb").attr('value', layout.yScaleProb);
	$("#yScaleProb").change( function(){
		var newValue = jQuery.isNumeric(this.value)? this.value : layout.defaultyScaleProb;
		newValue = Math.max(Math.min(newValue, 5), .5);
		layout.yScaleProb = newValue;
		this.value = newValue;
	});
});

$(function(){
	// Constrols the preset potential input
	$("#presetPotential").change( function(){
		var newValue = this.value;
		regionsSetup.destroy();
		launchPreset(newValue);
		setVisibility();
	});
});



$(function(){
	// Controls the checkboxes to toggle the real, complex and probability wavefunction
	setVisibility();

	$("#realCheckbox").change( function(){
		plotter.setVisible(this.checked, 'pathPlotReal');

	});

	$("#complexCheckbox").change( function(){
		plotter.setVisible(this.checked, 'pathPlotComplex');

	});

	$("#probCheckbox").change( function(){
		plotter.setVisible(this.checked, 'pathPlotProb');

	});
	
	$("#gridCheckbox").change( function(){
		grid.setVisible(this.checked);

	});
	
	$("#legendCheckbox").change( function(){
		legend.setVisible(this.checked);

	});
	
	
});


