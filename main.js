// function disableScroll() {
//   document.body.style.overflow = 'hidden';
// }

// document.addEventListener('DOMContentLoaded', function () {
//   disableScroll();
// });

function scrollToView(targetId) {
  console.log("hi");
  var targetDiv = document.getElementById(targetId);

  if (targetDiv) {
      targetDiv.style.display = 'block';

      targetDiv.scrollIntoView({
          behavior: 'smooth'
      });

      document.body.classList.add('lock-scroll');

  }
}

/* --------------------------------------------------------------------------------------------------------*/
/* --------------------------------------------Circular packing--------------------------------------------*/
/* --------------------------------------------------------------------------------------------------------*/

// set the dimensions and margins of the graph
var width = 1000;
var height = 1000;

// append the svg object to the body of the page
var svg = d3.select("#circular_packing")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .style("position", "relative")  
  .style("top", "50px")           
  .style("left", "500px");       

var Tooltip = d3.select("body")
  .append("div")
  .style("opacity", 0)
  .attr("class", "tooltip")
  .style("position", "absolute")
  .style("z-index", "10")
  .style("background-color", "white")
  .style("border", "solid")
  .style("border-width", "2px")
  .style("border-radius", "5px")
  .style("padding", "5px")
  .style("pointer-events", "none");


d3.csv("data.csv").then(function (data) {
  var generations = [1, 2, 3, 4, 5, 6, 7];
  var generationSelection = svg.append("g")
    .attr("id", "generation-selection")
    .attr("transform", "translate(150,0)");

  var color = d3.scaleOrdinal(d3.schemeCategory10);
  
  var boxWidth = 100;
  var boxHeight = 40;

  var generationBoxes = generationSelection.selectAll(".generation-box")
    .data(generations)
    .enter()
    .append("g")
    .attr("class", "generation-box-group")
    .attr("id", function (d, i) { return i + 1; }) // Set the id of each box to the generation number
    .attr("transform", function (d, i) { return "translate(" + i * boxWidth + ", 0)"; });

  generationBoxes.append("rect")
    .attr("class", "generation-box")
    .attr("width", boxWidth)
    .attr("height", boxHeight)
    .style("fill", d => color(d))
    .style("stroke", "black")
    .style("opacity", 0.5); // Set the initial opacity

  generationBoxes.append("text")
    .attr("class", "generation-text")
    .attr("x", boxWidth / 2)
    .attr("y", boxHeight / 2)
    .attr("dy", "0.35em")
    .style("text-anchor", "middle")
    .style("alignment-baseline", "middle")
    .style("font-family", "'Pokemon GB' ,'sans-serif'")
    .text(function (d) { return d; }); // Display the generation number

  generationBoxes.on("click", function (event, d) {
    var genBox = d3.select(this); 
    var isSelected = genBox.classed("selected");

    generationBoxes.selectAll(".generation-box").style("opacity", 0.5);

    if (!isSelected) {
      genBox.selectAll(".generation-box").style("opacity", 1);

      var genNumber = genBox.attr("id");
      node.style("fill-opacity", function (nodeData) {
        return nodeData.generation === +genNumber ? 1 : 0.3;
      });

      generationBoxes.classed("selected", false);
      genBox.classed("selected", true);

      filterScatter(genNumber);
      console.log(genNumber);
    } else {
      // Reset settings
      node.style("fill-opacity", 0.8);
      generationBoxes.classed("selected", false);
    }
  });

  
  var types = [...new Set(data.flatMap(d => [d.type1, d.type2].filter(t => t !== '' && t !== undefined)))];

  // Create an array of unique generations (1-7)
  var generations = Array.from({ length: 7 }, (_, i) => i + 1);
  //console.log(generations);

  // Create a new array with type, generation, and number of Pokemon
  var result = [];

  types.forEach(type => {
    generations.forEach(gen => {
      var count = data.filter(d => (d.type1 === type || d.type2 === type) && +d.generation === gen).length;
      //console.log(count);
      result.push({ type: type, generation: gen, number: count });
    });
  });

  //console.log(result);

  // Extracting type names for the color scale domain
  var typeNames = [...new Set(result.map(d => d.type))];

  //console.log(typeNames);

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
    // .force("attractToCenter", attractToCenter); // Add the custom force


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

/* --------------------------------------------------------------------------------------------------------*/
/* --------------------------------------------Scatter plot------------------------------------------------*/
/* --------------------------------------------------------------------------------------------------------*/

var margin = { top: 10, right: 10, bottom: 30, left: 30 };
    scatterWidth = 1200 - margin.left - margin.right;
    scatterHeight = 1000 - margin.top - margin.bottom;

var scattersvg = d3.select("#scatter")
  .append("svg")
  .attr("width", scatterWidth + margin.left + margin.right)
  .attr("height", scatterHeight + margin.top + margin.bottom)
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var scatterG =  scattersvg.append("g")
  .attr("width", scatterWidth - 200 )
  .attr("height", scatterHeight);


function filterScatter( generation ) {

  d3.csv("All_Pokemon.csv").then(function (data) {
    var scatterData = data
        .filter(function(d) {
            return +d.Generation === +generation;
        })
        .map(function(d) {
            return {
                weight: +d.Weight,
                height: +d.Height,
                type1: d.Type1.toLowerCase(),
                name: d.Name,
                number: d.Number,
                bmi: d.BMI
            };
        });
      
        console.log(scatterData);
    draw_scatter(scatterData);

  });
}

function draw_scatter(data) {
  scatterG.selectAll("*").remove();

  var typeColorMap = {};
  var color = d3.scaleOrdinal(d3.schemeCategory10);

  data.forEach(function (d) {
    typeColorMap[d["type1"]] = color(d["type1"]);
  });

  // Scale and axis setup
  var x = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.weight)])
    .range([0, scatterWidth - 200 ]);

  var xaxis = scatterG.append("g")
    .attr("transform", "translate(20," + (scatterHeight - 50) + ")")
    .call(d3.axisBottom(x));

  var y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.height)])
    .range([scatterHeight - 50 , 0]);

  var yaxis = scatterG.append("g")
    .attr("transform", "translate(20,0)")
    .call(d3.axisLeft(y));

  // Add legend
  var label_data = Array.from(new Set(data.map(d => d.type1)));
  var legend = scattersvg.selectAll(".legend")
    .data(label_data) 
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });

  // Add legend text
  legend.append("text")
    .attr("x", scatterWidth - margin.right - 44)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .text(d => d);

  // Draw legend color blocks
  var legendBox = legend.append("rect")
    .attr("x", scatterWidth + margin.right - 38)
    .attr("width", 18)
    .attr("height", 18)

  console.log(label_data)
  // Image patterns for legend
  var patterns = scattersvg.append("defs")
    .selectAll("pattern")
    .data(label_data)
    .enter()
    .append("pattern")
    .attr("id", function (d, i) { return "pattern-" + i; })
    .attr("width", 1)
    .attr("height", 1)
    .attr("patternContentUnits", "objectBoundingBox")
    .append("image")
    .attr("href", function (d) {
      // Specify the path to the image file based on the type (d.type)
      return "png/" + d + ".png";
    })
    .attr("width", 1)
    .attr("height", 1);

  console.log(patterns);  

  patterns.on("load", function () {
    legendBox.style("fill", function (d, i) { return "url(#pattern-" + i + ")"; });
    });

  // Add brushing and zooming(Added before tooltip to prevent tooltip from being covered)
  var brush = d3.brush()
    .extent([[20,0], [scatterWidth - 200 + 20 , scatterHeight - 50]])
    .on("end", updateChart);
  

  scatterG.append("g")
    .attr("class", "brush")
    .call(brush);

  // Draw points
  var dots = scatterG.selectAll(".dot")
    .data(data)
    .enter().append("circle")
    .attr("class", "dot")
    .attr("r", 5)
    .attr("cx", d => x(d.weight) + 20 )
    .attr("cy", d => y(d.height) )
    .attr("name", d => d.Number)
    .style("fill", d => typeColorMap[d["type1"]])
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave);

  var idleTimeout;
  function idled() {
     idleTimeout = null;
  }

  function updateChart( event ) {
    var extent = event.selection;

    // If no selection, back to the initial coordinate. Otherwise, update X axis domain
    if (!extent) {
      if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows waiting a little bit
        x.domain([0, d3.max(data, d => d.weight)]); // Adjust this domain based on your data
        y.domain([0, d3.max(data, d => d.height)]); // Adjust this domain based on your data
            // Update axis and circle position
        xaxis.transition().duration(1000).call(d3.axisBottom(x));
        yaxis.transition().duration(1000).call(d3.axisLeft(y));
        scatterG.selectAll(".dot")
          .transition().duration(1000)
          .attr("cx", function (d) { return x(d.weight)  + 20; })
          .attr("cy", function (d) { return y(d.height) ; });
    } else {
      x.domain([x.invert(extent[0][0]), x.invert(extent[1][0])]);
      y.domain([y.invert(extent[1][1]), y.invert(extent[0][1])]);
      scatterG.select(".brush").call(brush.move, null); // This removes the grey brush area as soon as the selection has been done
      // Update axis and circle position
      xaxis.transition().duration(1000).call(d3.axisBottom(x));
      yaxis.transition().duration(1000).call(d3.axisLeft(y));
      scatterG.selectAll(".dot")
        .transition().duration(1000)
        .attr("cx", function (d) { return x(d.weight) +  200; })
        .attr("cy", function (d) { return y(d.height) ; });
    }
  }

  function mouseover(event, d) {
    Tooltip
      .style("opacity", 1);
  }

  function mousemove(event, d) {
    var tooltipOffsetX = 20;
    var tooltipOffsetY = 10;
    Tooltip
      .html(d.name + '<br>' +  " Weight: " + d.weight + "kg" +  ' Height: ' + d.height + "m" + '<br>' + " BMI: " + d.bmi)
      .style("left", (event.pageX + tooltipOffsetX) + "px")
      .style("top", (event.pageY - tooltipOffsetY) + "px");
  }

  function mouseleave(event, d) {
    Tooltip
      .style("opacity", 0);
  }
}


/* --------------------------------------------------------------------------------------------------------*/
/* --------------------------------------------Stackbar plot------------------------------------------------*/
/* --------------------------------------------------------------------------------------------------------*/


//stackbarchart
var svg_stackbar = d3.select("#stackbar")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("position", "relative")            
    .style("left", "350px");       
  d3.csv("All_Pokemon.csv").then(function(data) {
    // Filter and map the CSV data to the desired format
    var pokemonData = data
        .filter(function(d) {
            return d.Generation == 1 && (d.Type1 == "Poison" || d.Type2 == "Poison");
        })
        .map(function(d) {
            return {
                index:d.Number, 
                name: d.Name,
                hp: +d.HP,
                attack: +d.Att,
                defense: +d.Def,
                sp_attack: +d.Spa,
                sp_defense: +d.Spd,
                speed: +d.Spe
            };
        });
  
    // Now pokemonData is in the desired format
    draw_stackbar(pokemonData,pokemonData);
});

var clickedKey="null";
// Set up chart dimensions
function draw_stackbar(pokemonData,pokemonData_reserve)
{
  svg_stackbar.selectAll("*").remove();
  let rects = svg_stackbar.selectAll('bar_rect')
// Set up scales and axes
var x = d3.scaleBand()
    .domain(pokemonData.map(function (d) { return d.name; }))
    .range([0, 750])  // 修改范围
    .padding(0.5);

var y = d3.scaleLinear()
    .domain([0, d3.max(pokemonData, function (d) { return d.hp + d.attack + d.defense + d.sp_attack + d.sp_defense + d.speed; })])
    .range([height/2, 0]);
    

var color = d3.scaleOrdinal(d3.schemeCategory10);

// Stack the data
var stack = d3.stack()
    .keys(["hp", "attack", "defense", "sp_attack", "sp_defense", "speed"])
    .order(d3.stackOrderNone)
    .offset(d3.stackOffsetNone);

var stackedData = stack(pokemonData);

// 创建颜色比例尺，将每个属性映射到一个颜色
var colorScale = d3.scaleOrdinal()
    .domain(["hp", "attack", "defense", "sp_attack", "sp_defense", "speed"])
    .range(['#8CC084', '#D9C277', '#BD9C46', '#7EA2A8', '#2E4D9B', '#7E587E']);

var color = function(d) { return colorScale(d.key); };
// Draw the bars
var barchart = svg_stackbar.selectAll("g")
    .data(stackedData)
    .enter().append("g")
    .attr("fill", color)
    .selectAll("bar_rect")
    .data(function (d) { return d; })
    .enter().append("rect")
    .attr("class", "bar_rect")
    .attr("x", function (d) { return x(d.data.name); })
    .attr("width", x.bandwidth())
    .attr("transform", "translate(50,100)")
    .attr("height", 0)
    .attr("y", function (d) { return y(d[0]); })
    .on("mouseover", function (event, d) {
        Tooltip.transition()
            .duration(200)
            .style("opacity", .9);
        Tooltip.html("Name: " + d.data.name+
        "<div><img src='images/" +d.data.name.toLowerCase() + ".png' alt='Description'></div>")
            .style("left", (event.pageX) + "px")
            .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseleave", function (d) {
        Tooltip.transition()
            .duration(500)
            .style("opacity", 0);
    })
    .transition()
    .duration(1000)
    .attr("height", function (d) { return y(d[0]) - y(d[1]); })
    .attr("y", function (d) { return y(d[1]); });

// Add axes
var xAxis = d3.axisBottom(x)
        .tickFormat(function(d) {
            return "#"+pokemonData.find(function(pokemon) { return pokemon.name === d; }).index;
        });
// 平移整个图表
svg_stackbar.attr("transform", "translate(100, 300)");

// 添加 x 轴
svg_stackbar.append("g")
    .attr("transform", "translate(" +50 + "," + (height / 2 + 100) + ")")  // 平移 x 轴
    .call(xAxis);


svg_stackbar.append("g")
    .call(d3.axisLeft(y))
    .attr("transform", "translate(50,100)");
// 创建图例
var legend = svg_stackbar.append("g")
.attr("transform", "translate(" + (width - 100) + "," + 20 + ")"); 
colorScale.domain().forEach(function (key, i) {
  var legendItem = legend.append("g")
  .attr("transform", "translate(0," + (i * 20) + ")")
  .on("click", function (event, d, i) {
      //console.log("点击的属性是：" + clickedKey);
      if(clickedKey==key)
      {
        clickedKey="null";
      }
      else
      {
        clickedKey = key; // 获取被点击的属性名称
      } 
      //console.log("点击的属性是：" + clickedKey);
      // 将 PokemonData 中除了被点击的属性之外的其他属性的值设为0
      draw_new_barchart(pokemonData,pokemonData_reserve)
      
  });


legendItem.append("rect")
    .attr("width", 18)
    .attr("height", 18)
    .attr("fill", colorScale(key));

legendItem.append("text")
    .attr("x", 25)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "start")
    .text(key);
});
}

function draw_new_barchart(pokemonData,pokemonData_reserve)
{     
    var filterData = pokemonData_reserve.map(function (pokemon) {
    var filteredPokemon = {
        name: pokemon.name,
        index: pokemon.index,
    };

    // 设置被点击的属性值
    filteredPokemon[clickedKey] = pokemon[clickedKey];

    // 将其他五个属性的值设置为0
    ["hp", "attack", "defense", "sp_attack", "sp_defense", "speed"].forEach(function (key) {
        if (key !== clickedKey) {
            filteredPokemon[key] = 0;
        }
    });

    return filteredPokemon;
    });
    if(clickedKey=="null")
    {
      //console.log("1");
      draw_stackbar(pokemonData_reserve,pokemonData_reserve);
    }
    else
    {
      //console.log("2");
      draw_stackbar(filterData,pokemonData_reserve);
    }
      
} 
/* --------------------------------------------------------------------------------------------------------*/
/* ----------------------------------------------Radar plot------------------------------------------------*/
/* --------------------------------------------------------------------------------------------------------*/

// append the svg object to the body of the page
var radarsvg = d3.select("#radar")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("position", "relative")       
    .style("left", "350px")
    .style("top", "-100px");


function draw_radar(name)
{
  d3.csv("data.csv").then(function (data) {
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

      //console.log(featureData);

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

d3.csv("All_Pokemon.csv").then(function (data) {
    radarsvg.selectAll("polygon").remove();
    let radatData = [];
    let MyType;

    data.forEach(function(d) {
        if(d.Name == name) {
            MyType = d.Type1;
            radatData.push({
                name: d.Name,
                hp: +d.HP,
                attack: +d.Att,
                defense: +d.Def,
                sp_attack: +d.Spa,
                sp_defense: +d.Spd,
                speed: +d.Spe,
                total: +d.Att + +d.HP + +d.Def + +d.Spa + +d.Spd + +d.Spe
            });
        }
    });
    let fillColor;
    switch (MyType) {
      case "Grass":
          fillColor = "darkgreen";
          break;
      case "Fire":
          fillColor = "red";
          break;
      case "Water":
          fillColor = "darkblue";
          break;
      case "Normal":
          fillColor = "gray";
          break;
      case "Ground":
          fillColor = "saddlebrown";
          break;
      case "Bug":
          fillColor = "limegreen";
          break;
      case "Rock":
          fillColor = "burlywood";
          break;
      case "Electric":
          fillColor = "yellow";
          break;
      case "Ice":
          fillColor = "lightblue";
          break;
      case "Steel":
          fillColor = "teal";
          break;
      case "Poison":
          fillColor = "purple";
          break;
      case "Flying":
          fillColor = "lightskyblue";
          break;
      case "Ghost":
          fillColor = "dimgray";
          break;
      case "Dark":
          fillColor = "darkpurple";
          break;
      case "Fairy":
          fillColor = "lightpink";
          break;
      case "Psychic":
          fillColor = "deeppink";
          break;
      case "Dragon":
          fillColor = "indigo";
          break;
      default:
          fillColor = "blue"; // Default color
  }

  let dataCoordinates = dataToCoordinates(radatData[0]);
  var myData = {
    name: "Rayquaza",
    hp: 105,
    attack: 150,
    defense: 90,
    sp_attack: 150,
    sp_defense: 90,
    speed: 95,
  };
  let mydataCoordinates = dataToCoordinates(myData);
  radarsvg.append("polygon")
    .attr("points", mydataCoordinates.map((coord) => coord.x + "," + coord.y).join(" "))
    .attr("stroke", "blue") // Adjust the stroke color
    .attr("fill", "black") // Adjust the fill color
    .attr("opacity", 0.5); // Adjust the opacity
    // Draw the radar chart using the dataCoordinates
  radarsvg.append("polygon")
    .attr("points", dataCoordinates.map((coord) => coord.x + "," + coord.y).join(" "))
    .attr("stroke", "blue") // Adjust the stroke color
    .attr("fill", fillColor) // Adjust the fill color
    .attr("opacity", 0.7); // Adjust the opacity
});

  });
  // Convert the data point to coordinates
  
}

/* --------------------------------------------------------------------------------------------------------*/
/* ----------------------------------------------UpdateImages------------------------------------------------*/
/* --------------------------------------------------------------------------------------------------------*/

function updateImages(name) 
{
  //name = name.split('-').join('');
  var lowercaseName = name.toLowerCase();
  //console.log(name);
  //console.log(typeof name);
  
  var imageContainer = document.getElementById("imageContainer")
  var imagePath = "images/";
  imageContainer.style.position = "absolute";
  imageContainer.style.left = "900px";  // 設定水平座標
  imageContainer.style.top = "3000px";    // 設定垂直座標

  // 清空之前的图片
  imageContainer.innerHTML = "";
  var img = document.createElement("img");
  img.src = imagePath + lowercaseName+".png";
  img.alt = "Image";
  img.width = 200;
  imageContainer.appendChild(img);
}


var evolutionInfo;
var evolutionIndex;
function evolution(evolutionInfo,evolutionIndex) 
{
  console.log("the if can evolve"+evolutionInfo);
  console.log(evolutionIndex);
  //var evolutionButton = d3.select("#evolution");
  if (evolutionInfo == 0.0) {
    //evolutionButton.style("display", "block");
    d3.csv("All_Pokemon.csv").then(function (data) {
      // 在数据中查找Number为evolutionIndex的Pokemon
      var selectedData = data.find(function (d) {
        return +d.Number === evolutionIndex; // 使用+将字符串转换为数字
      });
      evolutionInfo=selectedData.FinalEvolution;
      evolutionIndex = parseInt(selectedData.Number) + 1;
      console.log(evolutionIndex);
      //console.log(selectedData.Name);
      d3.select("#dropdown").property("value", selectedData.Number);
      // 在这里执行其他操作，例如更新可视化或其他处理
      // 这里只是一个简单的例子，你可以根据实际需求进行操作
      draw_radar(selectedData.Name);
      updateImages(selectedData.Name);
      
    });
  }
  else
  {
    //evolutionButton.style("display", "none");
  }
}

/* --------------------------------------------------------------------------------------------------------*/
/* ----------------------------------------------UpdateMenu------------------------------------------------*/
/* --------------------------------------------------------------------------------------------------------*/
updateMenu("Dragon",3);
function updateMenu(type,generation)
{
  console.log(type+generation);
  d3.csv("All_Pokemon.csv").then(function(data)
  {
    // 選擇下拉式選單
        var filteredData = data.filter(function (d) {
          return (d.Type1 === type|| d.Type2 === type) && +d.Generation === +generation; // 使用+将字符串转换为数字
        });
        console.log(filteredData);
        var selectMenu = d3.select("#dropdown")
        .on("change", function() {
        // 獲取選擇的值
        var selectedValue = d3.select(this).property("value");
        // 獲取當前選擇的 option 元素
        var selectedOption = d3.select(this).select("option:checked");
        //進化
        var selectedData = data[selectedValue - 1];
        evolutionInfo = selectedData['FinalEvolution'];
        evolutionIndex = parseInt(selectedValue) + 1;

        var selectedText = selectedOption.text();
        var selectedName = selectedText.split(' ')[1];

        draw_radar(selectedName);
        updateImages(selectedName);
        });
        selectMenu.style("position", "absolute")
              .style("left", "750px")
              .style("top", "3100px");

      // 使用 Map 來存儲每個 Number 的第一筆資料
        var firstDataMap = new Map();
    // 過濾數據，只保留每個 Number 的第一筆資料
        filteredData.forEach(function(d) {
        if (!firstDataMap.has(d.Number)) {
            firstDataMap.set(d.Number, d);
        }
    });
    var first=1;
    // 將過濾後的資料填充到下拉式選單中
    selectMenu.append("option")
            .attr("value", 0)
            .text(function(d) { return "choose your pokemon" });
    firstDataMap.forEach(function(value, key) {
        selectMenu.append("option")
            .attr("value", value.Number)
            .text(function(d) { return "#" + value['Number'] +" " +value['Name']; });
    });

  });
}
