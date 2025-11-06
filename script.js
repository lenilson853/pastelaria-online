document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURAÇÃO ---
    const numeroWhatsApp = "5581991251583"; 
    const taxaDeEntrega = 2.00;
    // Link da sua planilha
    const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQHC-Br97ylD79ttDTEtPmRQ2KLm5BbGu79cJjofNIrJYM-rALvrLOjDE-_QZpHpaxtLR38eRd4kqjd/pub?output=csv';

    // --- LÓGICA DE PREÇO DO PASTEL ---
    const pastelPrecoBase = 6.00;
    const saboresGratis = 4;
    const precoPorSaborExtra = 1.00;

    // --- BASE DE DADOS (Vem da Planilha) ---
    let menuSabores = [];
    let menuBebidas = [];

    // --- ESTADO DA APLICAÇÃO ---
    let cart = [];
    let activeView = 'menu';
    let tipoEntregaAtual = ""; 

    // --- SELETORES DOM ---
    const pastelImage = document.getElementById('pastel-image');
    const views = document.querySelectorAll('.view-section');
    const beveragesList = document.getElementById('beverages-list');
    const saboresLista = document.getElementById('sabores-lista');
    const saboresForm = document.getElementById('sabores-form');
    const saborCounter = document.getElementById('sabor-counter');
    const saborPriceInfo = document.getElementById('sabor-price-info');
    const btnAddPastel = document.getElementById('btn-add-pastel-to-cart');
    const btnCancelPastel = document.getElementById('btn-cancel-pastel');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const btnFinalizarPedido = document.getElementById('btn-finalizar-pedido');
    const btnVoltarMenu = document.getElementById('btn-voltar-menu');
    const checkoutForm = document.getElementById('checkout-form');
    const checkoutSummary = document.getElementById('checkout-summary');
    const checkoutTotalPrice = document.getElementById('checkout-total-price');
    const btnVoltarCarrinho = document.getElementById('btn-voltar-carrinho');
    const footerBtn = document.getElementById('footer-btn');
    const confirmModal = document.getElementById('confirm-modal');
    const btnCloseConfirm = document.getElementById('btn-close-confirm');
    const deliveryTypeSelect = document.getElementById('delivery-type');
    const addressWrapper = document.getElementById('address-wrapper');
    const clienteEnderecoInput = document.getElementById('cliente-endereco');
    const deliveryFeeElement = document.getElementById('checkout-delivery-fee');
    const deliveryFeeValue = document.getElementById('delivery-fee-value');
    const bebidasLoading = document.getElementById('bebidas-loading');
    const saboresLoading = document.getElementById('sabores-loading');


    // --- FUNÇÕES DE RENDERIZAÇÃO ---
    function renderizarSabores() {
        saboresLista.innerHTML = '';
        menuSabores.forEach((sabor, index) => {
            const saborHTML = `
                <div class="sabor-item">
                    <input type="checkbox" id="sabor-${index}" data-nome="${sabor.nome}">
                    <label for="sabor-${index}">${sabor.nome}</label>
                </div>
            `;
            saboresLista.innerHTML += saborHTML;
        });
    }

    function renderizarBebidas() {
        beveragesList.innerHTML = '';
        menuBebidas.forEach(bebida => {
            const bebidaHTML = `
                <div class="beverage-item">
                    <div class="beverage-item-info">
                        <h4>${bebida.nome}</h4>
                        <span>R$ ${bebida.preco.toFixed(2)}</span>
                    </div>
                    <button class="add-beverage-btn" data-id="${bebida.id}">Adicionar</button>
                </div>
            `;
            beveragesList.innerHTML += bebidaHTML;
        });
    }

    function calcularSubtotal() {
        return cart.reduce((total, item) => total + (item.preco * item.quantidade), 0);
    }

    function atualizarTotalCheckout() {
        const subtotal = calcularSubtotal();
        let totalFinal = subtotal;

        if (tipoEntregaAtual === 'delivery') {
            totalFinal += taxaDeEntrega;
            deliveryFeeElement.style.display = 'flex';
            deliveryFeeValue.textContent = `R$ ${taxaDeEntrega.toFixed(2)}`;
        } else {
            deliveryFeeElement.style.display = 'none';
        }

        checkoutTotalPrice.textContent = `R$ ${totalFinal.toFixed(2)}`;
    }

    function renderizarCarrinho() {
        cartItemsContainer.innerHTML = '';
        let totalItens = 0; 
        const subtotal = calcularSubtotal(); 

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Seu carrinho está vazio.</p>';
            cartTotalPrice.textContent = 'R$ 0,00';
            btnFinalizarPedido.disabled = true;
        } else {
            btnFinalizarPedido.disabled = false;
            cart.forEach(item => {
                totalItens += item.quantidade; 
                let itemHTML = '';
                if (item.type === 'pastel') {
                    itemHTML = `
                        <div class="cart-item">
                            <div class="cart-item-info">
                                <h4>Pastel Customizado</h4>
                                <ul class="cart-item-flavors">
                                    ${item.sabores.map(s => `<li>${s}</li>`).join('')}
                                </ul>
                                <span>Preço un.: R$ ${item.preco.toFixed(2)}</span>
                            </div>
                            <div class="cart-item-actions">
                                <button class="quantity-btn" data-id="${item.id}" data-action="decrease">-</button>
                                <span>${item.quantidade}</span>
                                <button class="quantity-btn" data-id="${item.id}" data-action="increase">+</button>
                                <button class="remove-btn" data-id="${item.id}">×</button>
                            </div>
                        </div>
                    `;
                } else if (item.type === 'bebida') {
                    itemHTML = `
                        <div class="cart-item">
                            <div class="cart-item-info">
                                <h4>${item.nome}</h4>
                                <span>Preço un.: R$ ${item.preco.toFixed(2)}</span>
                            </div>
                            <div class="cart-item-actions">
                                <button class="quantity-btn" data-id="${item.id}" data-action="decrease">-</button>
                                <span>${item.quantidade}</span>
                                <button class="quantity-btn" data-id="${item.id}" data-action="increase">+</button>
                                <button class="remove-btn" data-id="${item.id}">×</button>
                            </div>
                        </div>
                    `;
                }
                cartItemsContainer.innerHTML += itemHTML;
            });
        }
        
        cartTotalPrice.textContent = `R$ ${subtotal.toFixed(2)}`;

        if (cart.length > 0) {
            footerBtn.textContent = `Ver Carrinho (${totalItens} ${totalItens > 1 ? 'itens' : 'item'}) - R$ ${subtotal.toFixed(2)}`;
            footerBtn.style.display = 'block';
        } else {
            footerBtn.textContent = 'Peça agora!'; 
            if (activeView === 'menu') {
                footerBtn.style.display = 'none';
            }
        }
    }

    function renderizarCheckout() {
        checkoutSummary.innerHTML = '';
        cart.forEach(item => {
            const subtotal = item.preco * item.quantidade;
            let saboresHTML = '';
            if (item.type === 'pastel') {
                saboresHTML = `<div class="summary-item-flavors">(${item.sabores.join(', ')})</div>`;
            }
            const itemHTML = `
                <div class="summary-item">
                    <span>${item.quantidade}x ${item.type === 'pastel' ? 'Pastel Customizado' : item.nome}</span>
                    <span>R$ ${subtotal.toFixed(2)}</span>
                </div>
                ${saboresHTML}
            `;
            checkoutSummary.innerHTML += itemHTML;
        });
        atualizarTotalCheckout();
    }


    function mostrarView(viewId) {
        const currentView = document.getElementById(activeView);
        if (currentView) {
            currentView.classList.remove('active');
        }
        const newView = document.getElementById(viewId);
        if (newView) {
            newView.classList.add('active');
            activeView = viewId; 
        }
        renderizarCarrinho();
        window.scrollTo(0, 0);
    }

    let currentPastel = {
        sabores: [],
        preco: pastelPrecoBase
    };

    function atualizarPrecoPastel() {
        const checkboxes = saboresLista.querySelectorAll('input[type="checkbox"]:checked');
        let count = checkboxes.length;
        
        currentPastel.sabores = [];
        checkboxes.forEach(cb => {
            currentPastel.sabores.push(cb.dataset.nome);
        });

        let preco = pastelPrecoBase;
        if (count > saboresGratis) {
            preco += (count - saboresGratis) * precoPorSaborExtra;
        }
        currentPastel.preco = preco;

        saborCounter.textContent = `${count} sabor${count !== 1 ? 'es' : ''} selecionado${count !== 1 ? 's' : ''}`;
        saborPriceInfo.textContent = `Preço deste pastel: R$ ${preco.toFixed(2)}`;
        
        if (count > saboresGratis) {
            saborCounter.style.color = 'var(--cor-vermelha)';
        } else {
            saborCounter.style.color = 'var(--cor-texto)';
        }
    }

    function adicionarPastelAoCarrinho() {
        if (currentPastel.sabores.length === 0) {
            alert("Escolha pelo menos um sabor para o seu pastel!");
            return;
        }
        const novoPastel = {
            id: 'p_' + Date.now(),
            type: 'pastel',
            sabores: [...currentPastel.sabores],
            preco: currentPastel.preco,
            quantidade: 1
        };
        cart.push(novoPastel);
        resetarConstrutor();
        mostrarView('cart-view'); 
    }
    
    function resetarConstrutor() {
        saboresForm.reset();
        currentPastel = { sabores: [], preco: pastelPrecoBase };
        atualizarPrecoPastel();
    }

    function adicionarBebidaAoCarrinho(event) {
        if (!event.target.classList.contains('add-beverage-btn')) return;
        
        const id = event.target.dataset.id; 
        const bebida = menuBebidas.find(b => b.id === id); 
        
        if(!bebida) {
            alert("Erro: Bebida não encontrada.");
            return;
        }

        const itemNoCarrinho = cart.find(item => item.id === id && item.type === 'bebida');

        if (itemNoCarrinho) {
            itemNoCarrinho.quantidade++;
        } else {
            cart.push({
                id: bebida.id, 
                type: 'bebida',
                nome: bebida.nome,
                preco: bebida.preco,
                quantidade: 1
            });
        }
        
        renderizarCarrinho(); 
        
        const targetButton = event.target;
        targetButton.textContent = 'Adicionado!';
        targetButton.disabled = true; 

        setTimeout(() => {
            targetButton.textContent = 'Adicionar';
            targetButton.disabled = false; 
            mostrarView('cart-view'); 
        }, 1000); 
    }

    function atualizarCarrinho(event) {
        const target = event.target;
        if (!target.dataset.id) return;
        
        const id = target.dataset.id;
        const item = cart.find(i => i.id === id);
        if (!item) return;

        if (target.classList.contains('remove-btn')) {
            cart = cart.filter(i => i.id !== id);
        }
        
        if (target.classList.contains('quantity-btn')) {
            if (target.dataset.action === 'increase') {
                item.quantidade++;
            } else if (target.dataset.action === 'decrease') {
                item.quantidade--;
                if (item.quantidade === 0) {
                    cart = cart.filter(i => i.id !== id);
                }
            }
        }

        renderizarCarrinho();
        renderizarCheckout(); 
    }

    function handleDeliveryTypeChange() {
        tipoEntregaAtual = deliveryTypeSelect.value;
        
        if (tipoEntregaAtual === 'delivery') {
            addressWrapper.style.display = 'block'; 
            clienteEnderecoInput.required = true; 
        } else {
            addressWrapper.style.display = 'none'; 
            clienteEnderecoInput.required = false; 
        }
        
        atualizarTotalCheckout();
    }

    function enviarPedidoWhatsApp(event) {
        event.preventDefault();

        if (!tipoEntregaAtual) {
            alert("Por favor, selecione o Tipo de Entrega (Delivery ou Retirada).");
            return;
        }

        const nome = document.getElementById('cliente-nome').value;
        const pagamento = document.getElementById('cliente-pagamento').value;
        let endereco = document.getElementById('cliente-endereco').value;

        if (tipoEntregaAtual === 'delivery' && !endereco) {
             alert("Por favor, preencha seu Endereço de Entrega.");
             return;
        }

        if (!nome || !pagamento) {
            alert("Por favor, preencha seu Nome e a Forma de Pagamento.");
            return;
        }

        let total = calcularSubtotal();
        let listaItens = '';
        let infoEntrega = '';

        if (tipoEntregaAtual === 'delivery') {
            total += taxaDeEntrega;
            infoEntrega = `*Tipo de Entrega:* Delivery\n*Endereço:* ${endereco}\n*Taxa de Entrega:* R$ ${taxaDeEntrega.toFixed(2)}`;
        } else {
            infoEntrega = `*Tipo de Entrega:* Retirada no Estabelecimento`;
        }

        cart.forEach(item => {
            const subtotal = item.preco * item.quantidade;
            if (item.type === 'pastel') {
                listaItens += `*${item.quantidade}x Pastel Customizado* (R$ ${subtotal.toFixed(2)})\n`;
                listaItens += `  (${item.sabores.join(', ')})\n`;
            } else {
                listaItens += `*${item.quantidade}x ${item.nome}* (R$ ${subtotal.toFixed(2)})\n`;
            }
        });

        const mensagem = `
🍴 *Novo Pedido - Pastel Frito na Hora!*
Cliente: *${nome}*
${infoEntrega}
Forma de Pagamento: *${pagamento}*
--------------------------------
*Pedido:*
${listaItens}
--------------------------------
*Total: R$ ${total.toFixed(2)}*
✅ Pedido pronto para fritar na hora!
        `;
        const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem.trim())}`;
        window.open(urlWhatsApp, '_blank');
        
        abrirModalConfirmacao();
    }

    function abrirModalConfirmacao() {
        checkoutForm.reset();
        cart = [];
        tipoEntregaAtual = ""; 
        addressWrapper.style.display = 'block'; 
        
        confirmModal.style.display = 'flex';
        renderizarCarrinho(); 
    }

    function fecharModalConfirmacao() {
        confirmModal.style.display = 'none';
        mostrarView('menu');
    }

    // --- EVENT LISTENERS ---
    
    pastelImage.addEventListener('click', () => mostrarView('pastel-builder-view'));
    btnVoltarMenu.addEventListener('click', () => mostrarView('menu'));
    btnCancelPastel.addEventListener('click', () => {
        resetarConstrutor();
        mostrarView('menu');
    });
    btnVoltarCarrinho.addEventListener('click', () => mostrarView('cart-view'));
    
    footerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (cart.length > 0) {
            mostrarView('cart-view');
        } else {
            mostrarView('menu');
        }
    });

    saboresLista.addEventListener('change', atualizarPrecoPastel);
    btnAddPastel.addEventListener('click', adicionarPastelAoCarrinho);
    beveragesList.addEventListener('click', adicionarBebidaAoCarrinho);
    cartItemsContainer.addEventListener('click', atualizarCarrinho);
    
    btnFinalizarPedido.addEventListener('click', () => {
        renderizarCheckout(); 
        mostrarView('checkout-view');
    });

    checkoutForm.addEventListener('submit', enviarPedidoWhatsApp);
    btnCloseConfirm.addEventListener('click', fecharModalConfirmacao);
    deliveryTypeSelect.addEventListener('change', handleDeliveryTypeChange);

    
    // --- FUNÇÃO DE INICIALIZAÇÃO (Lendo do Google) ---
    
    function parseCSV(text) {
        const lines = text.split('\n');
        const header = lines[0].split(',').map(h => h.trim().toLowerCase());
        const data = [];
        
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            if (values.length === header.length) {
                const entry = {};
                for (let j = 0; j < header.length; j++) {
                    entry[header[j]] = values[j].trim();
                }
                data.push(entry);
            }
        }
        return data;
    }

    async function carregarCardapio() {
        try {
            // Adiciona um parâmetro aleatório para "burlar" o cache
            const url = new URL(GOOGLE_SHEET_URL);
            url.searchParams.append('t', new Date().getTime()); 
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Erro ao carregar planilha (verifique o link .csv)');
            }
            
            const csvText = await response.text();
            const data = parseCSV(csvText);
            
            const menuAtivo = data.filter(item => item.estoque && item.estoque.toLowerCase() === 'sim');

            menuSabores = menuAtivo
                .filter(item => item.tipo && item.tipo.toLowerCase() === 'pastel')
                .map(item => ({ nome: item.nome }));
            
            menuBebidas = menuAtivo
                .filter(item => item.tipo && item.tipo.toLowerCase() === 'bebida')
                .map(item => ({
                    id: item.nome, 
                    nome: item.nome,
                    preco: parseFloat(item.preco)
                }));
            
            renderizarSabores();
            renderizarBebidas();

        } catch (error) {
            console.error(error);
            bebidasLoading.textContent = `Erro ao carregar o cardápio. Tente recarregar a página.`;
            bebidasLoading.style.color = 'var(--cor-vermelha)';
            saboresLoading.textContent = 'Erro ao carregar sabores.';
            saboresLoading.style.color = 'var(--cor-vermelha)';
        }
    }

    // --- INICIALIZAÇÃO ---
    carregarCardapio();
    renderizarCarrinho(); // Corrige o bug do botão do rodapé
});