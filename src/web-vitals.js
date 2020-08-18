import * as webVitals from 'web-vitals';

const MS_UNIT = 'ms';

// borrowed from the vitals extension
// https://github.com/GoogleChrome/web-vitals-extension/blob/master/src/browser_action/vitals.js#L20-L23
const METRIC_CONFIG = new Map([
  [
    'CLS',
    {
      threshold: 0.1,
      observerEntryType: 'layout-shift',
      explainerURL: 'https://web.dev/cls/',
    },
  ],
  [
    'FCP',
    {
      threshold: 2500,
      observerEntryType: 'paint',
      explainerURL: 'https://web.dev/fcp/',
      unit: MS_UNIT,
    },
  ],
  [
    'FID',
    {
      threshold: 100,
      observerEntryType: 'first-input',
      explainerURL: 'https://web.dev/fid/',
      unit: MS_UNIT,
    },
  ],
  [
    'LCP',
    {
      threshold: 2500,
      observerEntryType: 'paint',
      explainerURL: 'https://web.dev/lcp/',
      unit: MS_UNIT,
    },
  ],
  [
    'TTFB',
    {
      threshold: 2500,
      explainerURL: 'https://web.dev/time-to-first-byte/',
      unit: MS_UNIT,
    },
  ],
]);

const GENERAL_ATTRIBUTES = ['class', 'style'];
const CONFIG_ATTRIBUTES = ['show-unsupported'];

class WebVitals extends HTMLElement {
  constructor() {
    super();

    this.unsupportedMetrics = [];

    const metricAttributes = this.getAttributeNames()
      .filter(
        (attr) =>
          !GENERAL_ATTRIBUTES.includes(attr) &&
          !CONFIG_ATTRIBUTES.includes(attr)
      )
      .map((attr) => attr.toUpperCase());
    const metricList = metricAttributes.length
      ? metricAttributes
      : [...METRIC_CONFIG.keys()];

    this.metrics = this.getMetrics(metricList);
  }

  connectedCallback() {
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

  getMetrics(metricList) {
    return new Map(
      metricList.reduce((acc, metricName) => {
        // exclude metric when it's not support by web-vitals
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
            const { explainerURL, isFinal, threshold, unit, value } = metric;
            let classes = '';

            if (isFinal) {
              classes += 'is-final ';
              classes += value > threshold ? 'is-poor' : 'is-great';
            }

            return `
            <div class="${classes}">
              <dt><a href="${explainerURL}">${key}</a></dt>
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
