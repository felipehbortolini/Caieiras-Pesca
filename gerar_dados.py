# -*- coding: utf-8 -*-
"""
Gerador de dados do catalogo Caieiras Pesca.

Le o arquivo Catalogo_Produtos.xlsx, copia as imagens de cada produto e as logos
para a pasta assets/ e gera o arquivo js/data.js consumido pelo site estatico.

Rode novamente sempre que atualizar o Excel ou adicionar imagens:
    python gerar_dados.py
"""
from __future__ import annotations

import json
import re
import shutil
import unicodedata
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parent
EXCEL = ROOT / "Catalogo_Produtos.xlsx"
LOGO_SRC = ROOT / "Logo"
ASSETS = ROOT / "assets"
PROD_ASSETS = ASSETS / "produtos"
LOGO_ASSETS = ASSETS / "logo"
DATA_JS = ROOT / "js" / "data.js"

IMG_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"}

# Ordem oficial das categorias no menu (todas, mesmo sem produtos ainda).
CATEGORIAS = [
    "Varas",
    "Molinetes",
    "Iscas",
    "Linhas",
    "Vestuário",
    "Facas",
    "Coolers",
    "Acessórios de Pesca",
]

# Logos relevantes -> nome limpo no site.
LOGO_MAP = {
    "Logo Horizontal .png": "logo-horizontal.png",
    "Logo Horizontal branco.png": "logo-horizontal-branco.png",
    "Logo Horizontal preto.png": "logo-horizontal-preto.png",
    "isotipo.png": "isotipo.png",
    "isotipo branco.png": "isotipo-branco.png",
    "isotipo preto.png": "isotipo-preto.png",
    "logo vertical.png": "logo-vertical.png",
    "logo vertical branco.png": "logo-vertical-branco.png",
    "logotipo.png": "logotipo.png",
    "logotipo branco.png": "logotipo-branco.png",
}


def slug(value: str) -> str:
    value = unicodedata.normalize("NFKD", str(value))
    value = value.encode("ascii", "ignore").decode("ascii")
    value = value.lower().strip()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")


def copy_logos() -> None:
    LOGO_ASSETS.mkdir(parents=True, exist_ok=True)
    for src_name, dst_name in LOGO_MAP.items():
        src = LOGO_SRC / src_name
        if src.exists():
            shutil.copy2(src, LOGO_ASSETS / dst_name)
        else:
            print(f"  [aviso] logo nao encontrada: {src_name}")


def collect_images(folder: Path, cat_slug: str, prod_slug: str) -> list[str]:
    if not folder.exists():
        print(f"  [aviso] pasta de imagens inexistente: {folder}")
        return []
    dest = PROD_ASSETS / cat_slug / prod_slug
    dest.mkdir(parents=True, exist_ok=True)
    rel_paths: list[str] = []
    for img in sorted(folder.iterdir()):
        if img.is_file() and img.suffix.lower() in IMG_EXTS:
            clean = f"{prod_slug}-{len(rel_paths) + 1}{img.suffix.lower()}"
            shutil.copy2(img, dest / clean)
            rel_paths.append(f"assets/produtos/{cat_slug}/{prod_slug}/{clean}")
    return rel_paths


CATEGORY_TEMPLATE = """<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{nome} · Caieiras Pesca</title>
  <meta name="description" content="{nome} na Caieiras Pesca. Adicione ao carrinho e finalize seu pedido pelo WhatsApp.">
  <meta name="theme-color" content="#32699f">
  <link rel="icon" href="assets/logo/isotipo.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/styles.css">
</head>
<body data-page="categoria" data-categoria="{slug}">
  <section class="cat-hero">
    <div class="container" id="cat-hero-head"></div>
  </section>
  <section class="section" style="padding-top:0">
    <div class="container" id="category-content"></div>
  </section>
  <script src="js/icons.js"></script>
  <script src="js/data.js"></script>
  <script src="js/cart.js"></script>
  <script src="js/ui.js"></script>
</body>
</html>
"""


def write_category_pages(categorias: list[dict]) -> None:
    for c in categorias:
        page = ROOT / f"{c['slug']}.html"
        page.write_text(
            CATEGORY_TEMPLATE.format(nome=c["nome"], slug=c["slug"]), encoding="utf-8"
        )
    print(f"  paginas de categoria geradas: {len(categorias)}")


def main() -> None:
    print("Lendo catalogo...")
    wb = openpyxl.load_workbook(EXCEL, data_only=True)
    ws = wb.active

    rows = list(ws.iter_rows(values_only=True))
    header = [str(c).strip() if c is not None else "" for c in rows[0]]
    print("  colunas:", header)

    produtos = []
    for raw in rows[1:]:
        if raw is None or all(c is None for c in raw):
            continue
        categoria, produto, descricao, valor, pasta = (list(raw) + [None] * 5)[:5]
        if not produto:
            continue
        cat_slug = slug(categoria)
        prod_slug = slug(produto)
        imgs = collect_images(Path(str(pasta)), cat_slug, prod_slug)
        produtos.append(
            {
                "id": prod_slug,
                "categoria": str(categoria).strip(),
                "categoriaSlug": cat_slug,
                "nome": str(produto).strip(),
                "descricao": (str(descricao).strip() if descricao else ""),
                "valor": float(valor) if valor is not None else 0.0,
                "imagens": imgs,
            }
        )
        print(f"  + {produto} ({len(imgs)} imagem(ns))")

    categorias = [{"nome": c, "slug": slug(c)} for c in CATEGORIAS]

    write_category_pages(categorias)
    copy_logos()

    DATA_JS.parent.mkdir(parents=True, exist_ok=True)
    payload = (
        "// Arquivo gerado automaticamente por gerar_dados.py — NAO editar a mao.\n"
        "// Atualize o Excel/imagens e rode `python gerar_dados.py`.\n"
        "window.CAIEIRAS_DATA = {\n"
        f"  categorias: {json.dumps(categorias, ensure_ascii=False, indent=2)},\n"
        f"  produtos: {json.dumps(produtos, ensure_ascii=False, indent=2)}\n"
        "};\n"
    )
    DATA_JS.write_text(payload, encoding="utf-8")
    print(f"\nOK: {len(produtos)} produtos, {len(categorias)} categorias -> {DATA_JS}")


if __name__ == "__main__":
    main()
