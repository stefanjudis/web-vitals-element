import * as webVitals from 'web-vitals';

class WebVitals extends HTMLElement {
  constructor() {
    super();

    const metricList = this.getAttribute('metrics')
      ? this.getAttribute('metrics').split(',')
      : ['CLS', 'FID', 'LCP'];

    this.metrics = new Map(
      metricList.map((metricName) => [metricName, { value: null }])
    );
  }

  connectedCallback() {
    this.render();

    for (let key of this.metrics.keys()) {
      const getMetric = webVitals[`get${key}`];
      if (getMetric) {
        getMetric((metric) => {
          this.metrics.set(key, metric);
          this.render();
        });
      } else {
        console.error(`${key} is not supported`);
      }
    }
  }

  render() {
    // todo make this a nice tagget template literal
    const metricsArray = [...this.metrics];

    this.innerHTML = `<div class="web-vitals">
      <dl>
        ${metricsArray
          .map(([key, metric]) => {
            return `
            <dt>${key}</dt>
            <dd>${metric.value ? `${Math.floor(metric.value)}ms` : '...'}</dd>
          `;
          })
          .join('')}
      </dl>
    </div>`;
  }
}

customElements.define('web-vitals', WebVitals);
