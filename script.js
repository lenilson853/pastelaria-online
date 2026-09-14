document.addEventListener('DOMContentLoaded', () => {

    const numeroWhatsApp = "558191110325"; 
    const taxaDeEntrega = 3.00;
    
    const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQBgruE-4raM98m5Yt_vEvNLowbasfmklW0lls2eYJUVwtkwMEF42xgtHwM-NicSOYqHpFnY9xu-nAy/pub?output=csv';

    const pastelPrecoBase = 8.00; 
    const saboresGratis = 4;
    const precoPorSaborExtra = 1.00;
    const precoCreamCheese = 2.00; 

    let menuSabores = [];
    let cardapioLanches = [];
    let cardapioDoces = [];
    let cardapioSucos = [];
    let cardapioRefris = [];
    let todosItensProntos = [];

    let cart = [];
    let activeView = 'menu';
    let tipoEntregaAtual = ""; 

    const pastelImage = document.getElementById('pastel-image');
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
    const pastelObsInput = document.getElementById('pastel-obs');
    const pagamentoSelect = document.getElementById('cliente-pagamento');
    const pixBox = document.getElementById('pix-box');
    const btnCopyPix = document.getElementById('btn-copy-pix');
    const pixKeyInput = document.getElementById('pix-key-input');


    function renderizarSabores() {
        saboresLista.innerHTML = '';
        if (menuSabores.length === 0) {
            saboresLista.innerHTML = '<p class="loading-text">Nenhum sabor disponível no momento.</p>';
            return;
        }
        menuSabores.forEach((sabor, index) => {
            let nomeExibicao = sabor.nome;
            let ehCreamCheese = sabor.nome.toLowerCase().includes('cream cheese');
            
            if (ehCreamCheese) {
                nomeExibicao += ` <span style="color: var(--cor-amarela); font-size: 0.85em;">(+R$ 2,00)</span>`;
            }

            const saborHTML = `
                <div class="sabor-item">
                    <input type="checkbox" id="sabor-${index}" data-nome="${sabor.nome}" data-creamcheese="${ehCreamCheese ? 'true' : 'false'}">
                    <label for="sabor-${index}">${nomeExibicao}</label>
                </div>
            `;
            saboresLista.innerHTML += saborHTML;
        });
    }

    function renderizarItensProntos() {
        beveragesList.innerHTML = ''; 
        function adicionarCategoriaHTML(titulo, lista) {
            if(lista.length === 0) return;
            beveragesList.innerHTML += `<h3 style="color: var(--cor-amarela); margin-top: 15px; margin-bottom: 5px; text-shadow: 1px 1px 0px #000; font-family: 'Kanit', sans-serif; letter-spacing: 1px; font-size: 1.5em; font-style: italic;">${titulo}</h3>`;
            lista.forEach(item => {
                beveragesList.innerHTML += `
                    <div class="beverage-item" style="flex-direction: column; align-items: stretch; gap: 8px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div class="beverage-item-info">
                                <h4>${item.nome}</h4>
                                <span>R$ ${item.preco.toFixed(2)}</span>
                            </div>
                            <button class="add-beverage-btn" data-id="${item.id}">Adicionar</button>
                        </div>
                        <input type="text" class="item-obs-input" placeholder="Observação (ex: sem purê, sem batata...)" data-id="${item.id}" style="background: #121212; border: 1px solid #444; color: #fff; padding: 6px 10px; border-radius: 5px; font-size: 0.85em;">
                    </div>
                `;
            });
        }
        
        adicionarCategoriaHTML("🌭 Cachorros-Quentes & Salgados", cardapioLanches);
        adicionarCategoriaHTML("🥤 Sucos & Caldos", cardapioSucos);
        adicionarCategoriaHTML("🍫 Doces & Sobremesas", cardapioDoces);
        adicionarCategoriaHTML("🧊 Refrigerantes", cardapioRefris);
        
        if (todosItensProntos.length === 0) {
            beveragesList.innerHTML = '<p class="loading-text" style="grid-column: 1/-1;">Nenhum produto disponível no momento.</p>';
        }
    }

    function calcularSubtotal() { return cart.reduce((total, item) => total + (item.preco * item.quantidade), 0); }

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
                    let obsVisual = item.observacao ? `<br><small style="color: #aaa;">Obs: ${item.observacao}</small>` : '';
                    itemHTML = `
                        <div class="cart-item">
                            <div class="cart-item-info">
                                <h4>Pastel Customizado</h4>
                                <ul class="cart-item-flavors">${item.sabores.map(s => `<li>${s}</li>`).join('')}</ul>
                                ${obsVisual}
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
                } else if (item.type === 'item-pronto') {
                    let obsVisual = item.observacao ? `<br><small style="color: #aaa;">Obs: ${item.observacao}</small>` : '';
                    itemHTML = `
                        <div class="cart-item">
                            <div class="cart-item-info">
                                <h4>${item.nome}</h4>
                                ${obsVisual}
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
            if (activeView === 'menu') { footerBtn.style.display = 'none'; }
        }
    }

    function renderizarCheckout() {
        checkoutSummary.innerHTML = '';
        cart.forEach(item => {
            const subtotal = item.preco * item.quantidade;
            let detalhesHTML = '';
            if (item.type === 'pastel') { 
                let obsText = item.observacao ? ` - Obs: ${item.observacao}` : '';
                detalhesHTML = `<div class="summary-item-flavors">(${item.sabores.join(', ')})${obsText}</div>`; 
            } else if (item.type === 'item-pronto' && item.observacao) {
                detalhesHTML = `<div class="summary-item-flavors">(Obs: ${item.observacao})</div>`;
            }
            const itemHTML = `
                <div class="summary-item">
                    <span>${item.quantidade}x ${item.type === 'pastel' ? 'Pastel Customizado' : item.nome}</span>
                    <span>R$ ${subtotal.toFixed(2)}</span>
                </div>
                ${detalhesHTML}
            `;
            checkoutSummary.innerHTML += itemHTML;
        });
        atualizarTotalCheckout();
    }

    function mostrarView(viewId) {
        const currentView = document.getElementById(activeView);
        if (currentView) { currentView.classList.remove('active'); }
        const newView = document.getElementById(viewId);
        if (newView) { newView.classList.add('active'); activeView = viewId; }
        renderizarCarrinho();
        window.scrollTo(0, 0);
    }

    let currentPastel = { sabores: [], preco: pastelPrecoBase };

    function atualizarPrecoPastel() {
        const checkboxes = saboresLista.querySelectorAll('input[type="checkbox"]:checked');
        let count = checkboxes.length;
        currentPastel.sabores = [];
        
        let temCreamCheese = false;
        checkboxes.forEach(cb => { 
            currentPastel.sabores.push(cb.dataset.nome); 
            if (cb.dataset.creamcheese === 'true') {
                temCreamCheese = true;
            }
        });

        let preco = pastelPrecoBase;
        
        if (count > saboresGratis) { 
            preco += (count - saboresGratis) * precoPorSaborExtra; 
        }

        if (temCreamCheese) {
            preco += precoCreamCheese;
        }

        currentPastel.preco = preco;
        saborCounter.textContent = `${count} sabor${count !== 1 ? 'es' : ''} selecionado${count !== 1 ? 's' : ''}`;
        saborPriceInfo.textContent = `Preço deste pastel: R$ ${preco.toFixed(2)}`;
        
        if (count > saboresGratis || temCreamCheese) { 
            saborCounter.style.color = 'var(--cor-vermelha)'; 
        } else { 
            saborCounter.style.color = 'var(--cor-texto)'; 
        }
    }

    function adicionarPastelAoCarrinho() {
        if (currentPastel.sabores.length === 0) { alert("Escolha pelo menos um sabor para o seu item!"); return; }
        
        const observacao = pastelObsInput ? pastelObsInput.value.trim() : '';

        const novoPastel = {
            id: 'p_' + Date.now(), 
            type: 'pastel', 
            sabores: [...currentPastel.sabores],
            preco: currentPastel.preco, 
            quantidade: 1,
            observacao: observacao
        };
        cart.push(novoPastel);
        resetarConstrutor();
        mostrarView('cart-view'); 
    }
    
    function resetarConstrutor() {
        saboresForm.reset();
        if(pastelObsInput) pastelObsInput.value = '';
        currentPastel = { sabores: [], preco: pastelPrecoBase };
        atualizarPrecoPastel();
    }

    function adicionarItemProntoAoCarrinho(event) {
        if (!event.target.classList.contains('add-beverage-btn')) return;
        const id = event.target.dataset.id; 
        const produto = todosItensProntos.find(b => b.id === id); 
        if(!produto) return;

        // Pega a observação digitada na caixinha específica daquele item
        const inputObs = beveragesList.querySelector(`.item-obs-input[data-id="${id}"]`);
        const observacao = inputObs ? inputObs.value.trim() : '';

        // Cria um identificador único baseado no ID e na observação para diferenciar se o cliente pedir o mesmo lanche com obs diferentes
        const itemCarrinhoId = id + '_' + (observacao ? btoa(observacao).replace(/=/g, '') : 'sem_obs');

        const itemNoCarrinho = cart.find(item => item.id === itemCarrinhoId && item.type === 'item-pronto');
        if (itemNoCarrinho) { 
            itemNoCarrinho.quantidade++; 
        } else {
            cart.push({ 
                id: itemCarrinhoId, 
                type: 'item-pronto', 
                nome: produto.nome, 
                preco: produto.preco, 
                quantidade: 1,
                observacao: observacao 
            });
        }

        // Limpa o input de observação após adicionar
        if(inputObs) inputObs.value = '';

        renderizarCarrinho(); 
        const targetButton = event.target;
        targetButton.textContent = 'Adicionado!';
        targetButton.disabled = true; 
        setTimeout(() => { targetButton.textContent = 'Adicionar'; targetButton.disabled = false; mostrarView('cart-view'); }, 1000); 
    }

    function atualizarCarrinho(event) {
        const target = event.target;
        if (!target.dataset.id) return;
        const id = target.dataset.id;
        const item = cart.find(i => i.id === id);
        if (!item) return;

        if (target.classList.contains('remove-btn')) { cart = cart.filter(i => i.id !== id); }
        if (target.classList.contains('quantity-btn')) {
            if (target.dataset.action === 'increase') { item.quantidade++; } 
            else if (target.dataset.action === 'decrease') {
                item.quantidade--;
                if (item.quantidade === 0) { cart = cart.filter(i => i.id !== id); }
            }
        }
        renderizarCarrinho();
        renderizarCheckout(); 
    }

    function handleDeliveryTypeChange() {
        tipoEntregaAtual = deliveryTypeSelect.value;
        if (tipoEntregaAtual === 'delivery') {
            addressWrapper.style.display = 'block'; clienteEnderecoInput.required = true; 
        } else {
            addressWrapper.style.display = 'none'; clienteEnderecoInput.required = false; 
        }
        atualizarTotalCheckout();
    }

    function handlePaymentChange() {
        if (pagamentoSelect.value === 'Pix') {
            pixBox.style.display = 'block';
        } else {
            pixBox.style.display = 'none';
        }
    }

    function proximoNumeroPedido() {
        let ultimoPedido = localStorage.getItem('gvm_ultimo_pedido');
        let proximo = ultimoPedido ? parseInt(ultimoPedido) + 1 : 1;
        localStorage.setItem('gvm_ultimo_pedido', proximo);
        return String(proximo).padStart(3, '0');
    }

    function enviarPedidoWhatsApp(event) {
        event.preventDefault();

        if (!tipoEntregaAtual) { alert("Por favor, selecione o Tipo de Entrega (Delivery ou Retirada)."); return; }
        const nome = document.getElementById('cliente-nome').value;
        const pagamento = document.getElementById('cliente-pagamento').value;
        let endereco = document.getElementById('cliente-endereco').value;

        if (tipoEntregaAtual === 'delivery' && !endereco) { alert("Por favor, preencha seu Endereço de Entrega."); return; }
        if (!nome || !pagamento) { alert("Por favor, preencha seu Nome e a Forma de Pagamento."); return; }

        let numeroDoPedido = proximoNumeroPedido();

        let total = calcularSubtotal();
        let listaItens = '';
        let infoEntrega = '';

        if (tipoEntregaAtual === 'delivery') {
            total += taxaDeEntrega;
            infoEntrega = `*Tipo de Entrega:* Delivery\n*Endereço:* ${endereco}\n*Taxa de Entrega:* R$ ${taxaDeEntrega.toFixed(2)}`;
        } else {
            infoEntrega = `*Tipo de Entrega:* Retirada no Estabelecimento`;
        }

        let infoPagamento = `*Forma de Pagamento:* ${pagamento}`;
        if (pagamento === 'Pix') {
            infoPagamento += `\n📎 *(Comprovante do Pix será enviado em seguida)*`;
        }

        cart.forEach(item => {
            const subtotal = item.preco * item.quantidade;
            if (item.type === 'pastel') {
                let obsTexto = item.observacao ? `\n  *Obs:* ${item.observacao}` : '';
                listaItens += `*${item.quantidade}x Pastel Customizado* (R$ ${subtotal.toFixed(2)})\n  (${item.sabores.join(', ')})${obsTexto}\n`;
            } else {
                let obsTexto = item.observacao ? ` (Obs: ${item.observacao})` : '';
                listaItens += `*${item.quantidade}x ${item.nome}*${obsTexto} (R$ ${subtotal.toFixed(2)})\n`;
            }
        });

        const mensagem = `
🔥 *PEDIDO #${numeroDoPedido} - GVM Pastel da Hora!* 🔥
Cliente: *${nome}*
${infoEntrega}
${infoPagamento}
--------------------------------
*Itens do Pedido:*
${listaItens}
--------------------------------
*Total a Pagar: R$ ${total.toFixed(2)}*
        `;
        const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem.trim())}`;
        window.open(urlWhatsApp, '_blank');
        abrirModalConfirmacao();
    }

    function abrirModalConfirmacao() {
        checkoutForm.reset(); cart = []; tipoEntregaAtual = ""; 
        addressWrapper.style.display = 'block'; 
        pixBox.style.display = 'none';
        confirmModal.style.display = 'flex'; renderizarCarrinho(); 
    }
    function fecharModalConfirmacao() { confirmModal.style.display = 'none'; mostrarView('menu'); }

    pastelImage.addEventListener('click', () => mostrarView('pastel-builder-view'));
    btnVoltarMenu.addEventListener('click', () => mostrarView('menu'));
    btnCancelPastel.addEventListener('click', () => { resetarConstrutor(); mostrarView('menu'); });
    btnVoltarCarrinho.addEventListener('click', () => {
        if (activeView === 'checkout-view') {
            mostrarView('cart-view');
        } else {
            mostrarView('menu');
        }
    });
    footerBtn.addEventListener('click', (e) => { e.preventDefault(); if (cart.length > 0) { mostrarView('cart-view'); } else { mostrarView('menu'); } });
    saboresLista.addEventListener('change', atualizarPrecoPastel);
    btnAddPastel.addEventListener('click', adicionarPastelAoCarrinho);
    beveragesList.addEventListener('click', adicionarItemProntoAoCarrinho);
    cartItemsContainer.addEventListener('click', atualizarCarrinho);
    btnFinalizarPedido.addEventListener('click', () => { renderizarCheckout(); mostrarView('checkout-view'); });
    checkoutForm.addEventListener('submit', enviarPedidoWhatsApp);
    btnCloseConfirm.addEventListener('click', fecharModalConfirmacao);
    deliveryTypeSelect.addEventListener('change', handleDeliveryTypeChange);
    pagamentoSelect.addEventListener('change', handlePaymentChange);

    btnCopyPix.addEventListener('click', () => {
        pixKeyInput.select();
        pixKeyInput.setSelectionRange(0, 99999);
        navigator.clipboard.writeText(pixKeyInput.value);
        btnCopyPix.textContent = 'Copiado!';
        setTimeout(() => { btnCopyPix.textContent = 'Copiar Chave'; }, 2000);
    });

    function parseCSV(text) {
        const textoLimpo = text.replace(/\r/g, '').replace(/^\uFEFF/, ''); 
        const lines = textoLimpo.split('\n').filter(linha => linha.trim() !== '');
        
        const header = lines[0].split(',').map(h => {
            let titulo = h.trim().toLowerCase();
            if (titulo === 'preço' || titulo === 'preco') return 'preco';
            return titulo;
        });
        
        const data = [];
        for (let i = 1; i < lines.length; i++) {
            const linha = lines[i];
            let values = [];
            let atual = '';
            let dentroDeParenteses = false;
            
            for (let char of linha) {
                if (char === '(') dentroDeParenteses = true;
                if (char === ')') dentroDeParenteses = false;
                
                if (char === ',' && !dentroDeParenteses) {
                    values.push(atual.trim());
                    atual = '';
                } else {
                    atual += char;
                }
            }
            values.push(atual.trim());

            const entry = {};
            for (let j = 0; j < header.length; j++) { 
                entry[header[j]] = values[j] ? values[j].trim() : ''; 
            }
            data.push(entry);
        }
        return data;
    }

    async function carregarCardapio() {
        try {
            const response = await fetch(GOOGLE_SHEET_URL);
            if (!response.ok) { throw new Error('Erro ao carregar planilha'); }
            const csvText = await response.text();
            
            const data = parseCSV(csvText);
            const menuAtivo = data.filter(item => item.estoque && item.estoque.toLowerCase() === 'sim');

            menuSabores = []; cardapioLanches = []; cardapioDoces = []; cardapioSucos = []; cardapioRefris = [];

            menuAtivo.forEach(item => {
                const tipo = item.tipo ? item.tipo.toLowerCase().trim() : '';
                const preco = parseFloat(item.preco) || 0;
                
                if (tipo === 'pastel' || tipo === 'sabor') { 
                    menuSabores.push({ nome: item.nome }); 
                } 
                else if (tipo === 'lanche' || tipo === 'salgado') { 
                    cardapioLanches.push({ id: item.nome, nome: item.nome, preco: preco }); 
                }
                else if (tipo === 'doce' || tipo === 'sobremesa') { 
                    cardapioDoces.push({ id: item.nome, nome: item.nome, preco: preco }); 
                }
                else if (tipo === 'suco' || tipo === 'caldo') { 
                    cardapioSucos.push({ id: item.nome, nome: item.nome, preco: preco }); 
                }
                else if (tipo === 'bebida' || tipo === 'refrigerante' || tipo === 'extra') { 
                    cardapioRefris.push({ id: item.nome, nome: item.nome, preco: preco }); 
                }
            });
            
            todosItensProntos = [...cardapioLanches, ...cardapioDoces, ...cardapioSucos, ...cardapioRefris];
            
            renderizarSabores();
            renderizarItensProntos();

        } catch (error) {
            console.error("Erro na leitura da planilha:", error);
            document.getElementById('bebidas-loading').textContent = "Erro ao carregar produtos. Verifique o link da planilha.";
            if(document.getElementById('sabores-loading')) document.getElementById('sabores-loading').textContent = "Erro ao carregar sabores.";
        }
    }

    renderizarSabores(); 
    renderizarItensProntos(); 
    carregarCardapio();
    renderizarCarrinho(); 
});