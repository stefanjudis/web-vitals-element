import * as webVitals from 'web-vitals';
// import { getCLS, getFID, getLCP } from 'web-vitals';

const MS_UNIT = 'ms';

// borrowed from the vitals extension
// https://github.com/GoogleChrome/web-vitals-extension/blob/master/src/browser_action/vitals.js#L20-L23
const METRIC_CONFIG = new Map([
  [
    'CLS',
    {
      thresholds: {
        good: 0.1,
        needsImprovement: 0.25,
      },
      observerEntryType: 'layout-shift',
      explainerURL: 'https://web.dev/cls/',
      longName: 'Cumulative Layout Shift',
    },
  ],
  [
    'FCP',
    {
      thresholds: {
        good: 2500,
      },
      observerEntryType: 'paint',
      explainerURL: 'https://web.dev/fcp/',
      unit: MS_UNIT,
      longName: 'First Contentful Paint',
    },
  ],
  [
    'FID',
    {
      thresholds: {
        good: 100,
        needsImprovement: 300,
      },
      observerEntryType: 'first-input',
      explainerURL: 'https://web.dev/fid/',
      unit: MS_UNIT,
      longName: 'First Input Delay',
    },
  ],
  [
    'LCP',
    {
      thresholds: {
        good: 2500,
        needsImprovement: 4000,
      },
      observerEntryType: 'paint',
      explainerURL: 'https://web.dev/lcp/',
      unit: MS_UNIT,
      longName: 'Largest Contentful Paint',
    },
  ],
  [
    'TTFB',
    {
      thresholds: {
        good: 2500,
      },
      explainerURL: 'https://web.dev/time-to-first-byte/',
      unit: MS_UNIT,
      longName: 'Time to first byte',
    },
  ],
]);

const GENERAL_ATTRIBUTES = ['class', 'style'];
const CONFIG_ATTRIBUTES = ['show-unsupported', 'show-metric-name'];

class WebVitals extends HTMLElement {
  constructor() {
    super();

    this.unsupportedMetrics = [];
    this.metrics = new Map();
  }

  connectedCallback() {
    const metricAttributes = this.getMetricAttributes();
    const metricList = metricAttributes.length
      ? metricAttributes
      : [...METRIC_CONFIG.keys()];

    this.metrics = this.getMetrics(metricList);

    this.render();

    for (let metricConfig of this.metrics.values()) {
      const { name, getWebVitalsValue } = metricConfig;

      getWebVitalsValue((metric) => {
        this.metrics.set(name, {
          ...metricConfig,
          ...metric,
        });
        this.render();
      }, true);
    }
  }

  getMetricAttributes() {
    return this.getAttributeNames()
      .filter(
        (attr) =>
          !GENERAL_ATTRIBUTES.includes(attr) &&
          !CONFIG_ATTRIBUTES.includes(attr)
      )
      .map((attr) => attr.toUpperCase());
  }

  getMetrics(metricList) {
    return new Map(
      metricList.reduce((acc, metricName) => {
        // exclude metric when it's not supported by web-vitals

        const getWebVitalsValue = webVitals[`get${metricName}`];
        if (!getWebVitalsValue) {
          console.error(`${metricName} is not supported by '<web-vitals />'`);
          this.unsupportedMetrics.push(metricName);
          return acc;
        }

        // exclude metric when it's not supported
        const metricConfig = METRIC_CONFIG.get(metricName);
        const { observerEntryType } = metricConfig;
        if (
          observerEntryType &&
          !PerformanceObserver.supportedEntryTypes.includes(observerEntryType)
        ) {
          console.error(`${metricName} is not supported by your browser`);
          this.unsupportedMetrics.push(metricName);
          return acc;
        }

        return [
          ...acc,
          [
            metricName,
            {
              ...METRIC_CONFIG.get(metricName),
              getWebVitalsValue,
              name: metricName,
            },
          ],
        ];
      }, [])
    );
  }

  render() {
    this.innerHTML = `<div class="web-vitals">
      <dl>
        ${[...this.metrics]
          .map(([key, metric]) => {
            const { explainerURL, longName, thresholds, unit, value } = metric;
            let classes = '';
            const { good, needsImprovement } = thresholds;

            if (value) {
              classes += 'is-final ';
              let score = 'is-poor';
              if (needsImprovement && value <= needsImprovement) {
                score = 'needs-improvement';
              }
              if (value <= good) {
                score = 'is-good';
              }
              classes += score;
            }

            return `
            <div class="${classes}">
              <dt>
                ${
                  this.hasAttribute('show-metric-name')
                    ? `${longName} (<a href="${explainerURL}">${key}</a>)`
                    : `<a href="${explainerURL}">${key}</a>`
                }
              </dt>
              <dd>${
                value ? `${Math.floor(value)}${unit ? unit : ''}` : '...'
              }</dd>
            </div>
          `;
          })
          .join('')}
      </dl>
        ${
          this.unsupportedMetrics.length &&
          this.hasAttribute('show-unsupported')
            ? `<p>Not supported: ${this.unsupportedMetrics.join(', ')}</p>`
            : ''
        }
    </div>`;
  }
}

export default WebVitals;
