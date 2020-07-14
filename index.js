import * as webVitals from 'web-vitals';

// borrowed from the vitals extension
// https://github.com/GoogleChrome/web-vitals-extension/blob/master/src/browser_action/vitals.js#L20-L23
const THRESHOLDS = new Map([
  ['CLS', 2500],
  ['FID', 100],
  ['CLS', 0.1],
]);

class WebVitals extends HTMLElement {
  constructor() {
    super();

    const metricList = this.getAttribute('metrics')
      ? this.getAttribute('metrics').split(',')
      : ['CLS', 'FID', 'LCP'];

    this.metrics = new Map(
      metricList.map((metricName) => [
        metricName,
        { threshold: THRESHOLDS.get(metricName) },
      ])
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
    console.log(this.metrics);
    this.innerHTML = `<div class="web-vitals">
      <dl>
        ${[...this.metrics]
          .map(([key, metric]) => {
            return `
            <dt>${key}</dt>
            <dd class="${
              metric.value > metric.threshold ? 'is-poor' : 'is-great'
            }">${metric.value ? `${Math.floor(metric.value)}ms` : '...'}</dd>
          `;
          })
          .join('')}
      </dl>
    </div>`;
  }
}

customElements.define('web-vitals', WebVitals);
