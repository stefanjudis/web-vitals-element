import * as webVitals from 'web-vitals';

const MS_UNIT = 'ms';

// borrowed from the vitals extension
// https://github.com/GoogleChrome/web-vitals-extension/blob/master/src/browser_action/vitals.js#L20-L23
const METRIC_CONFIG = new Map([
  [
    'LCP',
    { threshold: 2500, explainerURL: 'https://web.dev/lcp/', unit: MS_UNIT },
  ],
  [
    'FID',
    { threshold: 100, explainerURL: 'https://web.dev/fid/', unit: MS_UNIT },
  ],
  ['CLS', { threshold: 0.1, explainerURL: 'https://web.dev/cls/' }],
  // todo check the thresholds for the following
  [
    'FCP',
    { threshold: 2500, explainerURL: 'https://web.dev/fcp/', unit: MS_UNIT },
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

class WebVitals extends HTMLElement {
  constructor() {
    super();

    const allowedAttributes = ['class', 'style'];
    const metricAttributes = this.getAttributeNames()
      .filter((attr) => !allowedAttributes.includes(attr))
      .map((attr) => attr.toUpperCase());
    const metricList = metricAttributes.length
      ? metricAttributes
      : ['CLS', 'FID', 'LCP', 'FCP', 'TTFB'];

    this.metrics = new Map(
      metricList.reduce((acc, metricName) => {
        const getValue = webVitals[`get${metricName}`];
        if (!getValue) {
          console.error(`${metricName} is not supported by '<web-vitals />'`);
          return acc;
        }

        return [
          ...acc,
          [
            metricName,
            { ...METRIC_CONFIG.get(metricName), getValue, name: metricName },
          ],
        ];
      }, [])
    );
  }

  connectedCallback() {
    this.render();

    for (let metricConfig of this.metrics.values()) {
      const { name, getValue } = metricConfig;
      getValue((metric) => {
        this.metrics.set(name, { ...metricConfig, ...metric });
        this.render();
      }, true);
    }
  }

  render() {
    console.log(this.metrics);
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
    </div>`;
  }
}

export default WebVitals;
