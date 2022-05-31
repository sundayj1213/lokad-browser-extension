
# Lokad Firefox Extension

Easily communiate between browsers tabs.
## Build

To build this project run

```bash
  npm install && npm run build
```


## Run Locally

Clone the project

```bash
git clone https://yoodule@bitbucket.org/lokad/envisionplus.git
```

Go to the project directory

```bash
cd envisionplus
```

Install NPM dependencies

```bash
npm install && npm run serve
```

## Running Tests

To tests, run the following command

```bash
npm install && npm run serve
```

Copy inject.js from assets/js/inject.js & in your HTML file, add
```bash
<script src="inject.js"></script>
<script>
    const { LokadExtApp: ExtApp } = window;

    ExtApp.isEnabled().then(async enabled => {
        const channel = 'test-channel';
        
        console.log(`Is Extension Enabled:`, enabled);

        if(!enabled) return;

        const subscribed = await ExtApp.subscribe(channel, (message) => {
            console.log('message', message);
        });

        console.log(`Is Only Subscriber to Channel ${channel}:`, subscribed);

        const published = await ExtApp.publish(channel, {
            user: 'TestUser',
            data: `Here's a test from ${channel}`
        }, true);

        console.log(`Atleast One page Subscribed to Channel ${channel}:`, published);
    })
</script>
```

In your browser open developer tools, check the console and play around with tabs


## Authors

- [@Sunday Johnson](https://www.github.com/sundayj1213)


## Support

For support, email dev@yoodule.com

