// get prod argument to check the build is production
const production = process.argv[2] == 'prod';

// bundling the apps 🎁️
require('esbuild').buildSync({
  entryPoints: ['src/main.js'],
  bundle: true,
  format: 'iife',
  minify: production,
  sourcemap: !production,
  target: ['chrome58', 'firefox57', 'safari11', 'edge16'],
  outfile: 'public/build/app.js',
})

console.log('Build done 🔥️')