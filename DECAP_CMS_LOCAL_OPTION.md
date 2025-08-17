# Option 2: Serving Decap CMS Locally

If you prefer to serve Decap CMS locally instead of using the CDN, follow these steps:

## Install the correct package

```bash
# Remove the incorrect package
bun remove decap-cms-app

# Install the bundled version
bun add decap-cms
```

## Update package.json

Add a prebuild script to copy the bundled file:

```json
{
  "scripts": {
    "dev": "astro dev",
    "prebuild": "cp node_modules/decap-cms/dist/decap-cms.js public/admin/decap-cms.js",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro"
  }
}
```

## Update public/admin/index.html

Change the script tag back to local:

```html
<body>
  <!-- Include locally served Decap CMS -->
  <script src="/admin/decap-cms.js"></script>
</body>
```

## Run the build

```bash
bun run build
```

## Why the difference?

- **decap-cms**: Complete bundle with all dependencies, suitable for script tag inclusion
- **decap-cms-app**: ES module version for bundler environments, requires React/ReactDOM

The error you encountered was because `decap-cms-app` expects to be imported and initialized in a bundler environment, not loaded directly via script tag.