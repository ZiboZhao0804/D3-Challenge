var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 80,
  bottom: 60,
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

// Import Data
d3.csv("assets/data/data.csv").then(function(stateData) {

    // Step 1: Parse Data/Cast as numbers
    // ==============================
    stateData.forEach(function(data) {
      data.poverty = +data.poverty;
      data.healthcare = +data.healthcare;
    });
    console.log(stateData);
    // Step 2: Create scale functions, leave some extra space for min and max values of the data
    // ==============================
    var xScale = d3.scaleLinear()
      .domain([0.9 * d3.min(stateData, s => s.poverty),1.1 * d3.max(stateData,s => s.poverty)])
      .range([0,width]);
    var yScale = d3.scaleLinear()
      .domain([0.9 * d3.min(stateData, s => s.healthcare),1.1 * d3.max(stateData,s => s.healthcare)])
      .range([height,0]);
    // Step 3: Create axis functions
    // ==============================
    var xAxis = d3.axisBottom(xScale).ticks(8);
    var yAxis = d3.axisLeft(yScale).ticks(12);
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
      .attr("cx",d => xScale(d.poverty))
      .attr("cy",d => yScale(d.healthcare))
      .attr("r","15")
      .attr("opacity",".5")
      .classed("stateCircle",true);

    var circlesText = chartGroup.append("g").selectAll("text")
        .data(stateData)
        .enter()
        .append("text")
        .text(d => d.abbr)
        .attr("x", d => xScale(d.poverty))
        .attr("y", d => yScale(d.healthcare)+5)
        .classed("stateText", true);

    // Step 6: Initialize tool tip
    // ==============================
    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([8, -6])
        .html(function(d) {
          return (`<strong>${d.state}<strong><hr>${d.poverty}<strong><hr>${d.healthcare}
          number hits`);
        });
    // Step 7: Create tooltip in the chart
    // ==============================
    chartGroup.call(toolTip);
    // Step 8: Create event listeners to display and hide the tooltip
    // ==============================
    circlesGroup.on("mouseover", function(d) {
      toolTip.show(d, this);
    })
      .on("mouseout", function(d) {
        toolTip.hide(d);
      });
    // Create axes labels
    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 40)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("class", "aText")
      .text("in poverty (%)");

    chartGroup.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
      .attr("class", "aText")
      .text("Lacks Healthcare (%)");
  }).catch(function(error) {
    console.log(error);
  });
