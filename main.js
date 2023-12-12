// set the dimensions and margins of the graph
var width = 1000;
var height = 1000;

// append the svg object to the body of the page
var svg = d3.select("#circular_packing")
  .append("svg")
    .attr("width", width)
    .attr("height", height);

var typeNames = [];

// Read data
d3.csv("Chat.csv", function(data) {

  // Process the data
  data.forEach(function(d) {
    d.value = +d.number; // Convert 'number' to a numerical value
    d.key = d.name + " Gen " + d.generation; // Create a key that combines name and generation
  });

  // Extracting type names for the color scale domain
  typeNames = [...new Set(data.map(d => d.name))];

  
  console.log(typeNames);
 
  var customColors = ['#4e79a7', '#f28e2c', '#e15759', '#76b7b2', '#edc948', '#b07aa1',
                    '#393b79', '#ff9da7', '#9c755f', '#bab0ac', '#a6761d', '#1f78b4',
                    '#2ca02c', '#9467bd', '#d62728', '#7fc97f', '#beaed4', '#59a14f',
                    '#cfa0cd', '#66c2a5'];

  var color = d3.scaleOrdinal()
      .domain(typeNames)
      .range(customColors);

  // Size scale for bubbles
  var size = d3.scaleLinear()
    .domain([0, d3.max(data, function(d) { return d.value; })])
    .range([7, 55]); // circle will be between 7 and 55 px wide

  var Tooltip = d3.select("body")
  .append("div")
  .style("opacity", 0)
  .attr("class", "tooltip")
  .style("position", "absolute")
  .style("background-color", "white")
  .style("border", "solid")
  .style("border-width", "2px")
  .style("border-radius", "5px")
  .style("padding", "5px");

  // Three functions that change the tooltip when user hover / move / leave a cell
  var mouseover = function(d) {
    Tooltip
      .style("opacity", 1);
  };

    var mousemove = function(d) {
    var tooltipOffsetX = 20;
    var tooltipOffsetY = 10;

    Tooltip
      .html('<u>' + d.key + '</u>' + "<br>" + d.value + " inhabitants")
      .style("left", (d3.event.pageX + tooltipOffsetX) + "px")
      .style("top", (d3.event.pageY - tooltipOffsetY) + "px");
  };

  var mouseleave = function(d) {
    Tooltip
      .style("opacity", 0);
  };
  

// Initialize the circle: all located at the center of the svg area
var node = svg.append("g")
  .selectAll("circle")
  .data(data)
  .enter()
  .append("circle")
    .attr("class", "node")
    .attr("r", function(d){ return size(d.value); })
    .attr("cx", width / 2)
    .attr("cy", height / 2)
    .style("fill", "transparent") // Set the initial fill to transparent
    .style("fill-opacity", 0.8)
    .attr("stroke", "black")
    .style("stroke-width", 1)
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave);

// Append patterns for each image
var patterns = svg.append("defs")
  .selectAll("pattern")
  .data(data)
  .enter()
  .append("pattern")
    .attr("id", function(d, i) { return "pattern-" + i; })
    .attr("width", 1)
    .attr("height", 1)
    .attr("patternContentUnits", "objectBoundingBox")
  .append("image")
    .attr("xlink:href", function(d) {
      // Specify the path to the image file based on the type (d.name)
      return "png/" + d.name + ".png";
    })
    .attr("width", 1)
    .attr("height", 1);

// Update the circles' fill attribute when patterns are loaded
patterns.on("load", function() {
  node.style("fill", function(d, i){ return "url(#pattern-" + i + ")"; });
});


  // Features of the forces applied to the nodes:
  var simulation = d3.forceSimulation()
      .force("center", d3.forceCenter().x(width / 2).y(height / 2)) // Attraction to the center of the svg area
      .force("charge", d3.forceManyBody().strength(.1)) // Nodes are attracted to each other if the value is > 0
      .force("collide", d3.forceCollide().strength(.2).radius(function(d){ return (size(d.value)+3); }).iterations(1)); // Force that avoids circle overlapping

  // Apply these forces to the nodes and update their positions.
  // Once the force algorithm is happy with positions ('alpha' value is low enough), simulations will stop.
  simulation
      .nodes(data)
      .on("tick", function(d){
        node
            .attr("cx", function(d){ return d.x; })
            .attr("cy", function(d){ return d.y; });
      });

  // Define the drag behaviors
function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart(); // Increase the alpha target for better responsiveness
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null; // Remove the fixed position on drag end
    d.fy = null;
}

// Apply the drag behaviors to the nodes
node.call(d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended));
});
