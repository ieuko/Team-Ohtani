# ベースイメージ
FROM node:20-alpine

# 作業ディレクトリの設定
WORKDIR /usr/src/app

# package.json と package-lock.json をコピーして依存関係をインストール
COPY package*.json ./
RUN npm install

# アプリケーションのコードをコピー
COPY . .

# アプリケーションを起動するためのコマンド
CMD ["npm", "start"]