// src/app/layout.tsx
import './globals.css';

import {Footer, Layout, Navbar} from 'nextra-theme-docs';
import 'nextra-theme-docs/style.css';
import {Head} from 'nextra/components';
import {getPageMap} from 'nextra/page-map';

export const metadata = {};

const navbar = <Navbar logo={<b>Investor</b>} />;

const footer = <Footer>MIT {new Date().getFullYear()} © Investor.</Footer>;

export default async function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head />
      <body>
        <Layout
          navbar={navbar}
          sidebar={{autoCollapse: true}}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/leandroluk/investor/apps/doc"
          footer={footer}
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
