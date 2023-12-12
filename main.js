// set the dimensions and margins of the graph
var width = 1000;
var height = 1000;

// append the svg object to the body of the page
var svg = d3.select("#circular_packing")
  .append("svg")
    .attr("width", width)
    .attr("height", height);


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

d3.csv("data.csv").then(function (data) {
  var types = [...new Set(data.flatMap(d => [d.type1, d.type2].filter(t => t !== '' && t !== undefined)))];

  // Create an array of unique generations (1-7)
  var generations = Array.from({ length: 7 }, (_, i) => i + 1);
  console.log(generations);

  // Create a new array with type, generation, and number of Pokemon
  var result = [];

  types.forEach(type => {
    generations.forEach(gen => {
      var count = data.filter(d => (d.type1 === type || d.type2 === type) && +d.generation === gen).length;
      console.log(count);
      result.push({ type: type, generation: gen, number: count });
    });
  });

  console.log(result);

  // Extracting type names for the color scale domain
  var typeNames = [...new Set(result.map(d => d.type))];

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
    .domain([0, d3.max(result, function (d) { return d.number; })])
    .range([7, 55]); // circle will be between 7 and 55 px wide

  // Initialize the circle: all located at the center of the svg area
  var node = svg.append("g")
    .selectAll("circle")
    .data(result)
    .enter()
    .append("circle")
    .attr("class", "node")
    .attr("r", function (d) { return size(d.number); })
    .attr("cx", width / 2)
    .attr("cy", height / 2)
    .style("fill", "transparent") // Set the initial fill to transparent
    .style("fill-opacity", 0.8)
    .attr("stroke", "black")
    .style("stroke-width", 1)
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave);

    node.on("click", function (event, clickedNode) {
      // Check if the clicked node's type is already highlighted
      var isHighlighted = clickedNode.isHighlighted || false;

      if (!isHighlighted) {
        node.style("fill-opacity", 0.3);
        // Increase the opacity of nodes with the same type as the clicked node
        node.filter(d => d.type === clickedNode.type)
          .style("fill-opacity", 1);
    
        // Mark the clicked node as highlighted
        clickedNode.isHighlighted = true;
      } else {
        // Unmark the clicked node
        node.style("fill-opacity", 0.8);
        clickedNode.isHighlighted = false;
      }
    });

  // Append patterns for each image
  var patterns = svg.append("defs")
    .selectAll("pattern")
    .data(result)
    .enter()
    .append("pattern")
    .attr("id", function (d, i) { return "pattern-" + i; })
    .attr("width", 1)
    .attr("height", 1)
    .attr("patternContentUnits", "objectBoundingBox")
    .append("image")
    .attr("href", function (d) {
      // Specify the path to the image file based on the type (d.type)
      return "png/" + d.type + ".png";
    })
    .attr("width", 1)
    .attr("height", 1);

  // Update the circles' fill attribute when patterns are loaded
  patterns.on("load", function () {
    node.style("fill", function (d, i) { return "url(#pattern-" + i + ")"; });
  });

  // Features of the forces applied to the nodes:
  var simulation = d3.forceSimulation()
    .force("center", d3.forceCenter().x(width / 2).y(height / 2)) // Attraction to the center of the svg area
    .force("charge", d3.forceManyBody().strength(.1)) // Nodes are attracted to each other if the value is > 0
    .force("collide", d3.forceCollide().strength(.2).radius(function (d) { return (size(d.number) + 3); }).iterations(1)); // Force that avoids circle overlapping

  // Apply these forces to the nodes and update their positions.
  // Once the force algorithm is happy with positions ('alpha' value is low enough), simulations will stop.
  simulation
    .nodes(result)
    .on("tick", function (d) {
      node
        .attr("cx", function (d) { return d.x; })
        .attr("cy", function (d) { return d.y; });
    });

  // Define the drag behaviors
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart(); // Increase the alpha target for better responsiveness
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null; // Remove the fixed position on drag end
    d.fy = null;
  }

  // Apply the drag behaviors to the nodes
  node.call(d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended));

  // Three functions that change the tooltip when user hover / move / leave a cell
  function mouseover(event, d) {
    Tooltip
      .style("opacity", 1);
  }

  function mousemove(event, d) {
    var tooltipOffsetX = 20;
    var tooltipOffsetY = 10;

    Tooltip
      .html('<u>' + d.type + ' Gen ' + d.generation + '</u>' + "<br>" + d.number + " Pokemon")
      .style("left", (event.pageX + tooltipOffsetX) + "px")
      .style("top", (event.pageY - tooltipOffsetY) + "px");
  }

  function mouseleave(event, d) {
    Tooltip
      .style("opacity", 0);
  }
});

// append the svg object to the body of the page
var radarsvg = d3.select("#radar")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

d3.csv("data.csv").then(function (data) {

    console.log(data);

    let radatData = [];
    data.forEach(function(d) {
        radatData.push({
            name: d.name,
            hp: +d.hp,
            attack: +d.attack,
            defense: +d.defense,
            sp_attack: +d.sp_attack,
            sp_defense: +d.sp_defense,
            speed: +d.speed,
            total: +d.hp + +d.attack + +d.defense + +d.sp_attack + +d.sp_defense + +d.speed
        });
    });
    console.log(radatData);

    let radialScale = d3.scaleLinear()
        .domain([0,100])
        .range([0,150]);//size of the circle

    let ticks = [30,60,90,120,150];

    var radarG = radarsvg.append("g")
              .selectAll("circle")
              .data(ticks)
              .enter()
              .append("circle")
                .attr("cx", width / 2)
                .attr("cy", height / 2)
                .attr("fill", "none")
                .attr("stroke", "gray")
                .attr("r", function(d){ return radialScale(d); });

    radarsvg.selectAll(".ticklabel")
        .data(ticks)
        .enter()
        .append("text")
        .attr("class", "ticklabel")
        .attr("x", width / 2 + 5)
        .attr("y", function(d) {
            return height / 2 - radialScale(d) - 5; // Adjust the position for proper alignment
        })
        .style("font-size", "15px") // S
        .text(function(d) {
            return d.toString();
        });

    function angleToCoordinate(angle, value){
      let x = Math.cos(angle) * radialScale(value);
      let y = Math.sin(angle) * radialScale(value);
      return {"x": width / 2 + x, "y": height / 2 - y};
    }

    // Assuming your six attributes are in this order: ["hp", "attack", "defense", "sp_attack", "sp_defense", "speed"]
    let attributeOrder = ["hp", "attack", "defense", "sp_attack", "sp_defense", "speed"];

    // Modify the featureData mapping to use the attributeOrder
    let featureData = attributeOrder.map((attribute, i) => {
        let angle = (Math.PI / 2) + (2 * Math.PI * i / attributeOrder.length);
        return {
            "name": attribute,
            "angle": angle,
            "line_coord": angleToCoordinate(angle, 150),
            "label_coord": angleToCoordinate(angle, 170)
        };
    });

    console.log(featureData);

  // Rest of your code remains the same
  // draw axis line
  radarsvg.selectAll("line")
      .data(featureData)
      .enter().append("line")
      .attr("x1", width / 2)
      .attr("y1", height / 2)
      .attr("x2", d => d.line_coord.x)
      .attr("y2", d => d.line_coord.y)
      .attr("stroke","black");

  // draw axis label
  radarsvg.selectAll(".axislabel")
      .data(featureData)
      .enter()
      .append("text")
      .attr("x", d => d.label_coord.x)
      .attr("y", d => d.label_coord.y)
      .text(d => d.name);
  // Define the maximum value for your data (you can adjust this based on your data)
let maxValue = 150;

// Create a scale for mapping data values to the radial positions
let dataScale = d3.scaleLinear()
    .domain([0, maxValue])
    .range([0, radialScale(maxValue)]);

// Create a function to convert data values to coordinates on the radar chart
function dataToCoordinates(data) {
    return featureData.map((attribute) => {
        let angle = attribute.angle;
        // let radius = dataScale(data[attribute.name]);
        let radius = data[attribute.name]
        return angleToCoordinate(angle, radius);
    });
}

// Assuming you have a data point like this (replace it with your actual data structure)
let dataPoint = {
    name: "Bulbasaur", // Replace with the name of the Pokemon
    hp: 30, // Replace with the actual HP value
    attack: 49, // Replace with the actual Attack value
    defense: 49, // Replace with the actual Defense value
    sp_attack: 65, // Replace with the actual Special Attack value
    sp_defense: 65, // Replace with the actual Special Defense value
    speed: 45 // Replace with the actual Speed value
};

// Convert the data point to coordinates
let dataCoordinates = dataToCoordinates(dataPoint);

// Draw the radar chart using the dataCoordinates
radarsvg.append("polygon")
    .attr("points", dataCoordinates.map((coord) => coord.x + "," + coord.y).join(" "))
    .attr("stroke", "blue") // Adjust the stroke color
    .attr("fill", "rgba(0, 0, 255, 0.5)") // Adjust the fill color
    .attr("opacity", 0.8); // Adjust the opacity



});