# projeto-smartstock
# 📦 SmartStock — Sistema Inteligente de Gerenciamento de Estoque

## 📖 Sobre o Projeto

O **SmartStock** é um projeto de Trabalho de Conclusão de Curso (TCC), desenvolvido por cinco estudantes do curso técnico de **Análise e Desenvolvimento de Sistemas**, com o objetivo de criar uma solução tecnológica para modernizar, automatizar e otimizar o gerenciamento de estoques.

O projeto surgiu da necessidade de tornar o controle de produtos mais eficiente, organizado e confiável, reduzindo problemas comuns enfrentados por empresas e estabelecimentos comerciais, como divergências nas quantidades armazenadas, falta de produtos, dificuldades no acompanhamento de movimentações e falhas decorrentes de processos manuais.

Nossa proposta é desenvolver um sistema que reúna **desenvolvimento web, gerenciamento de dados e Internet das Coisas (IoT)**, permitindo que diferentes operações relacionadas ao estoque sejam realizadas de maneira centralizada e com maior precisão.

O SmartStock busca demonstrar como a aplicação de tecnologias modernas pode transformar atividades tradicionais de controle de estoque em processos mais inteligentes, acessíveis e eficientes.

---

## 🎯 Objetivo do Projeto

O principal objetivo do SmartStock é desenvolver uma plataforma de gerenciamento de estoque capaz de auxiliar empresas no controle de seus produtos, proporcionando maior organização, praticidade e confiabilidade das informações.

A solução busca facilitar o acompanhamento das quantidades disponíveis, o registro de movimentações e a identificação de situações que exigem atenção, como níveis reduzidos de determinados produtos.

Além disso, o projeto propõe explorar a utilização de dispositivos IoT para aproximar o ambiente físico do sistema digital, possibilitando novas formas de monitoramento e automação.

### Objetivos Específicos

- Desenvolver uma interface web intuitiva e de fácil utilização.
- Implementar mecanismos de autenticação e controle de acesso.
- Centralizar as informações relacionadas ao estoque.
- Possibilitar o cadastro e o gerenciamento de produtos.
- Permitir o acompanhamento das quantidades armazenadas.
- Organizar o registro de entradas e saídas de mercadorias.
- Reduzir erros associados ao controle manual de estoque.
- Explorar a integração entre software e dispositivos IoT.
- Disponibilizar informações que auxiliem a tomada de decisões.
- Aplicar conhecimentos de programação, banco de dados, desenvolvimento web e integração de sistemas.

---

## 💡 Problema que Buscamos Resolver

O gerenciamento inadequado de estoque pode gerar diversos problemas para uma empresa.

Em estabelecimentos que dependem de registros manuais ou sistemas pouco integrados, é comum encontrar dificuldades para identificar a quantidade real de produtos disponíveis.

Essas limitações podem causar:

- **Falta de produtos:** ausência de mercadorias necessárias para atender à demanda.
- **Excesso de estoque:** armazenamento de quantidades superiores às necessidades do estabelecimento.
- **Divergência de informações:** diferenças entre os registros do sistema e os produtos fisicamente armazenados.
- **Perda de produtividade:** tempo excessivo dedicado à conferência e atualização manual dos dados.
- **Dificuldade de organização:** falta de centralização das informações sobre os produtos.
- **Falhas operacionais:** registros incorretos de entradas, saídas e quantidades disponíveis.

O SmartStock foi idealizado para contribuir com a solução desses problemas, oferecendo um ambiente digital para organizar informações e apoiar o gerenciamento das operações de estoque.

---

## ⚙️ Como o SmartStock Funciona?

O SmartStock é estruturado em torno de uma aplicação web conectada a um servidor responsável pelo processamento das operações e ao banco de dados responsável pelo armazenamento das informações.

A proposta de funcionamento contempla as seguintes etapas:

**1. Acesso ao sistema**

O usuário acessa a interface web e utiliza suas credenciais para realizar a autenticação.

**2. Gerenciamento dos produtos**

O sistema disponibilizará funcionalidades para organizar as informações dos produtos cadastrados e suas respectivas quantidades.

**3. Controle das movimentações**

As operações de entrada e saída de mercadorias poderão ser registradas para manter o estoque atualizado.

**4. Armazenamento das informações**

Os dados serão processados pelo backend e armazenados em um banco de dados relacional, permitindo sua consulta e gerenciamento.

**5. Monitoramento do estoque**

A plataforma buscará oferecer recursos para acompanhar a disponibilidade dos produtos e identificar situações que necessitem de atenção.

**6. Integração com IoT**

A proposta também contempla a utilização de dispositivos conectados para explorar a coleta de informações do ambiente físico e sua comunicação com o sistema.

A implementação dessas funcionalidades ocorrerá progressivamente durante o desenvolvimento do projeto.

---

## 🚀 Funcionalidades do Sistema

O SmartStock está sendo desenvolvido para contemplar diferentes funcionalidades relacionadas à gestão de estoque.

### 🔐 Autenticação de Usuários

- Interface de login.
- Identificação de usuários por endereço de e-mail.
- Validação do formato dos e-mails informados.
- Integração entre a interface de autenticação e o backend.
- Controle de acesso às funcionalidades do sistema.

### 📦 Gerenciamento de Produtos

- Cadastro de produtos.
- Consulta dos produtos armazenados.
- Atualização das informações cadastradas.
- Organização dos registros de estoque.
- Controle das quantidades disponíveis.

### 📊 Controle de Estoque

- Registro de entrada de produtos.
- Registro de saída de produtos.
- Atualização das quantidades armazenadas.
- Acompanhamento da disponibilidade dos itens.
- Identificação de produtos com estoque reduzido.

### 🌐 Integração com IoT

- Estudo e implementação da comunicação entre dispositivos físicos e o sistema.
- Possibilidade de coleta automatizada de informações.
- Integração dos dados coletados com a aplicação.
- Exploração de mecanismos inteligentes de monitoramento de estoque.

**Observação:** As funcionalidades descritas representam o escopo de desenvolvimento do SmartStock. Nem todos os recursos estão implementados na versão atual.

---

## 🛠️ Tecnologias Utilizadas

O projeto utiliza diferentes tecnologias para organizar o desenvolvimento da aplicação e possibilitar a comunicação entre seus componentes.

### ☕ Java

Linguagem de programação utilizada no desenvolvimento do backend, responsável pela implementação das regras de negócio e pelo processamento das operações do sistema.

### 🍃 Spring Boot

Framework utilizado para estruturar a aplicação backend em Java, facilitando a criação de serviços, a organização dos componentes e a integração com outras partes do sistema.

### 🗄️ MySQL

Sistema de gerenciamento de banco de dados relacional utilizado para armazenar e organizar as informações da aplicação, incluindo os registros de usuários.

### 🌐 Desenvolvimento Web

O frontend é responsável pela interface de interação entre o usuário e o SmartStock.

Por meio dele, os usuários poderão acessar as funcionalidades disponibilizadas pelo sistema, visualizar informações e realizar operações relacionadas ao gerenciamento de estoque.

### 🔌 Internet das Coisas (IoT)

A Internet das Coisas faz parte da proposta tecnológica do SmartStock, permitindo explorar a integração entre componentes físicos e digitais.

Seu objetivo no projeto é investigar possibilidades de automação e monitoramento que contribuam para melhorar a eficiência do controle de estoque.

---

## 🏗️ Arquitetura do Sistema

A organização do SmartStock contempla diferentes componentes que trabalham de maneira integrada.

### Frontend — Interface do Usuário

Responsável por apresentar as informações do sistema e permitir a interação com suas funcionalidades.

### Backend — Processamento e Regras de Negócio

Desenvolvido com Java e Spring Boot, é responsável por processar requisições, aplicar as regras de negócio e realizar a comunicação com o banco de dados.

### Banco de Dados — Persistência das Informações

Utiliza o MySQL para armazenar os dados necessários ao funcionamento da plataforma.

### Dispositivos IoT — Integração Física

Componente previsto na proposta do projeto, destinado à exploração de mecanismos de comunicação entre dispositivos físicos e o software.

### Fluxo Geral da Aplicação

```text
               SMARTSTOCK
                   |
                   v
          +-----------------+
          |    FRONTEND     |
          |  Interface Web  |
          +-----------------+
                   |
                   v
          +-----------------+
          |     BACKEND     |
          | Java/Spring Boot|
          +-----------------+
                   |
                   v
          +-----------------+
          |  BANCO DE DADOS |
          |      MySQL      |
          +-----------------+

       INTEGRAÇÃO IOT PROPOSTA
                   |
                   v
          +-----------------+
          | DISPOSITIVOS IOT|
          +-----------------+
                   |
                   v
          +-----------------+
          |     BACKEND     |
          +-----------------+
```

Essa separação busca facilitar a manutenção do sistema, a organização do código e a evolução das funcionalidades.

---

## 🧠 Diferenciais do SmartStock

O SmartStock pretende ir além de um sistema convencional de cadastro de produtos.

Entre os principais diferenciais propostos estão:

**1. Centralização das informações**

Reunir dados relacionados ao estoque em uma única plataforma, facilitando o gerenciamento e a consulta.

**2. Integração entre software e hardware**

Explorar a utilização de tecnologias IoT para conectar processos físicos e digitais.

**3. Facilidade de utilização**

Desenvolver uma interface que permita realizar operações de maneira simples e organizada.

**4. Redução de falhas operacionais**

Contribuir para diminuir divergências de informação e erros associados ao gerenciamento manual.

**5. Possibilidade de expansão**

Estruturar o projeto para permitir a implementação de novas funcionalidades conforme sua evolução.

**6. Aplicação prática de conhecimentos técnicos**

Integrar conceitos de desenvolvimento frontend, backend, modelagem de dados, comunicação entre sistemas e Internet das Coisas.

---

## 👥 Equipe de Desenvolvimento

O SmartStock é desenvolvido pelos estudantes:

| Integrante | Participação |
|---|---|
| **Paulo Rogério** | Integrante da equipe de desenvolvimento |
| **Renan Pereira Agantes** | Integrante da equipe de desenvolvimento |
| **Murillo Henrique** | Integrante da equipe de desenvolvimento |
| **Marcelo Henrique** | Integrante da equipe de desenvolvimento |
| **Matheus de Souza** | Integrante da equipe de desenvolvimento |

O projeto é resultado de um trabalho colaborativo que envolve planejamento, pesquisa, análise de requisitos, desenvolvimento de software, integração de tecnologias, realização de testes e documentação.

Cada integrante contribui para a construção e o aperfeiçoamento do sistema, aplicando os conhecimentos adquiridos durante a formação técnica.

---

## 🎓 Contexto Acadêmico

O SmartStock é desenvolvido como **Trabalho de Conclusão de Curso (TCC)** do curso técnico de Análise e Desenvolvimento de Sistemas.

O projeto representa uma oportunidade de colocar em prática os conhecimentos adquiridos durante o curso, abordando diferentes etapas do ciclo de desenvolvimento de software.

Entre as competências trabalhadas estão:

- Levantamento e análise de requisitos.
- Planejamento e organização de projetos.
- Desenvolvimento de aplicações web.
- Programação orientada a objetos.
- Desenvolvimento backend com Java.
- Utilização do framework Spring Boot.
- Modelagem e manipulação de bancos de dados relacionais.
- Integração entre frontend e backend.
- Validação de dados e autenticação.
- Testes e identificação de erros.
- Documentação técnica.
- Trabalho colaborativo.
- Aplicação de conceitos de Internet das Coisas.

Além de atender aos objetivos acadêmicos, o SmartStock busca representar uma solução baseada em necessidades reais encontradas no gerenciamento de estoques.

---

## 📈 Benefícios Esperados

Com o desenvolvimento da solução, esperamos proporcionar:

- Maior organização dos processos de estoque.
- Facilidade para consultar informações de produtos.
- Melhor acompanhamento das movimentações.
- Redução de erros operacionais.
- Maior confiabilidade dos registros.
- Economia de tempo em atividades administrativas.
- Possibilidades de automação por meio de IoT.
- Apoio à tomada de decisões relacionadas ao armazenamento e à reposição de mercadorias.

Esses benefícios representam os resultados pretendidos com a implementação e a validação do sistema.

---

## 🚧 Status do Projeto

**Status atual: Em desenvolvimento.**

O SmartStock está sendo construído progressivamente, com foco na implementação, integração e validação de seus componentes.

As atividades de desenvolvimento incluem a construção da interface web, a estruturação do backend em Java com Spring Boot e a utilização do MySQL para persistência dos dados.

Entre os trabalhos já realizados estão a implementação inicial da interface de login, a validação do formato de e-mail e a preparação da integração com o backend.

As funcionalidades de gerenciamento de estoque e a integração com dispositivos IoT fazem parte da evolução planejada da aplicação.

---

## 🔮 Perspectivas Futuras

Conforme o avanço do desenvolvimento, o SmartStock poderá receber novas funcionalidades e melhorias.

Entre as possibilidades de evolução estão:

- Painéis de acompanhamento com indicadores de estoque.
- Relatórios de movimentação de produtos.
- Alertas automáticos para quantidades mínimas.
- Histórico detalhado de operações.
- Diferentes níveis de permissão para usuários.
- Ampliação dos recursos de integração com IoT.
- Recursos de análise de dados para apoiar decisões.
- Melhorias contínuas de desempenho, segurança e usabilidade.

A implementação dependerá das prioridades, dos requisitos e da viabilidade técnica durante a evolução do projeto.

---

## ✅ Considerações Finais

O **SmartStock** representa a união entre tecnologia, inovação e aplicação prática dos conhecimentos desenvolvidos ao longo do curso técnico de Análise e Desenvolvimento de Sistemas.

Mais do que uma atividade acadêmica, o projeto busca demonstrar como soluções digitais podem contribuir para resolver problemas presentes no cotidiano de empresas e estabelecimentos comerciais.

Por meio da combinação entre desenvolvimento web, Java, Spring Boot, MySQL e conceitos de Internet das Coisas, nossa equipe pretende construir uma solução que torne o gerenciamento de estoque mais organizado, confiável e eficiente.

O desenvolvimento do SmartStock também representa uma experiência de aprendizado coletivo, envolvendo desafios técnicos, colaboração, resolução de problemas e aprimoramento contínuo.

**SmartStock — Tecnologia e inteligência para uma gestão de estoque mais eficiente.**

---

**Desenvolvido por:** Paulo Rogério, Renan Pereira Agantes, Murillo Henrique, Marcelo Henrique e Matheus de Souza.

**Projeto:** SmartStock

**Categoria:** Trabalho de Conclusão de Curso (TCC)

**Curso:** Técnico em Análise e Desenvolvimento de Sistemas

**Situação:** Em desenvolvimento

