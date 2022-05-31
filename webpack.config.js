const {merge} = require('webpack-merge');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const commonConfig = {
  entry: {
    extension: {
      import: './src/background.ts',
      filename: 'background.js',
    },
    content: {
      import: './src/content_script/content_script.ts',
      filename: 'content_script/content_script.js',
    }
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: './src/manifest.json',
          to: './manifest.json',
        },
        {
          from: './src/icons',
          to: './assets/icons',
        }
      ],
    }),
  ],
  output: {
    clean: true,
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.d.ts$/,
        type: 'asset/source',
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /(node_modules|typedefs)/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    fallback: {
      stream: false,
      path: false,
      zlib: false,
      crypto: false,
      http: false,
      https: false,
      net: false,
      tls: false,
      fs: false,
      bufferutil: false,
      'utf-8-validate': false,
    },
  },
};

const devConfig = {
  mode: 'development',
  devtool: 'cheap-module-source-map',
};

const prodConfig = {
  mode: 'production',
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          mangle: {
            reserved: ['getElementSelector'],
          },
        },
      }),
    ],
  },
};

module.exports =
  process.env.NODE_ENV === 'production'
    ? merge(commonConfig, prodConfig)
    : merge(commonConfig, devConfig);
