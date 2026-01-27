// src/mdx-components.tsx
import {MermaidZoom} from '@/components/molecules/MermaidZoom';
import {useMDXComponents as getThemeComponents} from 'nextra-theme-docs';

export function useMDXComponents(components: any): any {
  const themeComponents = getThemeComponents();
  const NextraMermaid = (themeComponents as any).Mermaid;

  const CustomMermaid = (props: any) => (
    <MermaidZoom>{NextraMermaid ? <NextraMermaid {...props} /> : <div className="mermaid" {...props} />}</MermaidZoom>
  );

  return {
    ...themeComponents,
    ...components,
    Mermaid: CustomMermaid,
    mermaid: CustomMermaid,
    pre: (props: any) => {
      if (props['data-language'] === 'mermaid' || props.children?.props?.className?.includes('language-mermaid')) {
        return <CustomMermaid {...props} />;
      }
      return themeComponents.pre ? <themeComponents.pre {...props} /> : <pre {...props} />;
    },
  };
}
