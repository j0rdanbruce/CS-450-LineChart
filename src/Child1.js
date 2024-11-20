import React, { Component } from "react";
import * as d3 from "d3";
import './Child1.css';    //Child1 CSS

class Child1 extends Component {
  state = { 
    company: "Apple", // Default Company
    selectedMonth: 'November' //Default Month
  };

  componentDidMount() {
    console.log(this.props.csv_data) // Use this data as default. When the user will upload data this props will provide you the updated data
    this.renderLineChart()
  }

  componentDidUpdate() {
    console.log(this.props.csv_data)
    // var monthNames = ["January", "February", "March", "April", "May", "June",
    //   "July", "August", "September", "October", "November", "December"
    // ];
    // var data = this.props.csv_data;
    // var selectedData = data.filter(data => data.Company == this.state.company && monthNames[data.Date.getMonth()] == this.state.selectedMonth)

    console.log(this.state)
    // console.log(selectedData)
    this.renderLineChart()
  }

  //function for handling dorp down button for month selection
  handleDropdownClick = (event) => {
    //event.preventDefault()
    //console.log(event.target.value)
    this.setState({
      ...this.state,
      selectedMonth: event.target.value
    })
  }

  //function for rendering the multi-line chart
  renderLineChart = () => {
    var data = this.props.csv_data;
    var monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    var selectedData = data.filter(data => data.Company == this.state.company && monthNames[data.Date.getMonth()] == this.state.selectedMonth)
    //console.log(data)
    //console.log(selectedData)
    console.log(d3.min(selectedData.map(item => item.Close)))

    // Set the dimensions of the chart
    const margin = { top: 20, right: 90, bottom: 40, left: 30 },
      width = 800,
      height = 450,
      innerWidth = width - margin.left - margin.right,
      innerHeight = height - margin.top - margin.bottom;
    
    //SVG container
    var container = d3.select('.svg_parent').attr('width', width).attr('height', height)
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    //Line Chart Legend
    container.append('rect').attr('x', innerWidth+margin.left).attr('y', 0)
      .attr('width', margin.left)
      .attr('height', margin.left)
      .style('fill', '#b2df8a')
    container.append('text').attr('class', 'legend_open').text('Open').attr('x', width-margin.right/2).attr('y', margin.top).text('Open')
    container.append('rect').attr('x', innerWidth+margin.left).attr('y', margin.top*2)
      .attr('width', margin.left)
      .attr('height', margin.left)
      .style('fill', '#e41a1c')
    container.append('text').attr('class', 'legend_close').text('Close').attr('x', width-margin.right/2).attr('y', margin.top*3)


    //Scales for X and Y axes
    //onsole.log(d3.extent(selectedData.map(d => d.Open).concat(selectedData.map(d => d.Close))))
    const x_scale = d3.scaleTime().domain(d3.extent(selectedData, d => d.Date)).range([margin.left, innerWidth])
    const y_scale = d3.scaleLinear().domain(d3.extent(selectedData.map(d => d.Open).concat(selectedData.map(d => d.Close))))
      .range([innerHeight, margin.top])

    //Setting X and Y axes
    container.selectAll('.x.axis').data([null]).join('g').attr('class', 'x axis').attr('transform', `translate(${margin.left}, ${innerHeight+margin.top})`)
      .call(d3.axisBottom(x_scale)).selectAll('text').style('text-anchor', 'start').attr('transform', 'rotate(45)')
    container.selectAll('.y.axis').data([null]).join('g').attr('class', 'y axis').attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y_scale))
    
    //creating the line generator for open and close values
    var openLineGenerator = d3.line()
      .x(d => x_scale(d.Date))
      .y(d => y_scale(d.Open))
      .curve(d3.curveCardinal)
    var closeLineGenerator = d3.line()
      .x(d => x_scale(d.Date))
      .y(d => y_scale(d.Close))
      .curve(d3.curveCardinal)
    
    //Get the pathdata
    var openPathData = openLineGenerator(selectedData)
    var closePathData = closeLineGenerator(selectedData)
    container.select('.open_data_g').selectAll('path')
      .data([openPathData])
      .join('path')
      .attr('d', d=>d)
      .attr('fill', 'none')
      .attr('stroke', '#b2df8a')
      .attr('stroke-width', 2)
    container.select('.close_data_g').selectAll('path')
      .data([closePathData])
      .join('path')
      .attr('d', d=>d)
      .attr('fill', 'none')
      .attr('stroke', '#e41a1c')
      .attr('stroke-width', 2)
    
    //Adding circles to linechart
    container.select('.open_data_g').selectAll('circle').data(selectedData).join('circle')
      .attr('cx', d => x_scale(d.Date))
      .attr('cy', d => y_scale(d.Open))
      .attr('r', 6)
      .style('fill', '#b2df8a')
      .on('mouseover', this.displayToolTip)
      .on('mouseleave', this.hideToolTip)
    container.select('.close_data_g').selectAll('circle').data(selectedData).join('circle')
      .attr('cx', d => x_scale(d.Date))
      .attr('cy', d => y_scale(d.Close))
      .attr('r', 6)
      .style('fill', '#e41a1c')
      .on('mouseover', this.displayToolTip)
      .on('mouseleave', this.hideToolTip)
  }

  displayToolTip = (e,d) => {
    console.log(e)
    console.log(d)
    var tooltip = d3.select('.tooltip').style('opacity', 0.9)
      .style('left', (e.x + 'px'))
      .style('top', (e.y + 'px'))
      .raise()
    tooltip.append('p').html(`Date: ${d.Date.toLocaleDateString()}`)
    tooltip.append('p').html(`Open: ${(d.Open).toFixed(2)}`)
    tooltip.append('p').html(`Close: ${(d.Close).toFixed(2)}`)
    tooltip.append('p').html(`Difference: ${(d.Close -  d.Open).toFixed(2)}`)
    tooltip.selectAll('p').style('margin', '2px').style('color', 'white')
  }
  hideToolTip = (e,d) => {
    var tooltip = d3.select('.tooltip')
    tooltip.selectAll('p').remove()
    tooltip.lower().style('opacity', 0)
  }

  render() {
    const options = ['Apple', 'Microsoft', 'Amazon', 'Google', 'Meta']; // Use this data to create radio button
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']; // Use this data to create dropdown

    //JSX radio buttons
    var radioBtns = options.map((option, indx) => {
      var self = this;

      function handleRadioBtnClick(event) {
        //event.preventDefault();
        self.setState({
          ...self.state,
          company: event.target.value
        })
      }

      return(
        <label>
          <input id={indx} type="radio" value={option} checked={self.state.company == option} onChange={handleRadioBtnClick}></input>{option}
        </label>
      );
    })
    //JSX dropdown interface for months selection
    var dropDownBtn = (
        <div>
          <label for='months'>Month:</label>
          <select name="months" id="months" onChange={this.handleDropdownClick}>
            {months.map((month, indx) => <option id={indx} value={month} selected={month == this.state.selectedMonth}>{month}</option>)}
          </select>
        </div>
    )

    return (
      <div className="child1">
        <div className="tooltip"></div>
        <div className="radiobtns-container">
          {radioBtns}
        </div>
        <div className="dropdown-container">{dropDownBtn}</div>
        <div className="child1_div">
          <svg className="svg_parent">
            <g className="open_data_g"></g>
            <g className="close_data_g"></g>
          </svg>
        </div>
      </div>
    );
  }
}

export default Child1;