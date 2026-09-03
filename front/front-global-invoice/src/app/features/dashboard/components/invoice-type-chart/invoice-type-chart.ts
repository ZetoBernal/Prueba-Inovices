import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    effect,
    input,
    viewChild
} from '@angular/core';
import { axisBottom, axisLeft, max, scaleBand, scaleLinear, select } from 'd3';

import { TypeTotal } from '@core/invoices/invoice-totals';
import { INVOICE_TYPE_COLORS, INVOICE_TYPE_LABELS } from '../../invoice-type-colors';

@Component({
    selector: 'app-invoice-type-chart',
    template: '<div class="chart" #container></div>',
    styleUrl: './invoice-type-chart.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvoiceTypeChart {
    readonly data = input.required<TypeTotal[]>();

    private readonly container = viewChild.required<ElementRef<HTMLDivElement>>('container');

    private readonly width = 780;
    private readonly height = 400;
    private readonly margin = { top: 44, right: 16, bottom: 52, left: 92 };

    constructor() {
        effect(() => this.render(this.data()));
    }

    private render(totals: TypeTotal[]): void {
        const host = select(this.container().nativeElement);
        host.selectAll('*').remove();

        if (totals.length === 0) return;

        const innerWidth = this.width - this.margin.left - this.margin.right;
        const innerHeight = this.height - this.margin.top - this.margin.bottom;

        const svg = host
            .append('svg')
            .attr('viewBox', `0 0 ${this.width} ${this.height}`)
            .attr('preserveAspectRatio', 'xMidYMid meet')
            .attr('role', 'img')
            .attr('aria-label', 'Monto total facturado por tipo de factura');

        const plot = svg
            .append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

        const x = scaleBand<string>()
            .domain(totals.map(item => INVOICE_TYPE_LABELS[item.type]))
            .range([0, innerWidth])
            .padding(0.38);

        const y = scaleLinear()
            .domain([0, (max(totals, item => item.total) ?? 0) * 1.18])
            .nice()
            .range([innerHeight, 0]);

        plot.append('g')
            .attr('class', 'grid')
            .selectAll('line')
            .data(y.ticks(5))
            .join('line')
            .attr('x1', 0)
            .attr('x2', innerWidth)
            .attr('y1', value => y(value))
            .attr('y2', value => y(value));

        plot.append('g')
            .attr('class', 'axis axis--y')
            .call(axisLeft(y).ticks(5).tickFormat(value => this.formatShort(Number(value))))
            .call(group => group.select('.domain').remove());

        plot.append('g')
            .attr('class', 'axis axis--x')
            .attr('transform', `translate(0,${innerHeight})`)
            .call(axisBottom(x).tickSize(0).tickPadding(12));

        plot.selectAll('rect.bar')
            .data(totals)
            .join('rect')
            .attr('class', 'bar')
            .attr('x', item => x(INVOICE_TYPE_LABELS[item.type]) ?? 0)
            .attr('width', x.bandwidth())
            .attr('rx', 6)
            .attr('fill', item => INVOICE_TYPE_COLORS[item.type])
            .attr('y', item => y(item.total))
            .attr('height', item => Math.max(0, innerHeight - y(item.total)));

        plot.selectAll('text.value')
            .data(totals)
            .join('text')
            .attr('class', 'value')
            .attr('x', item => (x(INVOICE_TYPE_LABELS[item.type]) ?? 0) + x.bandwidth() / 2)
            .attr('y', item => y(item.total) - 12)
            .attr('text-anchor', 'middle')
            .text(item => this.formatShort(item.total));
    }

    private formatShort(value: number): string {
        if (value >= 1_000_000) {
            return `$${(value / 1_000_000).toFixed(1).replace('.', ',')} M`;
        }

        if (value >= 1_000) {
            return `$${Math.round(value / 1_000)} K`;
        }

        return `$${value}`;
    }
}
