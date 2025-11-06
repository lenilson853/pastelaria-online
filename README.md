# 🚀 Pastel Frito na Hora! - Cardápio Digital com Admin

Este é um sistema web completo de cardápio digital e pedidos para a lanchonete "Pastel Frito na Hora!". O projeto foi desenvolvido para ser 100% gerenciável pelo dono da lanchonete, utilizando apenas um celular e o aplicativo do Google Sheets como painel de controle.

O cliente pode navegar pelo cardápio, montar um pastel com sabores customizados, adicionar bebidas, e finalizar o pedido diretamente no WhatsApp do estabelecimento, já com a taxa de entrega ou retirada calculada.

🟢 **Status:** Projeto concluído e pronto para deploy!

---

## ✨ Funcionalidades Principais

* **Cardápio Dinâmico:** O cardápio é carregado em tempo real a partir de uma planilha do Google Sheets.
* **Controle de Estoque:** O dono pode remover/adicionar itens do cardápio (sabores e bebidas) apenas mudando uma célula na planilha de "Sim" para "Não".
* **Montagem de Pastel Customizado:** Lógica de negócio complexa que permite ao cliente montar um pastel com 4 sabores por um preço base (R$ 6,00) e adiciona um valor extra (R$ 1,00) para cada sabor adicional.
* **Carrinho de Compras:** Um carrinho de compras completo onde o cliente pode ajustar quantidades ou remover itens.
* **Checkout Inteligente:**
    * Cálculo de Subtotal.
    * Opção de **Retirada no Local** (sem taxa).
    * Opção de **Entrega/Delivery** (com taxa de R$ 2,00).
    * Oculta o campo de endereço se o cliente escolher "Retirada".
* **Integração com WhatsApp:** Ao finalizar, o sistema formata uma mensagem completa com todos os dados (Cliente, Endereço, Pedido, Total) e abre o WhatsApp.
* **Design 100% Responsivo:** Funciona perfeitamente em celulares, tablets e computadores.

---

## 🏛️ Arquitetura do Sistema

Este projeto utiliza uma arquitetura "desacoplada" (headless) moderna, que separa o site (Frontend) do painel de controle (Backend), garantindo flexibilidade e facilidade de uso para o cliente.

* **Frontend (O Site):** Construído com **HTML5, CSS3 e JavaScript (ES6+)**. O site é "burro"; ele não guarda nenhum item de cardápio. Ele é responsável apenas por *mostrar* os dados e *processar* o pedido.
    * **Hospedagem:** **Vercel**.

* **Backend (O "Admin"):** Uma **Planilha Google (Google Sheets)** serve como um CMS (Sistema de Gerenciamento de Conteúdo) leve e acessível.
    * **Como?** O `script.js` do site usa a função `fetch()` para ler um link `.csv` público gerado pela planilha (`Arquivo > Compartilhar > Publicar na Web`).
    * **Vantagem:** O cliente só precisa de um celular com o app "Planilhas" para gerenciar todo o seu estoque em tempo real.

---

## 📱 Painel Admin (Guia para o Dono da Lanchonete)

Para gerenciar o cardápio, o dono da lanchonete precisa apenas de:
1.  Um celular com o app **"Planilhas Google"**.
2.  Acesso de **"Editor"** à planilha do cardápio (compartilhada pelo desenvolvedor).

### Como Remover um Item do Cardápio:

1.  Abra o app "Planilhas" no seu celular.
2.  Abra a planilha `Cardápio - Pastel Frito na Hora`.
3.  Encontre o item que acabou (ex: "Bacon" ou "Coca-Cola").
4.  Na coluna **`Estoque`** desse item, apague o `Sim` e escreva **`Não`**.
5.  Feche o aplicativo (o Google salva automaticamente).

**AVISO IMPORTANTE:** O Google demora cerca de **5 MINUTOS** para atualizar o link público. Após mudar o estoque, o item pode levar até 5 minutos para sumir do site.

### Estrutura da Planilha:

A planilha *deve* seguir esta estrutura de colunas para o site funcionar:

| Nome | Tipo | Preco | Estoque |
| :--- | :--- | :--- | :--- |
| Pizza | Pastel | | Sim |
| Coca-Cola | Bebida | 5.00 | Sim |
| ... | ... | ... | Não |

---

## 💻 Como Executar o Projeto Localmente

1.  Clone este repositório: `git clone [URL_DO_REPOSITORIO]`
2.  Abra a pasta do projeto no VS Code.
3.  **IMPORTANTE:** Este projeto usa `fetch()` para ler uma API (a planilha). Ele **não vai funcionar** se você apenas abrir o `index.html` (protocolo `file://`).
4.  Você **precisa** servi-lo. A forma mais fácil é usando a extensão **"Live Server"** do VS Code.
5.  Clique com o botão direito no `index.html` e escolha `Open with Live Server`.