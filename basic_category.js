
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
  
  
  function sortRandom () {
    grid.sort(randomComparator, randomComparator)
    transition(grid,svg);
  }
  
  function groupByShape (grid, svg,shapes) {
    grid.groupBy('shape');
    transition(grid,svg,shapes);
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

  ////// End of comparison helper functions

  function returnAgeMap(d){
    var party_map = {};
    for(var i=1; i<d.length;i++){
      if (!(d[i].POLITICAL_PARTY in party_map)) {
        party_map[d[i].POLITICAL_PARTY] = {"male": 0, "female":0, "candidate_ids":[], "university_educated":0}; 
      }
      //add statistics for female and male
      if (d[i].GENDER == "FEMENINO"){
        party_map[d[i].POLITICAL_PARTY].female += 1; 
      } else if (d[i].GENDER == "MASCULINO"){
        party_map[d[i].POLITICAL_PARTY].male += 1; 
      }
      //add candidate ids
      party_map[d[i].POLITICAL_PARTY].candidate_ids.push(parseInt(d[i].DNI_ID));
    }
    return party_map;
  }

  function returnUniversityMap(d){
    var uni_map = {};
    for(var i=1; i<d.length;i++){
      if (!(d[i].CANDIDATE_ID in uni_map)){
        if(d[i].HAS_UNIVERSITY_EDUCATION != "NO"){
          uni_map[d[i].CANDIDATE_ID] = 1;
        }
      }
    }
    return uni_map;
  }

  function count_education(uni_map, party_map){
    for (key in party_map){
      //candidates = party_map[key].candidate_ids;
      for (var i = 0; i < party_map[key].candidate_ids.length; i++){
        if (party_map[key].candidate_ids[i] in uni_map){
            party_map[key].university_educated +=1;
        }
      }
    }
  }

  function draw_comparison_shapes(party_map, party_name){
    console.log("draw comparison shapes");
    female = party_map[party_name].female;
    male = party_map[party_name].male;

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
  }

  //filenames of CSV files to read
  var filenames = ["csv_data/candidates_mini.csv", "csv_data/afiliaciones_mini.csv", "csv_data/CANDIDATOSERM2018v2_CANDIDATES2018_joined.csv",
                  "csv_data/HDVEDUCACIONUNIVERSITARIA_University_Education_joined.csv"];

  //initialize d3.queue() object
  var queue = d3.queue();

  //Pass in each filename to d3.csv function
  filenames.forEach(function(filename) {
    queue.defer(d3.csv, filename);
  });

  //Once each d3.csv file finishes and returns, execute body of awaitAll
  queue.awaitAll(function(error, csvDataSets) {
    if(error) throw error;

    party_map = returnAgeMap(csvDataSets[2]);
    univ_map = returnUniversityMap(csvDataSets[3]);
    console.log("university map")
    console.log(univ_map);
    console.log("number of candidates with university education")
    console.log(Object.keys(univ_map).length);
    console.log("party map")
    console.log(party_map);
    console.log("number of parties");
    console.log(Object.keys(party_map).length);
    count_education(univ_map, party_map);
    console.log("party map with university education")
    console.log(party_map);

    var univ_sum = 0;
    for (key in party_map){
      univ_sum += party_map[key].university_educated;
    }
    console.log("count of university educated");
    console.log(univ_sum);

    num_entries = csvDataSets[0].length;

    let party_name = "ESFUERZOS UNIDOS"

    draw_comparison_shapes(party_map, party_name);
  });