// The code for the chart is wrapped inside a function that
// automatically resizes the chart
function makeResponsive() {

  // if the SVG area isn't empty when the browser loads,
  // remove it and replace it with a resized version of the chart
  var svgArea = d3.select("body").select("svg");

  // clear svg is not empty
  if (!svgArea.empty()) {
    svgArea.remove();
  }

  // SVG wrapper dimensions are determined by the current width and
  // height of the browser window.
  var svgWidth = window.innerWidth;
  var svgHeight = window.innerHeight;

  var margin = {
    top: 20,
    right: 80,
    bottom: 80,
    left: 100
  };

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on x-axis label
function xScale(stateData) {
  //create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(stateData, d=> d[chosenXAxis]) * 0.9, d3.max(stateData, d=>d[chosenXAxis]) * 1.1])
    .range([0,width]);
  return xLinearScale;
}

// function used for updating xAxis var upon click on x axis label

function renderXAxes(newXScale,xAxis){
  var bottomAxis = d3.axisBottom(newXScale);
  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);
  return xAxis;
}

// function used for updating y-scale var upon click on y-axis label
function yScale(stateData) {
  //create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(stateData, d=> d[chosenYAxis]) * 0.9, d3.max(stateData, d=>d[chosenYAxis]) * 1.1])
    .range([height,0]);
  return yLinearScale;
}

// function used for updating yAxis var upon click on y axis label
function renderYAxes(newYScale,yAxis){
  var leftAxis = d3.axisLeft(newYScale);
  yAxis.transition()
    .duration(1000)
    .call(leftAxis);
  return yAxis;
}

//function used for updating circles group with a transition to new circles
function renderCircles(circlesGroup,newXScale, newYScale){
  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d=> newXScale(d[chosenXAxis]))
    .attr("cy", d=> newYScale(d[chosenYAxis]));
  
  return circlesGroup;
}
//function used for updating text within circles with a transition to new circles
function renderText(circlestextGroup,newXScale, newYScale){
  circlestextGroup.transition()
    .duration(1000)
    .attr("x", d=> newXScale(d[chosenXAxis]))
    .attr("y", d=> newYScale(d[chosenYAxis]));
  return circlestextGroup;
}

//function used for updating circles group with new tooltip

function updateToolTip(circlesGroup,circlestextGroup){
  var Xlabel; 
  var Ylabel;

  if (chosenXAxis === "poverty") {
    Xlabel = "Poverty";
  }
  else if (chosenXAxis == "age") {
    Xlabel = "Age";
  }
  else {
    Xlabel = "Income ($)";
  }

  if (chosenYAxis === "healthcare") {
    Ylabel = "Healthcare (%): ";
  }
  else if (chosenYAxis == "smokes") {
    Ylabel = "Smokers:";
  }
  else {
    Ylabel = "Obesity (%):";
  }

  var toolTip = d3.tip()
    .offset([80,-60])
    .attr("class","d3-tip")
    .html(function(d) {
      return (`${d.state}<hr>${Xlabel}: ${d[chosenXAxis]}<hr>${Ylabel}: ${d[chosenYAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup
    .on("mouseover",function(d){
      toolTip.show(d,this);
    })
    .on("mouseout",function(d){
      toolTip.hide(d);
    });

  circlestextGroup
    .on("mouseover",function(d){
      toolTip.show(d,this);
    })
    .on("mouseout",function(d){
      toolTip.hide(d);
    });

  return circlesGroup;
}

// Import Data
d3.csv("assets/data/data.csv").then(function(stateData,err) {
  if (err) throw err;
    // Step 1: Parse Data/Cast as numbers
    // ==============================
    stateData.forEach(function(data) {
      data.poverty = +data.poverty;
      data.healthcare = +data.healthcare;
      data.age = +data.age;
      data.income = +data.income;
      data.smokes = +data.smokes;
      data.obesity = +data.obesity;
    });

    console.log(stateData);
    // Step 2: Create scale functions, leave some extra space for min and max values of the data
    // ==============================
    var xLinearScale = xScale(stateData);
    var yLinearScale = yScale(stateData);
    // Step 3: Create axis functions
    // ==============================
    var xBottom = d3.axisBottom(xLinearScale);
    var yLeft = d3.axisLeft(yLinearScale);
    // Step 4: Append Axes to the chart
    // ==============================
    var xAxis = chartGroup.append("g")
      .attr("transform",`translate(0,${height})`)
      .call(xBottom);
    
    var yAxis=chartGroup.append("g")
      .call(yLeft);
    // Step 5: Create Circles
    // ==============================
    var circlesGroup = chartGroup.selectAll("circle")
      .data(stateData)
      .enter()
      .append("circle")
      .attr("cx",d => xLinearScale(d[chosenXAxis]))
      .attr("cy",d => yLinearScale(d[chosenYAxis]))
      .attr("r","15")
      .classed("stateCircle",true);

    var circlestextGroup = chartGroup.append("g").selectAll("text")
        .data(stateData)
        .enter()
        .append("text")
        .text(d => d.abbr)
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis]+5))
        .classed("stateText", true);

   // updateToolTip function upon csv import
    // ==============================
    var circlesGroup = updateToolTip(circlesGroup,circlestextGroup);
    // Create axes labels
    var xlabelsGroup = chartGroup.append("g")
      .attr("transform",`translate(${width/2},${height+20})`);
    
    var povertyLabel = xlabelsGroup.append("text")
    .attr("x",0)
    .attr("y",20)
    .attr("value","poverty")
    .attr("class", "aText")
    .classed("active",true)
    .text("in poverty (%)");

    var ageLabel = xlabelsGroup.append("text")
    .attr("x",0)
    .attr("y",40)
    .attr("value","age")
    .attr("class", "aText")
    .classed("inactive",true)
    .text("age (median)");

    var incomeLabel = xlabelsGroup.append("text")
    .attr("x",0)
    .attr("y",60)
    .attr("value","income")
    .attr("class", "aText")
    .classed("inactive",true)
    .text("household income (median)");


    var ylabelsGroup = chartGroup.append("g")
    .attr("transform", "rotate(-90)")
    
    var healthcareLabel = ylabelsGroup.append("text")
    .attr("y", 0 - margin.left + 40)
    .attr("x", 0 - (height / 2))
    .attr("value","healthcare")
    .attr("dy", "1em")
    .attr("class", "aText")
    .classed("active",true)
    .text("Lacks Healthcare (%)");

    var smokesLabel = ylabelsGroup.append("text")
    .attr("y", 0 - margin.left + 20)
    .attr("x", 0 - (height / 2))
    .attr("value","smokes")
    .attr("dy", "1em")
    .attr("class", "aText")
    .classed("inactive",true)
    .text("Smokers (%)");

    var obesityLabel = ylabelsGroup.append("g").append("text")
    .attr("y", 0 - margin.left )
    .attr("x", 0 - (height / 2))
    .attr("value","obesity")
    .attr("dy", "1em")
    .attr("class", "aText")
    .classed("inactive",true)
    .text("Obese (%)");
    
    // x axis labels even listener
    xlabelsGroup.selectAll("text")
      .on("click",function() {
        //get value of selectiion
        chosenXAxis = d3.select(this).attr("value");
        xLinearScale = xScale(stateData);
        xAxis = renderXAxes(xLinearScale,xAxis);

        if (chosenXAxis === "poverty"){
          povertyLabel.classed("active",true).classed("inactive",false);
          ageLabel.classed("inactive",true).classed("active",false);
          incomeLabel.classed("inactive",true).classed("active",false);
        }
        else if (chosenXAxis === "age"){
          povertyLabel.classed("inactive",true).classed("active",false);
          ageLabel.classed("active",true).classed("inactive",false);
          incomeLabel.classed("inactive",true).classed("active",false);
        }
        else {
          povertyLabel.classed("inactive",true).classed("active",false);
          ageLabel.classed("inactive",true).classed("active",false);
          incomeLabel.classed("active",true).classed("inactive",false);
        }

        circle = renderCircles(circlesGroup,xLinearScale,yLinearScale);
        circleText = renderText(circlestextGroup,xLinearScale,yLinearScale);
        circlesGroup = updateToolTip(circle,circleText);
      });

    // x axis labels even listener
    ylabelsGroup.selectAll("text")
      .on("click",function() {
        chosenYAxis = d3.select(this).attr("value");
        yLinearScale = yScale(stateData);
        yAxis = renderYAxes(yLinearScale,yAxis);

        if (chosenYAxis === "healthcare"){
          healthcareLabel.classed("active",true).classed("inactive",false);
          smokesLabel.classed("inactive",true).classed("active",false);
          obesityLabel.classed("inactive",true).classed("active",false);
        }
        else if (chosenYAxis === "smokes"){
          healthcareLabel.classed("inactive",true).classed("active",false);
          smokesLabel.classed("active",true).classed("inactive",false);
          obesityLabel.classed("inactive",true).classed("active",false);
        }
        else {
          healthcareLabel.classed("inactive",true).classed("active",false);
          smokesLabel.classed("inactive",true).classed("active",false);
          obesityLabel.classed("active",true).classed("inactive",false);
        }

        circle = renderCircles(circlesGroup,xLinearScale,yLinearScale);
        circleText = renderText(circlestextGroup,xLinearScale,yLinearScale);
        circlesGroup = updateToolTip(circle,circleText);

      }); 
  }).catch(function(error) {
    console.log(error);
  });

}


// When the browser loads, makeResponsive() is called.
makeResponsive();

// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);
