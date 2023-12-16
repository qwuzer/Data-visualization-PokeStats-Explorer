const margin = { top: 20, right: 20, bottom: 30, left: 40 },
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

const x = d3.scaleBand()
    .rangeRound([0, width])
    .paddingInner(0.5) 
    .paddingOuter(0.2) 
    .align(0.1);

const y = d3.scaleLinear()
    .rangeRound([height, 0]);

const z = d3.scaleOrdinal()
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

const svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


d3.csv("All_Pokemon.csv", d3.autoType).then((data) => {
  //隨機10個寶可夢
  data = d3.shuffle(data).slice(0, 8);

  //總和
  data.forEach(d => {
    d.total = d.HP + d.Att + d.Def + d.Spa + d.Spd + d.Spe;
  });

  x.domain(data.map(d => d.Name));
  y.domain([0, d3.max(data, d => d.total)]).nice();

  // 疊加數據準備
  let keys = ['HP', 'Att', 'Def', 'Spa', 'Spd', 'Spe'];
  z.domain(keys);

  let stack = d3.stack()
    .keys(keys)(data)
    .map(d => (d.forEach(v => v.key = d.key), d));

  svg.append("g")
    .selectAll("g")
    .data(stack)
    .enter().append("g")
      .attr("fill", d => z(d.key))
    .selectAll("rect")
    .data(d => d)
    .enter().append("rect")
      .attr("x", d => x(d.data.Name))
      .attr("y", d => y(d[1]))
      .attr("height", d => y(d[0]) - y(d[1]))
      .attr("width", x.bandwidth());

  svg.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

  svg.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(y).ticks(null, "s"))
    .append("text")
      .attr("x", 2)
      .attr("y", y(y.ticks().pop()) + 0.5)
      .attr("dy", "0.32em")
      .attr("fill", "#000")
      .attr("font-weight", "bold")
      .attr("text-anchor", "start")

  const legend = svg.append("g")
    .attr("font-family", "sans-serif")
    .attr("font-size", 10)
    .attr("text-anchor", "end")
    .selectAll("g")
    .data(keys.slice().reverse())
    .enter().append("g")
      .attr("transform", (d, i) => `translate(-50,${(i * 20) - margin.top})`);

  legend.append("rect")
      .attr("x", width - 19)
      .attr("width", 19)
      .attr("height", 19)
      .attr("fill", z);

  legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9.5)
      .attr("dy", "0.32em")
      .text(d => d);
});

