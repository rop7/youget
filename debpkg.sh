#!/bin/bash

set -e;

# Verificar se jq está instalado
if ! command -v jq &> /dev/null; then
    echo "Instalando jq..."
    sudo apt update && sudo apt install -y jq
fi

# Ler informações do package.json
echo "Lendo package.json..."

if [ ! -f package.json ]; then
    echo "Erro: package.json não encontrado!"
    exit 1
fi

EMAIL=$(jq -r '.email' package.json)
AUTHOR=$(jq -r '.author' package.json)
BIN_PATH=$(jq -r '.bin[]' package.json)
VERSION=$(jq -r '.version' package.json)
PACKAGE_NAME=$(jq -r '.name' package.json)
BIN_NAME=$(jq -r '.bin | keys[0]' package.json)
DESCRIPTION=$(jq -r '.description' package.json)
DEPENDENCIES=$(jq -r '.aptdeps // empty' package.json)

# Configurações
MAINTAINER="$AUTHOR <$EMAIL>"

# Diretórios de trabalho
BUILD_DIR="./debuild"
DEB_DIR="$BUILD_DIR/deb"
BIN_DIR="$DEB_DIR/usr/bin"
INSTALL_DIR="$DEB_DIR/usr/share/$PACKAGE_NAME"

echo "Limpando builds anteriores e preparando diretórios..."

    rm -rf "$BUILD_DIR"
    mkdir -p "$INSTALL_DIR" "$BIN_DIR" "$DEB_DIR/DEBIAN"

echo "Instalando dependências de produção..."

    npm install --omit=dev

echo "Copiando arquivos do projeto..."

    cp -r package.json "$INSTALL_DIR/"
    cp -r bin "$INSTALL_DIR/"
    cp -r node_modules "$INSTALL_DIR/" 2>/dev/null || true

echo "Criando script de inicialização..."

    echo "#!/bin/bash" > "$BIN_DIR/$BIN_NAME"
    echo "exec /usr/share/$PACKAGE_NAME/$BIN_PATH \"\$@\"" >> "$BIN_DIR/$BIN_NAME"
    chmod +x "$BIN_DIR/$BIN_NAME"
    

echo "Criando arquivo de controle do Debian..."

    echo "Package: $PACKAGE_NAME" >> "$DEB_DIR/DEBIAN/control"
    echo "Version: $VERSION" >> "$DEB_DIR/DEBIAN/control"
    echo "Section: utils" >> "$DEB_DIR/DEBIAN/control"
    echo "Priority: optional" >> "$DEB_DIR/DEBIAN/control"
    echo "Architecture: all" >> "$DEB_DIR/DEBIAN/control"
    echo "Maintainer: $MAINTAINER" >> "$DEB_DIR/DEBIAN/control"
    echo "Description: $DESCRIPTION" >> "$DEB_DIR/DEBIAN/control"

    if [ -n "$DEPENDENCIES" ]; then

        echo "Dependências encontradas:"
    
        DEP_LIST=""
    
        for key in $(echo "$DEPENDENCIES" | jq -r 'keys[]'); do
           
            value=$(echo "$DEPENDENCIES" | jq -r --arg k "$key" '.[$k]')
           
            echo "  - $key: $value"
           
            if [ -z "$DEP_LIST" ]; then
                DEP_LIST="$value"
            else
                DEP_LIST="$DEP_LIST, $value"
            fi
        
        done;
    
        echo "Depends: $DEP_LIST" >> "$DEB_DIR/DEBIAN/control"
    
    else
        echo "Nenhuma dependência encontrada."
    fi

echo "Adicionando scripts de postinst e prerm"

    if [ -f postinst.sh ]; then
        echo "Script postinst.sh encontrado."
    else
        echo "Aviso: postinst.sh não encontrado. Continuando sem ele."
    fi

    if [ -f preuninst.sh ]; then
        echo "Script preuninst.sh encontrado."
    else
        echo "Aviso: preuninst.sh não encontrado. Continuando sem ele."
    fi

    cp -r postinst.sh "$DEB_DIR/DEBIAN/postinst"
    chmod 755 "$DEB_DIR/DEBIAN/postinst"

    cp -r preuninst.sh "$DEB_DIR/DEBIAN/prerm"
    chmod 755 "$DEB_DIR/DEBIAN/prerm"

echo "Construindo pacote Debian..."

    dpkg-deb --root-owner-group  --build "$DEB_DIR" "${PACKAGE_NAME}_${VERSION}_all.deb"

echo "Movendo pacote para o diretório de distribuição..."

    rm -rf ./debdist
    mkdir -p ./debdist
    mv "${PACKAGE_NAME}_${VERSION}_all.deb" ./debdist
    ln -f "./debdist/${PACKAGE_NAME}_${VERSION}_all.deb" "./debdist/latest.deb" 

echo "Pacote debian criado com sucesso: ${PACKAGE_NAME}_${VERSION}_all.deb"

exit 0;