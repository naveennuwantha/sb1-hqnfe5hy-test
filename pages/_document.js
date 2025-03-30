import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';
import { AppRegistry } from 'react-native-web';

// Force Next-generated DOM elements to fill their parent's height
const normalizeNextElements = `
  html, body, #__next {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    margin: 0;
    padding: 0;
  }
`;

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    AppRegistry.registerComponent('Main', () => Main);
    const { getStyleElement } = AppRegistry.getApplication('Main', {});
    const originalRenderPage = ctx.renderPage;

    ctx.renderPage = () =>
      originalRenderPage({
        enhanceApp: (App) => App,
      });

    const initialProps = await Document.getInitialProps(ctx);

    const styles = [
      <style key="normalize" dangerouslySetInnerHTML={{ __html: normalizeNextElements }} />,
      getStyleElement(),
    ];

    return {
      ...initialProps,
      styles: React.Children.toArray([
        ...initialProps.styles,
        ...styles,
      ]),
    };
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          {/* Content Security Policy meta tag */}
          <meta
            httpEquiv="Content-Security-Policy"
            content="default-src 'self'; font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net/npm/@expo/vector-icons@* data:; img-src 'self' https://*.supabase.co https://swhcrbyvnaadvuexfjpz.supabase.co data: blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' https://*.supabase.co https://*.supabase.in https://fonts.googleapis.com https://fonts.gstatic.com https://generativelanguage.googleapis.com https://cdn.jsdelivr.net; worker-src 'self' blob:;"
          />
          <meta charSet="utf-8" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <meta name="theme-color" content="#0066cc" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          {/* Fonts should be added in _document.js, not with next/head */}
          <link 
            href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" 
            rel="stylesheet"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument; 