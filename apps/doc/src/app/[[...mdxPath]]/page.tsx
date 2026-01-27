// src/app/[...mdxPath]/page.tsx
import {useMDXComponents as getMDXComponents} from '@/mdx-components';
import {generateStaticParamsFor, importPage} from 'nextra/pages';

export const generateStaticParams = generateStaticParamsFor('mdxPath');

export default async function Page(props: {params: Promise<{mdxPath?: string[]}>}) {
  // 1. RESOLVE a Promise do params (Obrigatório no Next.js 15+)
  const {mdxPath = []} = await props.params;

  // 2. Importa a página com o caminho garantido
  const {default: MDXContent, ...wrapperProps} = await importPage(mdxPath);

  // 3. Pega os seus componentes customizados
  const components = getMDXComponents({});
  const Wrapper = components.wrapper;

  return (
    <Wrapper {...wrapperProps}>
      {/* 4. INJETA os componentes no motor de renderização */}
      <MDXContent components={components} />
    </Wrapper>
  );
}
