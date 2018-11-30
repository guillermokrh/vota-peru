
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
  function updateLabels () {
    var groups = grid.groups();
  
    // Provide d3 a key function so that labels are animated correctly
    // http://bost.ocks.org/mike/constancy/
    var labels = svg.selectAll('text').data(groups, function (d) { return d.name; });
    labels.enter()
      .append('text')
        .attr('y', function (d) { return d.y - 40; })
        .style('opacity', 0);
    labels.exit()
        .transition()
        .style('opacity', 0)
      .remove();
  
    labels
      .text(function (d) { return capitalize(d.name) + ': (' + d.data.length + ')'; })
      .transition()
        .duration(750)
        .attr('x', 30)
        .attr('y', function (d) { return d.y - 40; })
        .style('opacity', 1);
  }
  
  function sortGroupAscend () {
    grid.sort(ascending);
  
    updateLabels();
    transition();
  }
  
  function sortGroupDescend () {
    grid.sort(descending);
  
    updateLabels();
    transition();
  }
  
  function sortSizeAscend () {
    grid.sort(null, ascending);
    transition();
  }
  
  function sortSizeDescend () {
    grid.sort(null, descending);
    transition();
  }
  
  function sortRandom () {
    grid.sort(randomComparator, randomComparator)
    transition();
  }
  
  function groupByShape () {
    grid.groupBy('shape');
    transition();
  }
  
  function groupBySize () {
    grid.groupBy(function (d) {
      return sizeScale(d.size);
    });
    transition();
  }
  
  function groupByColor () {
    grid.groupBy('color');
    transition();
  }

  function transition () {
    updateLabels();
    svg.attr('height', grid.height());
    shapes.transition()
      .duration(750)
      .attr('transform', function (d) { return 'translate(' + d.x + ',' + d.y + ')'; });
  }

  
  //JavaScript Promises proof of concept 
  /*
  function myFunc(){
    var promise = new Promise(function(resolve, reject) {
      // do stuff, success once successful
      var x = 2;
      x = x + 2;
      var candidates_mini = [];
      console.log("should print first");
      d3.csv("csv_data/candidates_mini.csv", function(data){
        console.log(data[2]);
        candidates_mini = data;
      });
      if (true){
        resolve(candidates_mini)
      } else{
        reject();
      }
    });
    return promise;
  };

  myFunc().then(function(candidates_mini){
    console.log(candidates_mini);
    console.log("should print second");
  }).catch(function(){
    console.log("print on error");
  }); */

  //Load the data
  /*d3.text("csv_data/candidates_mini.csv", function(text) {
    console.log("print data");
    console.log(d3.csvParseRows(text));
  });*/
  function test(mydata){
    console.log("test of data");
    console.log(mydata);
    return mydata;
  }

  //load the data
  var thisdata;
  d3.csv("csv_data/candidates_mini.csv", function(data){
    //console.log(data[2]);
    thisdata = test(data) 
  });

  console.log(thisdata);

  /*set up map*/
  var width = 1000;
  var height = 500;
  var color = d3.scaleOrdinal(d3.schemeCategory10);
  var sizeScale = d3.scaleQuantile().domain([20, 40]).range(d3.range(20, 40, 4));
  /*var delayScale = d3.scaleLinear().domain([0, 400]).range([0, 300]);*/
 
  //Add the Data 
  //Rows 0 to 1 are the headers, row 2 and on are the data 
 
  percentA = 20.5;
  percentB = 80; 
  num_icons = 100;
  var data = d3.range(0, num_icons).map(function (i) {
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
  var grid = d3.grid()
    .width(width)
    .height(height)
    .colWidth(25)
    .rowHeight(25)
    .marginTop(75)
    .marginLeft(50)
    .sectionPadding(100)
    .data(data);
  
  //.delay(function (d) { return delayScale(d.groupIndex * 150 + d.index * 1); })

  
  groupByShape();

  /*
  document.getElementById('group-ascend').onclick = sortGroupAscend;
  document.getElementById('group-descend').onclick = sortGroupDescend;
  document.getElementById('size-ascend').onclick = sortSizeAscend;
  document.getElementById('size-descend').onclick = sortSizeDescend;
  document.getElementById('groupby-shape').onclick = groupByShape;
  document.getElementById('groupby-size').onclick = groupBySize;
  document.getElementById('groupby-color').onclick = groupByColor;
  */