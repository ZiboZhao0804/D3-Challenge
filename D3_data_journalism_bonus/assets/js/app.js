var svgWidth = 960;
var svgHeight = 500;

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
  xAxis.transition().duration(1000).call(bottomAxis);
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
  yAxis.transition().duration(1000).call(leftAxis);
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

function updateToolTip(circlesGroup){
  var Xlabel; 
  var Ylabel;

  if (chosenXAxis === "poverty") {
    Xlabel = "poverty";
  }
  else if (chosenXAxis == "age") {
    Xlabel = "age";
  }
  else {
    Xlabel = "income";
  }

  if (chosenYAxis === "healthcare") {
    Ylabel = "healthcare";
  }
  else if (chosenYAxis == "smokes") {
    Ylabel = "smokes";
  }
  else {
    Ylabel = "obesity";
  }

  var toolTip = d3.tip()
    .attr("class","d3-tip")
    .offset([80,-60])
    .html(function(d) {
      return (`${d.state}<hr>${Xlabel}: ${d[chosenXAxis]}<hr>${Ylabel}: ${d[chosenYAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover",function(d){
    toolTip.show(d);
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
    var xAxis = d3.axisBottom(xLinearScale).ticks(8);
    var yAxis = d3.axisLeft(yLinearScale).ticks(12);
    // Step 4: Append Axes to the chart
    // ==============================
    chartGroup.append("g")
      .attr("transform",`translate(0,${height})`)
      .call(xAxis);
    
    chartGroup.append("g")
      .call(yAxis);
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

    var circlesText = chartGroup.selectAll("text")
        .data(stateData)
        .enter()
        .append("text")
        .text(d => d.abbr)
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis]+5))
        .classed("stateText", true);

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

    var obesityLabel = ylabelsGroup.append("text")
    .attr("y", 0 - margin.left )
    .attr("x", 0 - (height / 2))
    .attr("value","obesity")
    .attr("dy", "1em")
    .attr("class", "aText")
    .classed("inactive",true)
    .text("Obese (%)");


    // updateToolTip function upon csv import
    // ==============================
    var circlesGroup = updateToolTip(circlesGroup);
    
    // x axis labels even listener
    xlabelsGroup.selectAll("text")
      .on("click",function() {
        //get value of selectiion
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis){
          //replace chosenXAxis with value
          chosenXAxis = value;
          xLinearScale = xScale(stateData);
          xAxis = renderXAxes(xLinearScale,xAxis);
          circlesGroup = renderCircles(circlesGroup,xLinearScale,yLinearScale);
          circlesGroup = updateToolTip(circlesGroup);

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
        }

        if (value !== chosenYAxis){
          //replace chosenYAxis with value
          chosenYAxis = value;
          yLinearScale = yScale(stateData);
          yAxis = renderYAxes(yLinearScale,yAxis);
          circlesGroup = renderCircles(circlesGroup,xLinearScale,yLinearScale);
          circlesGroup = updateToolTip(circlesGroup);

          if (chosenYAxis === "healthcare"){
            healthcareLabel.classed("active",true).classed("inactive",false);
            smokesLabel.classed("inactive",true).classed("active",false);
            obesityLabel.classed("inactive",true).classed("active",false);
          }
          else if (chosenXAxis === "smokes"){
            healthcareLabel.classed("inactive",true).classed("active",false);
            smokesLabel.classed("active",true).classed("inactive",false);
            obesityLabel.classed("inactive",true).classed("active",false);
          }
          else {
            healthcareLabel.classed("inactive",true).classed("active",false);
            smokesLabel.classed("inactive",true).classed("active",false);
            obesityLabel.classed("active",true).classed("inactive",false);
          }
        }
      })
    
  }).catch(function(error) {
    console.log(error);
  });
