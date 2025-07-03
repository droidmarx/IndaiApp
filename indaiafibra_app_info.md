
# Informações da Aplicação IndaiaFibra

Esta aplicação é uma ferramenta de gerenciamento para técnicos de campo da IndaiaFibra, permitindo o registro de instalações e manutenções, controle de materiais, histórico de serviços e visualização de mapas.

## Funcionalidades Principais:

- **Registro de Instalação:** Permite registrar detalhes de novas instalações, incluindo informações do cliente, CTO, porta, sinais de CTO e cliente, e materiais utilizados.
- **Registro de Manutenção:** Para registrar serviços de manutenção, com descrição do problema, solução aplicada e materiais utilizados.
- **Validação de Sinal:** Alerta visual e toast quando a diferença entre o sinal da CTO e do cliente for maior que 2 dBm.
- **Busca de Localização:** Busca de endereço por nome de rua com sugestões em tempo real e atualização automática do mapa.
- **Clique no Mapa:** Permite clicar no mapa para obter e preencher automaticamente o endereço.
- **Gerenciamento de Materiais:** Adição, edição e remoção de materiais, com controle de estoque.
- **Histórico de Serviços:** Visualização e filtragem de todos os registros de instalação e manutenção.
- **Relatórios:** Gráficos e estatísticas sobre instalações e uso de materiais.
- **Cópia de Mensagem:** Geração de mensagem formatada para Telegram com informações do serviço e link do Google Maps, com cópia automática para a área de transferência.
- **Redirecionamento para Telegram:** Após copiar a mensagem, o aplicativo redireciona automaticamente para o grupo do Telegram.
- **Modo Escuro:** Opção para alternar entre tema claro e escuro.
- **Feedback Tátil:** Vibração em interações para melhor experiência do usuário.
- **Gestos de Navegação:** Deslizar para navegar entre as abas.
- **Status Online/Offline:** Detecção e notificação de status de conexão.

## Tecnologias Utilizadas:

- **HTML5:** Estrutura da aplicação.
- **CSS3:** Estilização, incluindo variáveis CSS para temas e animações.
- **JavaScript (ES6+):** Lógica de programação, manipulação do DOM, interações.
- **Leaflet.js:** Biblioteca para mapas interativos.
- **OpenStreetMap Nominatim API:** Para geocodificação reversa e busca de endereços.
- **Chart.js:** Para geração de gráficos nos relatórios.
- **Local Storage:** Para persistência de dados (materiais, histórico, configurações).
- **Web APIs:** Geolocation API, Notification API, Vibration API, Clipboard API.

## Estrutura de Arquivos:

- `index.html`: Estrutura principal da aplicação.
- `style.css`: Folha de estilos CSS.
- `script.js`: Lógica JavaScript da aplicação.
- `indaiafibra_app_info.md`: Este arquivo de informações.

## Como Usar:

1. **Preencher Formulários:** Navegue entre as abas (Instalação, Manutenção) e preencha os campos necessários.
2. **Gerenciar Materiais:** Na aba 'Materiais', adicione ou edite os itens em estoque.
3. **Visualizar Histórico e Relatórios:** Acesse as abas correspondentes para ver os dados.
4. **Enviar Mensagem:** Após preencher um formulário de instalação ou manutenção, clique em 'Enviar para Telegram' para copiar a mensagem formatada e ser redirecionado.
5. **Configurações:** Personalize o tema, notificações e feedback tátil na aba 'Ajustes'.

---

**Desenvolvido por Manus AI**

