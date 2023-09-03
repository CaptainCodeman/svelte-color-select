# Svelte Color Select

Okhsv Color Selection component for Svelte using OKLab perceptual colorspace.

Based on the work of [Björn Ottosson](https://bottosson.github.io/) and adapted to work as a Svelte component. See [Okhsv and Okhsl - Two new color spaces for color picking](https://bottosson.github.io/posts/colorpicker/) for more information about Okhsv and Oklab.

![Okhsv color select screenshot](./screenshot.png)

## Usage

Installing your package manager of choice:

    pnpm i svelte-color-select

Import into your component and pass an `{ r, g, b }` object to the `rgb` prop (with channels normalized 0–1):

```svelte
<script lang="ts">
  import ColorSelect from 'svelte-color-select'

  // https://medium.com/@valgaze/the-hidden-purple-memorial-in-your-web-browser-7d84813bb416
  let rgb: RGB = { r: 0.4, g: 0.2, b: 0.6 }
</script>

<ColorSelect bind:rgb />
```

### Oklab

The [Oklab](https://bottosson.github.io/posts/oklab/) colorspace is supported by using a `oklab` prop instead of `rgb`:

```svelte
<script lang="ts">
  import ColorSelect, { type Oklab } from 'svelte-color-select'

  let oklab: OKlab = { l: 0.44, a: 0.088, b: -0.134 }
</script>

<ColorSelect bind:oklab />
```

### Okhsv

The [Okhsv](https://bottosson.github.io/posts/colorpicker/) colorspace is supported by using a `okhsv` prop instead of `rgb`:

```svelte
<script lang="ts">
  import ColorSelect, { type OKhsv } from 'svelte-color-select'

  let okhsv: OKhsv = { h: 303.37, s: 0.806, v: 0.608 }
</script>

<ColorSelect bind:okhsv />
```
