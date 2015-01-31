var regionsSetup = {
		nRegions: 5, // number of regions, first and last always have a potential value of zero
		defaultLength: 0,
		walls: [], // arrays of walls separating each region in pixels
		ceilings: [], // height of the potential in pixels
		randomSetup: function(){
			// setup regions as having a random potential values
			regionsSetup.defaultLength =  Math.round( (layout.maxX - layout.minX) / regionsSetup.nRegions );

			for ( var i = 0; i < regionsSetup.nRegions-1; i++){ // there are nRegions - 1 walls, yAxis does not count as a wall
				regionsSetup.walls[i] = regionsSetup.defaultLength + regionsSetup.defaultLength*i;
			}

			for ( var i = 0; i < regionsSetup.nRegions-2; i++){ // there are nRegions - 2 ceilings, since first and last have zero potential
				regionsSetup.ceilings[i] = Math.round( layout.maxY + (layout.minY - layout.maxY)*Math.random() );
			}
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
		}
};


var layout = {
		pathMainRect: new Path(),  // Outer rectangle
		// padding inside outer rectangle
		maxY: 20,
		minY: view.viewSize.height - 20,
		minX: 20,
		maxX: view.viewSize.width - 20,
		axes: new Group(),
		xAxisHeight: ( view.viewSize.height - 20) * .7,
		maxEnergyHeight: 75, // Max energy in pixel
		yScale: 1000, // Overall scale of the wavefunction
		createMainRect: function(){
			var topLeftCorner = new Point( 0, 0 );
			var bottomRightCorner = new Point(view.viewSize.width,view.viewSize.height);
			var mainRect = new Rectangle(topLeftCorner,bottomRightCorner);
			layout.pathMainRect = new Path.Rectangle(mainRect);
			layout.pathMainRect.strokeColor = 'black';
			layout.pathMainRect.strokeWidth = 10;	
		},
		createAxes: function(){
			// yAxis 
			var pTop = new Point( layout.minX, layout.maxY );
			var pBottom = new Point( layout.minX, layout.minY );
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


var regionsData = {
		pathWalls: [], // Dashed lines corresponding to region separators
		pathCeilings: [], // ceiling of the square potentials
		pathLeftSide: [], // left side of the square potentials
		pathRightSide: [], // right side
		pathPlotComplex: new Path(), // complex wavefunction
		pathPlotReal: new Path(), // real wavefunction
		// coordinates of the walls and potential wells
		pTop: [], // top of Walls
		pBottom: [], // bottom of walls
		pMiddleLeft: [], // top left points of potential wells
		pMiddleRight: [], // top right points of potential wells
		pXAxis: [], // bottom of the wells on the xAxis
		energy: Math.random()*(layout.xAxisHeight - layout.maxEnergyHeight),
		potentials: [], // potentials value in units of energy (not pixels)
		boundaries: [], // boundary values along the x axis
		// Energy line and relevant points
		pathEnergy: new Path(), 
		pEnergyLeft: new Point(),
		pEnergyRight: new Point(),
		matrixCoefs: math.zeros(regionsSetup.nRegions*2 - 1, regionsSetup.nRegions*2 - 1), //Matrix to solve to find coefficients of wavefunction
		vectorCoefs: [], // Vector constraint b = Ax, to find coefficients of wavefunction
		solutionCoefs: [], // Solution vector x = Inv(A)b containing coefficients of wavefunction
		functionHandles: [], // handle representing which eigenfunction is to be plotted in a region
		regionsGroup: new Group(),
		createData: function(){ // Setup points
			// Setup boundaries points
			for (var i = 0; i < regionsSetup.nRegions-1; i++){
				regionsData.pTop[i] = new Point( regionsSetup.walls[i], layout.minY);
				regionsData.pBottom[i] = new Point( regionsSetup.walls[i], layout.maxY);
				regionsData.pXAxis[i] = new Point( regionsSetup.walls[i], layout.xAxisHeight);
				regionsData.boundaries[i] = regionsSetup.walls[i]; // along x-axis
			}
			// Setup square potentials points
			for (var i = 0; i < regionsSetup.nRegions-2; i++){
				regionsData.pMiddleLeft[i] = new Point( regionsSetup.walls[i], regionsSetup.ceilings[i]);
				regionsData.pMiddleRight[i] = new Point( regionsSetup.walls[i+1], regionsSetup.ceilings[i]);
				regionsData.potentials[i+1] = layout.xAxisHeight - regionsSetup.ceilings[i]; // in energy units
			}
			// First and last region always have fixed zero potential
			regionsData.potentials[0] = 0;
			regionsData.potentials[regionsSetup.nRegions - 1] = 0;
			// Setup the energy points
			regionsData.pEnergyLeft = { x: layout.minX , y: layout.xAxisHeight - regionsData.energy};
			regionsData.pEnergyRight = { x: layout.maxX , y: layout.xAxisHeight - regionsData.energy};

			// Setup constraint vector as [ 0, 0, ..., 1 ], Size is (nBoundaries*2 + 1), 
			for (var i = 0; i < regionsSetup.nRegions*2 - 1; i++){
				regionsData.vectorCoefs[i] = 0;
			}
			regionsData.vectorCoefs[regionsSetup.nRegions*2 - 2] = 1; // corresponds to setting coefficient A = 1



		},
		createRegion: function(){ // create the paths for each regions
			// Setup boundaries paths
			for (var i = 0; i < regionsSetup.nRegions-1; i++){
				regionsData.pathWalls[i] = new Path(regionsData.pTop[i],regionsData.pBottom[i]);
				regionsData.regionsGroup.addChild(regionsData.pathWalls[i]);
				regionsData.pathWalls[i].dashArray = [5,5];
			}
			// Setup square potentials paths
			for (var i = 0; i < regionsSetup.nRegions-2; i++){
				regionsData.pathCeilings[i] = new Path(regionsData.pMiddleLeft[i], regionsData.pMiddleRight[i]);
				regionsData.pathLeftSide[i] = new Path(regionsData.pMiddleLeft[i], regionsData.pXAxis[i]);
				regionsData.pathRightSide[i] = new Path(regionsData.pMiddleRight[i], regionsData.pXAxis[i+1]);

				regionsData.regionsGroup.addChild(regionsData.pathCeilings[i]);
				regionsData.regionsGroup.addChild(regionsData.pathLeftSide[i]);
				regionsData.regionsGroup.addChild(regionsData.pathRightSide[i]);
			}
			// Add everything to group and setup strokestyle
			regionsData.pathEnergy.add(regionsData.pEnergyLeft);
			regionsData.pathEnergy.add(regionsData.pEnergyRight);
			regionsData.regionsGroup.addChild(regionsData.pathEnergy);

			regionsData.regionsGroup.strokeColor = 'black';
			regionsData.regionsGroup.strokeWidth = 3;
			regionsData.pathEnergy.strokeColor = 'blue';
			regionsData.pathPlotComplex.strokeColor = 'red';
			regionsData.pathPlotComplex.strokeWidth = 3;
			regionsData.pathPlotReal.strokeColor = 'green';
			regionsData.pathPlotReal.strokeWidth = 3;

		},
		constraintX: function( newX, temp){
			// constrains the x coordinate of walls and domains so that they cannot be moved past neighbor domains or padding of outer-rectangle
			var answer;
			if ( temp == 0){
				answer = Math.max( newX, layout.minX +5);
			}else{
				answer = Math.max( newX, regionsData.pathWalls[temp-1].segments[0].point.x +5);
			}
			if ( temp == regionsSetup.nRegions - 2){
				answer = Math.min( answer , layout.maxX -5);
			}else{
				answer = Math.min( answer , regionsData.pathWalls[temp+1].segments[0].point.x -5 );
			}
			return answer;
		},
		constraintY: function( newY){
			// constrains the y coordinates of potentials so they cannot be moved past the padding of the outer rectangle
			var answer;
			answer = Math.max( newY, layout.maxY );
			answer = Math.min( answer, layout.minY );
			return answer;
		},
		constraintE: function( newEpos){
			// constrains energy line so it cannot be moved below the min and max allowed values
			var answer;
			answer = Math.min( newEpos, layout.xAxisHeight - 2);  // min energy is 2, prevents boundstates
			answer = Math.max( answer, layout.maxY + 20); // max energy is 20 less than padding allows
			return answer;
		},
		setFunctionHandles: function() {
			// sets the handles for which function exists in a given region
			for (var i = 0; i < regionsSetup.nRegions -1; i++){
				var index = 2*i; // the basis is two dimensional because schrodinger's eq is 2nd order.
				var E = regionsData.energy;
				var V = regionsData.potentials[i];
				if ( E < V ){ // real exponential when E< V
					this.functionHandles[index] = physics.rExpPlus;
					this.functionHandles[index+1] = physics.rExpMinus;
				}else if ( E > V ){ // complex exponential when E > V
					this.functionHandles[index] = physics.cExpPlus;
					this.functionHandles[index+1] = physics.cExpMinus;
				}else{ // linear function when E = V, (turning points)
					this.functionHandles[index] = physics.linear;
					this.functionHandles[index+1] = physics.constant;
				}
			}
			// Only one basis function on last domain because there can be no reflected wave
			this.functionHandles[regionsSetup.nRegions*2 - 2] = physics.cExpPlus; 
		},
		setMatrix: function(){
			for (var i = 0 ; i < regionsSetup.nRegions - 1; i++ ){ // No right boundary condition for the last domain, i ends at nRegions - 2
				setRightBoundaryConditions(i);
			}
			for (var i = 1 ; i < regionsSetup.nRegions ; i++ ){ // No left boundary condition for the first domain, i starts at 1
				setLeftBoundaryConditions(i);
			}

			// constrains a linear combination of A and B, the coefficients of the eigenfunctions of the first domain
			regionsData.matrixCoefs.set([regionsSetup.nRegions*2 - 2 , 0],1);
			regionsData.matrixCoefs.set([regionsSetup.nRegions*2 - 2 , 1],0);

			function setRightBoundaryConditions(index){ // In, A + B - C - D = 0, this sets the A + B part of the equations
				var indexI = 2*index; // labels equations
				var indexJ = 2*index; // labels coefficients of wavefunction
				var x = regionsData.boundaries[index];
				var E = regionsData.energy;
				var V = regionsData.potentials[index];
				
				// TODO replace with reference to functionhandles
				if ( E < V ){
					// Ensure continuity at boundary
					regionsData.matrixCoefs.set([indexI, indexJ], physics.rExpPlus(x,E,V));
					regionsData.matrixCoefs.set([indexI, indexJ+1], physics.rExpMinus(x,E,V));
					// Ensure differentiability at boundary
					regionsData.matrixCoefs.set([indexI+1, indexJ], physics.rExpPlusPrime(x,E,V));
					regionsData.matrixCoefs.set([indexI+1, indexJ+1], physics.rExpMinusPrime(x,E,V));
					for (var k = 0; k < regionsSetup.nRegions*2 -1; k++){
					}
				}else if ( E > V ){
					// Ensure continuity at boundary
					regionsData.matrixCoefs.set([indexI, indexJ], physics.cExpPlus(x,E,V));
					regionsData.matrixCoefs.set([indexI, indexJ+1], physics.cExpMinus(x,E,V));
					// Ensure differentiability at boundary
					regionsData.matrixCoefs.set([indexI+1, indexJ], physics.cExpPlusPrime(x,E,V));
					regionsData.matrixCoefs.set([indexI+1, indexJ+1], physics.cExpMinusPrime(x,E,V));
				}else{
					// Ensure continuity at boundary
					regionsData.matrixCoefs.set([indexI, indexJ], physics.linear(x,E,V));
					regionsData.matrixCoefs.set([indexI, indexJ+1], physics.constant(x,E,V));
					// Ensure differentiability at boundary
					regionsData.matrixCoefs.set([indexI+1, indexJ], physics.constant(x,E,V));
					regionsData.matrixCoefs.set([indexI+1, indexJ+1], physics.zero(x,E,V));
				}
			}
			function setLeftBoundaryConditions(index){ // In, A + B - C - D = 0, this sets the -C - D part of the equations
				var indexI = 2*index -2; // labels the equation, -2 because index starts shifted by 1
				var indexJ = 2*index; // labels the coefficient
				var x = regionsData.boundaries[index-1]; // -1 because index starts shifted by 1
				var E = regionsData.energy;
				var V = regionsData.potentials[index];
				if (index == regionsSetup.nRegions - 1){ // last region is a special case because there is only one basis eigenfunction
					regionsData.matrixCoefs.set([indexI, indexJ], math.multiply(-1, physics.cExpPlus(x,E,V)));
					regionsData.matrixCoefs.set([indexI+1, indexJ], math.multiply(-1, physics.cExpPlusPrime(x,E,V)));
				} else{
					if ( E < V ){
						// Ensure continuity at boundary
						regionsData.matrixCoefs.set([indexI, indexJ], math.multiply(-1, physics.rExpPlus(x,E,V)));
						regionsData.matrixCoefs.set([indexI, indexJ+1], math.multiply(-1, physics.rExpMinus(x,E,V)));
						// Ensure differentiability at boundary
						regionsData.matrixCoefs.set([indexI+1, indexJ], math.multiply(-1, physics.rExpPlusPrime(x,E,V)));
						regionsData.matrixCoefs.set([indexI+1, indexJ+1], math.multiply(-1, physics.rExpMinusPrime(x,E,V)));
					}else if ( E > V ){
						// Ensure continuity at boundary
						regionsData.matrixCoefs.set([indexI, indexJ], math.multiply(-1, physics.cExpPlus(x,E,V)));
						regionsData.matrixCoefs.set([indexI, indexJ+1], math.multiply(-1, physics.cExpMinus(x,E,V)));
						// Ensure differentiability at boundary
						regionsData.matrixCoefs.set([indexI+1, indexJ], math.multiply(-1, physics.cExpPlusPrime(x,E,V)));
						regionsData.matrixCoefs.set([indexI+1, indexJ+1], math.multiply(-1, physics.cExpMinusPrime(x,E,V)));
					}else{
						// Ensure continuity at boundary
						regionsData.matrixCoefs.set([indexI, indexJ], math.multiply(-1, physics.linear(x,E,V)));
						regionsData.matrixCoefs.set([indexI, indexJ+1], math.multiply(-1, physics.constant(x,E,V)));
						// Ensure differentiability at boundary
						regionsData.matrixCoefs.set([indexI+1, indexJ], math.multiply(-1, physics.constant(x,E,V)));
						regionsData.matrixCoefs.set([indexI+1, indexJ+1], math.multiply(-1, physics.zero(x,E,V)));
					}
				}
			}
		},
		solveCoefs: function() { // solves b = Ax, i.e. x = inv(A)*b
			var invA = math.inv(regionsData.matrixCoefs);
			regionsData.solutionCoefs = math.multiply(invA,regionsData.vectorCoefs);
		},
		plotWaves: function() { // plots the wavefunction
			var E = regionsData.energy;
			var V = regionsData.potentials[0];
			regionsData.pathPlotComplex.removeSegments();
			regionsData.pathPlotReal.removeSegments();
			var newPComplex = new Point();
			var newPReal = new Point();
			var index = 0; // index labeling regions
			var yScale = layout.yScale; //scale everything when plotting
			for (var x = layout.minX; x < layout.maxX; x++){

				if ((index < regionsSetup.nRegions - 1) & (x > regionsData.boundaries[index])) {

					index += 1; // change which region we are in when crossing a boundary

				}
				V = regionsData.potentials[index];
				newPComplex.x = x;
				newPReal.x = x;
				if (index == regionsSetup.nRegions - 1){
					// last region only has one eigenfunction basis
					newPReal.y = layout.xAxisHeight - yScale*(math.multiply(regionsData.solutionCoefs.get([index*2]),regionsData.functionHandles[index*2](x,E,V))).re;
					newPComplex.y = layout.xAxisHeight - yScale*(math.multiply(regionsData.solutionCoefs.get([index*2]),regionsData.functionHandles[index*2](x,E,V))).im;
				} else {
					// in general there are two eigenfunctions basis
					newPReal.y = layout.xAxisHeight - yScale*(math.add(math.multiply(regionsData.solutionCoefs.get([index*2]),regionsData.functionHandles[index*2](x,E,V)) , 
							math.multiply(regionsData.solutionCoefs.get([index*2+1]),regionsData.functionHandles[index*2+1](x,E,V)))).re;
					newPComplex.y = layout.xAxisHeight - yScale*(math.add(math.multiply(regionsData.solutionCoefs.get([index*2]),regionsData.functionHandles[index*2](x,E,V)) , 
							math.multiply(regionsData.solutionCoefs.get([index*2+1]),regionsData.functionHandles[index*2+1](x,E,V)))).im;
				}

				regionsData.pathPlotReal.add(newPReal);
				regionsData.pathPlotComplex.add(newPComplex);
			}
		},
		normalize: function() {
			// normalize the wavefunction so that the integral over the whole box is 1
			var E = regionsData.energy;
			var V = regionsData.potentials[0];
			var integral = 0;
			var index = 0; // start with the first region
			var xStart = layout.minX; // integrate from minX
			var xEnd = layout.maxX; // integrate up to maxX
			var dx = 0.1; // break integral into rectangles of width dx
			var x = xStart; 
			var f1,f2 = math.complex(); // in general there are two eigenfunction to integrate

			for (var i = 0; x < xEnd; i++){
				// break the integral into regions
				if ((index < regionsSetup.nRegions - 1) & (x > regionsData.boundaries[index])) {
					index += 1; // move into next region once we have crossed a boundary
				}
				V = regionsData.potentials[index];
				if (index == regionsSetup.nRegions - 1){ // the last domain has only one eigenfunction
					// compute coef*eigenfunction
					f1 = math.multiply(regionsData.solutionCoefs.get([index*2]),regionsData.functionHandles[index*2](x,E,V));
					integral += math.multiply(f1,math.conj(f1))*dx;

				}else{ // in general there are two eigenfunctions
					// compute coef*eigenfunction
					f1 = math.multiply(regionsData.solutionCoefs.get([index*2]),regionsData.functionHandles[index*2](x,E,V));
					f2 = math.multiply(regionsData.solutionCoefs.get([index*2+1]),regionsData.functionHandles[index*2+1](x,E,V));
					integral += math.add(math.add(math.multiply(f1,math.conj(f1)) , math.multiply(f2,math.conj(f2))), math.add(math.multiply(f2,math.conj(f1)) , math.multiply(f1,math.conj(f2))))*dx;
				}
				x += dx; // move on to the next rectangle
			}
			// normalize the coefficients by the norm of the function
			regionsData.solutionCoefs = math.divide(regionsData.solutionCoefs, Math.sqrt(integral));

		},
		bindMouseEvents: function(){
			for (var i = 0; i < regionsSetup.nRegions - 1; i++){
				regionsData.pathWalls[i].onMouseDrag = function(event) {
					// move potential wells as the regions walls are dragged
					var temp = regionsData.pathWalls.indexOf(this);
					// ensure that the new X value does not cross the outer rectangle or another region
					var newXValue = regionsData.constraintX( event.point.clone().x, temp);
					regionsData.pathWalls[temp].segments[0].point.x = newXValue;
					regionsData.pathWalls[temp].segments[1].point.x = newXValue;
					regionsData.boundaries[temp] = newXValue;

					if ( temp < regionsSetup.nRegions - 2){ // last domain doesn't have right neighbor or ceiling
						regionsData.pathLeftSide[temp].segments[0].point.x = newXValue;
						regionsData.pathLeftSide[temp].segments[1].point.x = newXValue;
						regionsData.pathCeilings[temp].segments[0].point.x = newXValue;
					}

					if ( temp > 0 ){ // first domain doesn't have a left neighbor or ceiling
						regionsData.pathRightSide[temp-1].segments[0].point.x = newXValue;
						regionsData.pathRightSide[temp-1].segments[1].point.x = newXValue;
						regionsData.pathCeilings[temp-1].segments[1].point.x = newXValue;
					}
					this.selected = true;
					// recompute coefficients
					regionsData.setFunctionHandles();
					regionsData.setMatrix();
					regionsData.solveCoefs();
					regionsData.normalize();
					regionsData.plotWaves();
				};
				regionsData.pathWalls[i].onMouseUp = function(event){
					this.selected = false;
				};
				regionsData.pathWalls[i].onMouseLeave = function(event){
					this.selected = false;
				};
			}
			for ( var i = 0; i < regionsSetup.nRegions - 2; i++){
				regionsData.pathCeilings[i].onMouseDrag = function(event){
					var temp = regionsData.pathCeilings.indexOf(this);
					// prevent potential from being out of bounds
					var newYValue = regionsData.constraintY(event.point.clone().y);
					// change the height of potential
					regionsData.pathCeilings[temp].segments[0].point.y = newYValue;
					regionsData.pathCeilings[temp].segments[1].point.y = newYValue;
					// change the height of the potential's walls
					regionsData.pathLeftSide[temp].segments[0].point.y = newYValue;
					regionsData.pathRightSide[temp].segments[0].point.y = newYValue;
					regionsData.potentials[temp+1] = (layout.xAxisHeight - newYValue);
					this.selected = true;
					// recompute coefficients
					regionsData.setFunctionHandles();
					regionsData.setMatrix();
					regionsData.solveCoefs();
					regionsData.normalize();
					regionsData.plotWaves();


				};
				regionsData.pathCeilings[i].onMouseOn = function(event){
					this.selected = false;
				};
				regionsData.pathCeilings[i].onMouseLeave = function(event){
					this.selected = false;
				};

			}
			regionsData.pathEnergy.onMouseDrag = function(event){
				this.selected = true;
				// prevent the energy from being out of bounds
				var newEnergyPos = regionsData.constraintE(event.point.clone().y);
				regionsData.energy = (layout.xAxisHeight - newEnergyPos);
				// redraw the energy line
				regionsData.pathEnergy.segments[0].point.y = newEnergyPos;
				regionsData.pathEnergy.segments[1].point.y = newEnergyPos;
				// recompute everything
				regionsData.setFunctionHandles();
				regionsData.setMatrix();
				regionsData.solveCoefs();
				regionsData.normalize();
				regionsData.plotWaves();


			};
			regionsData.pathEnergy.onMouseOn = function(event){
				this.selected = false;
			};
			regionsData.pathEnergy.onMouseLeave = function(event){
				this.selected = false;
			};
		}
};


regionsSetup.randomSetup();
layout.createMainRect();
layout.createAxes();
regionsData.createData();
regionsData.createRegion();
layout.axes.sendToBack();
for (var i = 0; i < regionsSetup.nRegions - 1; i++){
	regionsData.pathWalls[i].bringToFront();
}
regionsData.bindMouseEvents();

regionsData.setFunctionHandles();
regionsData.setMatrix();
regionsData.solveCoefs();
regionsData.normalize();
regionsData.plotWaves();

