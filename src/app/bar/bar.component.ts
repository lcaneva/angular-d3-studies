import { Component, OnInit } from '@angular/core';
import * as d3 from "d3";

interface FrameworkRating {
  framework: string;
  stars: number;
  released:  string;
}

@Component({
  selector: 'app-bar',
  templateUrl: './bar.component.html',
  styleUrls: ['./bar.component.scss']
})
export class BarComponent implements OnInit {
  
  private data: FrameworkRating[] = [
    {framework: "Vue", stars: 166443, released: "2014"},
    {framework: "React", stars: 150793, released: "2013"},
    {framework: "Angular", stars: 62342, released: "2016"},
    {framework: "Backbone", stars: 27647, released: "2010"},
    {framework: "Ember", stars: 21471, released: "2011"},
  ];
  // SVG e dimensioni
  private svg: d3.Selection<SVGGElement, unknown, HTMLElement, any> | undefined;
  private totalWidth = 750;
  private totalHeight = 400;
  // Margine rispetto alle dimensione del SVG
  private margin = 50;
  private width = this.totalWidth - (this.margin * 2);
  private height = this.totalHeight - (this.margin * 2);

  constructor() { 
  }

  ngOnInit(): void {
    this.svg =  d3.select("#bar")
      .append("svg")
      .attr("width", this.totalWidth)
      .attr("height", this.totalHeight)
      .append("g")
      .attr("transform", "translate(" + this.margin + "," + this.margin + ")");
    this.drawBars (this.data);
  }

  private drawBars(data: FrameworkRating[]): void {
    if (this.svg) {
      // Create the X-axis band scale
      const x = d3.scaleBand()
        .range([0, this.width])
        .domain(data.map(d => d.framework))
        .padding(0.2);
  
      // Draw the X-axis on the DOM
      this.svg.append("g")
        .attr("transform", "translate(0," + this.height + ")")
        .call(d3.axisBottom(x).tickSizeOuter(0))
        .selectAll("text")
        .classed("xlabel", true)
        .style("text-anchor", "middle");
  
      // Create the Y-axis band scale
      const y = d3.scaleLinear()
        .domain([0, 200000])
        .range([this.height, 0]);
      
      // Draw the Y-axis on the DOM
      this.svg.append("g")
        .call(d3.axisLeft(y))
        .call(g => g.selectAll(".tick line").clone()
          .attr("x2", this.width)
          .attr("stroke-opacity", 0.1)
        );
  
      // Create and fill the bars
      this.svg.selectAll("bars")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", d => x(d.framework) || 0)
        .attr("y", d => y(d.stars))
        .attr("width", x.bandwidth())
        .attr("height", (d) => this.height - y(d.stars))
        .attr("fill", "steelblue");
    }
  }

}
