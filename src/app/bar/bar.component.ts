import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import * as d3 from "d3";

interface FrameworkRating {
  framework: string;
  stars: number;
  released: string;
}

@Component({
  selector: 'app-bar',
  templateUrl: './bar.component.html',
  styleUrls: ['./bar.component.scss'],
  // Disattivo l'incapsulamento css per poter gestire le classi del grafico 
  encapsulation: ViewEncapsulation.None,
})
export class BarComponent implements OnInit {

  private data: FrameworkRating[] = [
    { framework: "Vue", stars: 166443, released: "2014" },
    { framework: "React", stars: 150793, released: "2013" },
    { framework: "Angular", stars: 62342, released: "2016" },
    { framework: "Backbone", stars: 27647, released: "2010" },
    { framework: "Ember", stars: 21471, released: "2011" },
  ];

  // Oggetti D3
  private svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any> | undefined;
  private chart: d3.Selection<SVGGElement, unknown, HTMLElement, any> | undefined;
  // Margine dell'SVG
  private margin = 60;
  // Dimensioni SVG
  private totalWidth = 750;
  private totalHeight = 400;
  private width = this.totalWidth - (this.margin * 2);
  private height = this.totalHeight - (this.margin * 2);

  constructor() {
  }

  ngOnInit(): void {
    this.svg = d3.select("#svg-container")
      .append("svg")
      .attr("width", this.totalWidth)
      .attr("height", this.totalHeight);
    this.chart = this.svg.append('g')
      .attr('transform', `translate(100, ${this.margin})`);
    this.drawChart(this.data);
  }

  private drawChart(data: FrameworkRating[]): void {
    if (this.svg && this.chart) {
      // Creo la scala dell'asse delle x
      const xScale = d3.scaleBand()
        .range([0, this.width])
        .domain(data.map(d => d.framework))
        .padding(0.2);

      // Disegno l'asse delle X
      this.chart.append('g')
        .attr('transform', `translate(0, ${this.height})`)
        .call(d3.axisBottom(xScale).tickSizeOuter(0));

      // Aggiungo la label dell'asse X
      this.svg.append('text')
        .attr('class', 'label')
        .attr('x', this.width / 2 + this.margin)
        .attr('y', this.height + this.margin * 1.7)
        .attr('text-anchor', 'middle')
        .text('Frameworks');

      // Creo la scala dell'asse delle Y
      const yScale = d3.scaleLinear()
        .domain([0, 200000])
        .range([this.height, 0]);

      // Disegno l'asse delle Y
      this.chart.append('g')
        .call(d3.axisLeft(yScale))
        .classed('grid', true)
        .call(g => g.selectAll(".tick line").clone()
          .attr("x2", this.width)
          .attr("stroke-opacity", 0.1)
        );

      // Aggiungo la label dell'asse Y
      this.svg.append('text')
        .attr('class', 'label')
        .attr('x', -(this.height / 2) - this.margin)
        .attr('y', this.margin / 2.4)
        .attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle')
        .text('Number of stars');

      // Creo il grafico a barre
      const chart = this.chart;
      const width = this.width;
      this.chart.append("g").selectAll("rect")
        .data(data)
        .join("rect")
        .attr('class', 'bar')
        .attr("x", d => xScale(d.framework) || 0)
        .attr("y", d => yScale(d.stars) || 0)
        .attr("height", d => this.height - yScale(d.stars))
        .attr("width", xScale.bandwidth())
        // Al passaggio del mouse su di una colonna voglio che mostri:
        // - allarghi la colonna selezionata e la renda meno opaca
        // - una linea tratteggiata con il valore corrente 
        // - mostri le label con i valori delle varie barre
        .on('mouseenter', function (e, d) {
          d3.selectAll('.value')
            .attr('opacity', 0)

          d3.select(this)
            .transition()
            .duration(300)
            .attr('opacity', 0.6)
            .attr('x', () => (xScale(d.framework) || 0) - 5)
            .attr('width', xScale.bandwidth() + 10)

          const y = yScale(d.stars)

          chart.append('line')
            .attr('id', 'limit')
            .attr('x1', 0)
            .attr('y1', y)
            .attr('x2', width)
            .attr('y2', y)

          chart.selectAll("#bar-label").style("visibility", "visible")
        })
        // All'uscita del mouse dalla colonna:
        // - ripristino l'opacità e la larghezza della colonna
        // - cancello le label e la linea tratteggiata
        .on('mouseleave', function (e, d) {
          d3.selectAll('.value')
            .attr('opacity', 1)

          d3.select(this)
            .transition()
            .duration(300)
            .attr('opacity', 1)
            .attr('x', () => xScale(d.framework) || 0)
            .attr('width', xScale.bandwidth())

          chart.selectAll('#limit').remove()
          chart.selectAll("#bar-label").style("visibility", "hidden")
        })

      // Per ogni barra, creo una label con il valore da mostrare al mouseover
      this.chart.append("g").selectAll("text")
        .data(data)
        .join("text")
        .style("visibility", "hidden")
        .attr('x', d => (xScale(d.framework) || 0) + xScale.bandwidth() / 2)
        .attr('y', d => (yScale(d.stars) || 0) + 20)
        .classed("label", true)
        .attr('text-anchor', 'middle')
        .attr('opacity', 0.75)
        .text(d => `${d.stars}`)
        .attr("id", "bar-label");

      // Aggiungo il titolo
      this.svg.append('text')
        .attr('class', 'title')
        .attr('x', this.width / 2 + this.margin)
        .attr('y', 40)
        .attr('text-anchor', 'middle')
        .text('Most loved frontend frameworks')
    }
  }

}
