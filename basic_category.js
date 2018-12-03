
/*helper functions*/
function random (start, end) {
    var range = end - start;
    return start + Math.floor(Math.random() * range);
  }
  
  function randomPick (array) {
    var length = array.length;
    var index = random(0, array.length);
    return array[index];
  }
  
  function ascending (a, b) {
    return typeof a === 'string' ? 
      a.localeCompare(b) :
      a.size - b.size;
  }
  function descending (a, b) {
    return typeof a === 'string' ? 
      b.localeCompare(a) :
      b.size - a.size;
  }
  
  function randomComparator (d) {
    return randomPick([-1, 0, 1]);
  }
  
  function capitalize (str) {
    return str[0].toUpperCase() + str.substr(1);
  }

  /* set up color according to percentages */
  function setColor(num, percentA, percentB){
    if (num < percentA){
      return 'blue';
    } else {
      return 'gray';
    }
  }

  // More helper functions
  function updateLabels (grid,svg) {
    var groups = grid.groups();
  
    // Provide d3 a key function so that labels are animated correctly
    // http://bost.ocks.org/mike/constancy/
    var labels = svg.selectAll('text').data(groups, function (d) { return d.name; });
    labels.enter()
      .append('text')
        .attr('y', function (d) { return d.y - 40; })
        .style('opacity', 0);
    labels.exit()
        .transition(grid,svg)
        .style('opacity', 0)
      .remove();
  
    labels
      .text(function (d) { return capitalize(d.name) + ': (' + d.data.length + ')'; })
      .transition(grid,svg)
        .duration(750)
        .attr('x', 30)
        .attr('y', function (d) { return d.y - 40; })
        .style('opacity', 1);
  }
  
  function sortGroupAscend () {
    grid.sort(ascending);
  
    updateLabels(grid,svg);
    transition(grid,svg);
  }
  
  function sortGroupDescend () {
    grid.sort(descending);
  
    updateLabels(grid,svg);
    transition(grid,svg);
  }
  
  function sortSizeAscend () {
    grid.sort(null, ascending);
    transition(grid,svg);
  }
  
  function sortSizeDescend () {
    grid.sort(null, descending);
    transition(grid,svg);
  }
  
  function sortRandom () {
    grid.sort(randomComparator, randomComparator)
    transition(grid,svg);
  }
  
  function groupByShape (grid, svg,shapes) {
    grid.groupBy('shape');
    transition(grid,svg,shapes);
  }
  
  function groupBySize () {
    grid.groupBy(function (d) {
      return sizeScale(d.size);
    });
    transition(grid,svg);
  }
  
  function groupByColor () {
    grid.groupBy('color');
    transition(grid,svg);
  }

  function transition (grid,svg,shapes) {
    updateLabels(grid,svg);
    svg.attr('height', grid.height());
    shapes.transition(grid,svg,shapes)
      .duration(750)
      .attr('transform', function (d) { return 'translate(' + d.x + ',' + d.y + ')'; });
  }

  //filenames of CSV files to read
  var filenames = ["csv_data/candidates_mini.csv", "csv_data/afiliaciones_mini.csv"];

  //initialize d3.queue() object
  var queue = d3.queue();

  //Pass in each filename to d3.csv function
  filenames.forEach(function(filename) {
    queue.defer(d3.csv, filename);
  });

  //Once each d3.csv file finishes and returns, execute body of awaitAll
  queue.awaitAll(function(error, csvDataSets) {
    if(error) throw error;

    //executes after d3.csv is called and returns from all calls
    // console.log("printing csv data sets");
    // console.log(csvDataSets[0]);
    // console.log(csvDataSets[1]);

    num_entries = csvDataSets[0].length;
    var percentGender = d3.nest().key(function(d){
      if(d.ELECTION_JURY=="ICA"){
        return d.GENDER;}
      }).entries(csvDataSets[0]);
    // console.log(percentGender);
    female = percentGender[1].values.length;
    male = percentGender[2].values.length;
    // console.log("male: " + male);
    // console.log("female: " + female);

    /*set up map*/
    var width = 1000;
    var height = 500;
    var color = d3.scaleOrdinal(d3.schemeCategory10);
    var sizeScale = d3.scaleQuantile().domain([20, 40]).range(d3.range(20, 40, 4));
    /*var delayScale = d3.scaleLinear().domain([0, 400]).range([0, 300]);*/

    //Add the Data 
    //Rows 0 to 1 are the headers, row 2 and on are the data 
    percentA = male;
    percentB = female; 
    //num_icons = 100;
    var data = d3.range(0, male+female).map(function (i) {
      return {
        index: i,
        prop1: randomPick(['a', 'b', 'c']),
        prop2: randomPick(['a', 'b', 'c', 'd', 'e']),
        x: random(width / 2 - 100, width / 2 + 100),
        y: random(height / 2 - 100, height / 2 + 100),
        color: setColor(i, percentA, percentB),
        shape: 'circle',
        size: 20
      };
    });
    
    var svg = d3.select('#category')
      .attr('width', width)
      .attr('height', height);
    
    var shapes = svg.selectAll('.shape').data(data)
      .enter()
        .append('g')
          .attr('transform', function (d) { return 'translate(' + d.x + ',' + d.y + ')'; })
          .attr('data-size', function (d) { return d.size; })
          .attr('data-shape', function (d) { return d.shape; });
    
    var circles = shapes.filter(function (d) { return d.shape === 'circle'; })
      .append('circle')
        .attr('r', function (d) { return d.size / 2; })
        .attr('fill', function (d) { return d.color; });
    
    /*set column width and column height here*/
    grid = d3.grid()
      .width(width)
      .height(height)
      .colWidth(25)
      .rowHeight(25)
      .marginTop(75)
      .marginLeft(50)
      .sectionPadding(100)
      .data(data);
    
    //.delay(function (d) { return delayScale(d.groupIndex * 150 + d.index * 1); })
    
    groupByShape(grid,svg,shapes);
  });

