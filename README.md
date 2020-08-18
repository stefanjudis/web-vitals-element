# web-vitals-element

> Bring [web vitals](https://github.com/GoogleChrome/web-vitals) quickly into your page using custom elements

![web-vitals-element in styled and unstyled version](./screenshot.png)

## Basic usage

```
<!-- Include the custom element script -->

<!-- Unstyled 👇 -->
<script src="node_modules/web-vitals-element/dist/web-vitals-element.min.js"></script>

<!-- Styled 👇 -->
<script src="node_modules/web-vitals-element/dist/web-vitals-element.styled.min.js"></script>
```

Use the element:

```
<!-- Basic usage -->
<web-vitals />

<!-- Define the metrics you care about -->
<web-vitals cls fcp fid lcp ttfb />

<!-- Show message about not support metrics -->
<web-vitals show-unsupported />
```

## Code of conduct

This project underlies [a code of conduct](./CODE-OF-CONDUCT.md).

## License

This project is released under [MIT license](./LICENSE).
