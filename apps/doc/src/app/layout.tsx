import {Layout, Navbar} from 'nextra-theme-docs';
import {Head} from 'nextra/components';
import {getPageMap} from 'nextra/page-map';
import './globals.css';

export const metadata = {};

const navbar = <Navbar logo={<b>Investor</b>} />;

export default async function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head />
      <body>
        <Layout
          navbar={navbar}
          sidebar={{autoCollapse: true}}
          pageMap={await getPageMap()}
          nextThemes={{defaultTheme: 'dark'}}
          docsRepositoryBase="https://github.com/leandroluk/investor/apps/doc"
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
