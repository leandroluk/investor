> EXTREMAMENTE IMPORTANTE!: EM TODAS AS ETAPAS NUMERADAS PEÇA A APROVAÇÃO DO USUÁRIO PARA SEGUIR PARA A PRÓXIMA ETAPA

# Prompt de Implementação de Use Case

Este prompt define o fluxo de trabalho para implementar novos casos de uso no projeto. O agente deve seguir rigorosamente as etapas abaixo.

## 1. Análise de Contexto

Antes de iniciar qualquer interação, o agente deve analisar:

*   **Insight que deu origem ao projeto**: @[insight.md] - Entender os motivos da criação do projeto que servira para portifólio demonstrando DDD com NestJS bem aplicado com tracing, events, integração com estruturas externas, documentação e boas práticas
*   **Contexto do Sistema**: @[cs.md] - Identificar quais casos de uso estão pendentes (marcados com `⛔`).
*   **Modelo de Dados**: @[er.mermaid] - Compreender as entidades, relacionamentos e atributos envolvidos.

## 2. Definição do Caso de Uso

O agente deve solicitar ao usuário qual o próximo caso de uso a ser implementado, caso não tenha sido informado. O usuário deve fornecer:
*   Regra de negócio. ex [auth] register user using email and password
*   Cenários de sucesso e falha esperados.

## 3. Inferência de Documentação

Com base no caso de uso definido, o agente deve **inferir** a documentação da API seguindo o padrão existente em @[control/doc].

*   **Localização**: `apps/doc/src/content/use-cases-(api|web)/<context>/<use-case>.mdx`. já criei os diretórios que provavelmente serão criados os arquivos com apenas um "index.mdx", quando ouver algum usecase dentro deles remova o gitkeep pois não será mais necessários.
*   **Formato**: MDX com Frontmatter.
*   **Estrutura Esperada**:
    *   Título e Descrição.
    *   Regras e Validações.
    *   Request (Método, Path, Parâmetros).
    *   Diagrama Mermaid do fluxo de execução do caso de uso com base no contexto. (nota: todos os textos dentro do markdown precisam estar em aspas duplas pra evitar erros de formatação no mermaid). 
    *   Success Case (Status, Body).
    *   Error Case (Status, Body com código e mensagem).

    Além disso existe um componente chamado <MermaidZoom> que deve englobar todos os diagramas mermaid para ajustar o tamanho dos blocos, ex:
    ```mdx
    ---
    title: Example
    ---
    import {MermaidZoom} from '#/components/molecules/MermaidZoom'

    ## Rules

    - ...

    ## Request

    - ...

    ## Diagram

    <MermaidZoom>
    ```mermaid
    flowchart TD
      A["Client"] -- "{METHOD} {PATH}" --> B["API"]
      ...
    ```
    </MermaidZoom>

    ## Success Case

    - ...

    ## Error Case

    - ...

    ```

O agente deve apresentar o conteúdo do arquivo `.mdx` proposto ao usuário para aprovação **antes** de criar o arquivo.

## 4. Implementação na API

Após a aprovação da documentação pelo usuário, o agente deve implementar o caso de uso em @[apps/api] seguindo a arquitetura DDD Layered.

### Arquivos e Estrutura

os diretórios deverão ser perguntados ao usuário

1.  **Use Case (Application Layer)**:
    *   Diretório: `apps/api/src/application/<context>/<command|query|saga>/*.ts`
    *   **Handler** (`<use_case>.ts`): Implementar a lógica de negócio, injetando repositórios e devolvendo erros de domínio ou sucesso. A assinatura deve ser conforme os arquivos em @[apps/api/src/application]
    *   **Validação**: Utilizar a biblioteca *zod* para validar o struct de entrada. Para facilitar mantenha o schema dentro de uma propriedade interna da classe e execute no new da classe como nesse exemplo
        ```ts
        export class HealthQuery extends Query {}
        export class HealthQueryResult {
            @ApiProperty({ description: "..." })
            uptime!: string
        }
        @QueryHandler(HealthQuery)
        export class HealthQueryHandler implements IQueryHandler<HealthQuery, HealthQueryResult> {
            constructor ( ... ) {}
            async execute(query: HealthQuery): Promise<HealthQueryResult> { ... }
        }
        ```
    *   Estamos usando o nestjs para garantir a injeção de dependência então lembre-se dos modules e que eles precisam exportar informações como por exemplo
        ```ts
        const providers = [HealthQueryHandler]

        @Module({
            imports: [ ... ],
            providers,
            exports: providers
        })
2.  **Registro da Rota (Presentation Layer)**:
    *   Arquivo: `apps/api/src/presentation/http/<context>/<context>.controller.ts` implementando swagger e prevendo os tipos.
    *   Associar o método HTTP e URL ao do caso de uso criado.
    *   fazer a implementação com injeção direta do (Command|Query)Bus do NestJS, sem extender classe base.
        ```ts
        import {ExampleCommand} from '#/application/example/command';
        import {Controller, Post, Req} from '@nestjs/common';
        import {CommandBus} from '@nestjs/cqrs';
        import {ApiTags} from '@nestjs/swagger';
        import {ApiDomainResponse, GetDomainEvent} from '../_shared/decorator';
        import {ExampleRequest} from './request';
        import {ExampleResponse} from './response';

        @ApiTags('example')
        @Controller('example')
        export class ExampleController {
          constructor(private readonly commandBus: CommandBus) {}
          
          @Post('example')
          @ApiDomainResponse(SomeError)
          async postExample(
            @Req() {params: {id}, body: changes}: ExampleRequest,
            @GetDomainEvent() domainEvent: DomainEvent
          ): Promise<ExampleResponse> {
            return await this.commandBus.execute(new ExampleCommand({...domainEvent, id, changes}));
          }
        }
        ```    
        
        > nota, veja que temos o ExampleRequest, ele seria uma estrutura baseada no request que viria do front, e multi nivel para evitar o uso de @Query, @Body, @Header, @Param que não da pra ter uma declarativa mais objetiva

        ```ts
        import { ApiProperty } from '@nestjs/swagger';
        import { ApiEntityProperty } from '../../_shared/decorator';
        import { UserEntity } from '#/domain/account/entity';

        export class RegisterUserParams {
          @ApiEntityProperty(UserEntity, 'id')
          readonly userId!: string;
        }

        export class RegisterUserBody {
          @ApiProperty({ example: 'investor@example.com', description: 'User email' })
          readonly email!: string;

          @ApiProperty({ example: 'Test@123', description: 'Plain text password' })
          readonly password!: string;

          @ApiProperty({ example: 'en', description: 'ISO 639-1 language code' })
          readonly language!: string;

          @ApiProperty({ example: 'America/Sao_Paulo', description: 'IANA Timezone' })
          readonly timezone!: string;
        }

        export class RegisterUserRequest {
          @ApiProperty({ type: RegisterUserParams })
          readonly params!: RegisterUserParams;

          @ApiProperty({ type: RegisterUserBody })
          readonly body!: RegisterUserBody;
        }
        ```

## Exemplo de Fluxo

1.  **Agente**: "Analisei o `cs.md`. Qual caso de uso deseja implementar? Ex: `register account`."
2.  **Usuário**: "Quero fazer o register account. Recebe email/senha, cria conta, retorna 201."
3.  **Agente**: "Proponho a seguinte documentação em `doc/src/content/use-cases-api/auth/register-account.mdx`: [Conteúdo MDX]. Aprova?"
4.  **Usuário**: "Sim."
5.  **Agente**: "Implementando `<context>/application/<query|command>/<use-case (incluindo query, handler e result)>.ts`. Analise se ficou como esperado"
6.  **Usuário**: "Sim."
7.  **Agente**: "Implementando `<context>/presentation/http/<context>.controller.ts`." com os modelos de request no `apps/api/src/presentation/http/<context>/request/` (usando index.ts). Analise se ficou ok
8.  **Usuário**: "Sim."


---
**Nota**: Mantenha a consistência com os padrões de código (Go para backend, Typescript/MDX para docs) e nomenclaturas existentes no projeto e não esqueça de escrever código, comentários e documentação em inglês.

**OBSERVAÇÃO:** ESSE IMPLEMENTATION PLAN NÃO DEVE SER MODIFICADO ELE É A REFERENCIA DE COMO DEVE SER FEITO