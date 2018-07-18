//Define physical space of chart
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 100,
  right: 50,
  bottom: 50,
  left: 100
},
chartWidth = svgWidth - margin.left - margin.right,
chartHeight = svgHeight - margin.top - margin.bottom;

//ADD THE GRAPH CANVAS TO THE BODY OF THE WEBPAGE
// Create an SVG (Scalable Vector Graphics) wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
//chart references the id in index.html
//gives this a width and height based on our specified values
var svg = d3.select(".chart").append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

svg.append("text")
  .attr("x", (chartWidth / 2) + 100)             
  .attr("y", 30)
  .attr("text-anchor", "middle")  
  .style("font-size", "25px") 
  .text("Relationship Between State Poverty and Teeth Removal in 2014");

// Append an SVG group
//Note: Transformations applied to the <g> element 
//are performed on all of its child elements, and 
//any of its attributes are inherited by its child 
//elements. It can also group multiple elements to 
//be referenced later with the <use> element.
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

//Import data
d3.csv("data.csv", function(error, teethData) {
  if (error) throw error;

  // Step 1: Parse Data/Cast as numbers
  // ==============================
  teethData.forEach(function(data) {
    data.povertyPCT = +data.povertyPCT;
    data.teethRemovedPCT = +data.teethRemovedPCT;
  });

  // Step 2: Create scale functions (with padding of 0.1 = 10%)
  // ==============================
  var xLinearScale = d3.scaleLinear()
    .domain([6,d3.max(teethData,d => d.povertyPCT)])
    .range([0, chartWidth]);
    // .padding(0.1)

  // Create a linear scale for the vertical axis.
  var yLinearScale = d3.scaleLinear()
    .domain([25, d3.max(teethData, d => d.teethRemovedPCT)])
    .range([chartHeight, 0]);

  // Step 3: Create axis functions
  // ==============================
  // Create two new functions passing our scales in as arguments
  // These will be used to create the chart's axes
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale).ticks(10);

  // Step 4: Append Axes to the chart
  // ==============================
  // Append two SVG group elements to the chartGroup area,
  // and create the bottom and left axes inside of them
  chartGroup.append("g")
    .call(leftAxis);

  chartGroup.append("g")
    .attr("transform", `translate(0, ${chartHeight})`)
    .call(bottomAxis);

  // Step 4.5: Append State Labels
  chartGroup.append("text")
    .style("text-anchor", "middle")
    .style("font-size", "12px")
    .selectAll("tspan")
    .data(teethData)
    .enter()
    .append("tspan")
      .attr("x", function(data) {
        return xLinearScale(data.povertyPCT - 0);
      })
      .attr("y", function(data) {
        return yLinearScale(data.teethRemovedPCT - 0.2);
      })
      .text(function(data) {
        return data.abbr
      });

  // Step 5: Create Circles
  // ==============================
  //Note: This is a "virtual selection" because the circle element does not yet exist
  var circlesGroup = chartGroup.selectAll("circle")
  .data(teethData)
  .enter()
  .append("circle")
  .attr("cx", d => xLinearScale(d.povertyPCT))
  .attr("cy", d => yLinearScale(d.teethRemovedPCT))
  .attr("r", "15")
  .attr("fill", "blue")
  .attr("opacity", ".5");

  // Step 6: Initialize tool tip
  // ==============================
  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}
      <br>Removed Tooth: ${d.teethRemovedPCT}%
      <br>Poverty: ${d.povertyPCT}%`);
    });

  // Step 7: Create tooltip in the chart
  // ==============================
  chartGroup.call(toolTip);

  // Step 8: Create event listeners to display and hide the tooltip
  // ==============================
  circlesGroup.on("click", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
  });

  // Create axes labels
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left + 50)
    .attr("x", 0 - chartHeight / 2 -60)
    .attr("dy", "1em")
    .attr("class", "axisText")
    .text("Removed a Tooth (%)");

  chartGroup.append("text")
    .attr("transform", `translate(${chartWidth / 2 - 35}, ${chartHeight + margin.bottom*3/4})`)
    .attr("class", "axisText")
    .text("Poverty Level (%)");
});