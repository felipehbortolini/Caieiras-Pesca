# 🎣 Caieiras Pesca

Site-catálogo da **Caieiras Pesca** — loja de pesca da Grande Vitória/ES, feita por filhos de pescador. Site estático (HTML + CSS + JavaScript puro), pronto para publicação no **GitHub Pages**, com carrinho persistente e finalização de pedido pelo **WhatsApp**.

## ✨ Recursos

- **Hero animado** com céu ao pôr do sol, mar e o pescador da logo; o brilho do sol acompanha o mouse.
- **Catálogo por categorias** (carrosséis na home + página única por categoria).
- **Carrinho de compras** persistente em `localStorage` — não se perde ao trocar de página ou aba.
- **Botão flutuante** do carrinho + menu lateral (drawer).
- **Checkout via WhatsApp**: pede o nome do cliente e abre o WhatsApp com o pedido formatado.
- **Busca**, **depoimentos** e **mapa** (Leaflet) de como chegar.
- Identidade visual da marca (azul `#32699f`, laranja `#d37f27`, amarelo `#eec81d`, marrom `#503715`). Sem glow/neon nos componentes.

## 🗂️ Estrutura

```
index.html              Página inicial (hero, categorias, depoimentos, mapa)
<categoria>.html        Uma página por categoria (geradas automaticamente)
css/styles.css          Design system completo
js/icons.js             Ícones SVG inline
js/data.js              Catálogo (GERADO — não editar à mão)
js/cart.js              Carrinho + checkout WhatsApp
js/ui.js                Header, footer, carrosséis, hero e interações
assets/logo/            Logos da marca
assets/produtos/        Imagens dos produtos
gerar_dados.py          Gera js/data.js, copia imagens e cria as páginas
Catalogo_Produtos.xlsx  Fonte de dados dos produtos
```

## 🔄 Atualizar o catálogo

1. Edite **`Catalogo_Produtos.xlsx`** (colunas: `CATEGORIA | PRODUTO | DESCRIÇÃO | VALOR | PASTA_IMAGENS | TAG | PRECO_PROMO`).
   - `PASTA_IMAGENS`: pasta com as fotos do produto (pode ter várias — viram um carrossel/galeria).
   - `TAG`: `Em estoque` (padrão), `Promoção` ou `Indisponível`.
     - **Em estoque** → selo verde. **Indisponível** → card esmaecido, sem botão de compra; o pop-up oferece "Consultar no WhatsApp". **Promoção** → selo laranja animado.
   - `PRECO_PROMO`: preço promocional (só vale se menor que `VALOR`). Aparece riscando o preço cheio, com selo `−%`, e é o valor cobrado no carrinho/WhatsApp. Produtos com promoção entram na seção **Ofertas** da home.
2. Rode o gerador:

   ```bash
   python gerar_dados.py
   ```

   Ele recria `js/data.js`, copia as imagens para `assets/produtos/` e regenera as páginas de categoria.
3. Faça commit e push — o site atualiza no GitHub Pages.

## ✅ Itens para revisar

- **Endereço e coordenadas da loja**: ajuste em `js/ui.js` (objeto `STORE`: `addressDetail`, `lat`, `lng`) e no bloco do mapa em `index.html`.
- **Redes sociais**: troque os `href="#"` de Instagram/Facebook no rodapé (`js/ui.js`).
- **Número do WhatsApp**: `5527996209785` (em `js/cart.js` → `WHATSAPP_PHONE`).
- **Depoimentos**: textos de exemplo em `index.html` (seção `#depoimentos`).

## 🚀 Publicação (GitHub Pages)

O repositório já contém `.nojekyll`. Em **Settings → Pages**, selecione a branch `main` e a pasta `/ (root)`. O site fica disponível em poucos minutos.
