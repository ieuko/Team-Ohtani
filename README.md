### 2. README.md 用ドキュメント

```markdown
# 🎓 Syllabus Database System (PERN Stack)

一関高専のシラバスデータを統合・検索・閲覧するためのWebアプリケーションシステムです。
Dockerを用いて環境構築を行い、PostgreSQL, Express, React, Node.js (PERNスタック) で構成されています。

## 🏗 システム構成図

各コンテナはDockerネットワーク内で接続されています。

```mermaid
graph TD
    User((User/Browser))
    
    subgraph "Docker Containers"
        Client[💻 Client Container<br/>(React:3000)]
        API[⚙️ API Container<br/>(Express:3001)]
        DB[(🗄️ Database Container<br/>PostgreSQL:5432)]
    end

    User -- "Access UI" --> Client
    User -- "Fetch Data (JSON)" --> API
    Client -- "API Request (axios)" --> API
    API -- "SQL Query" --> DB
    API -- "Exec Seed Script" --> API
🛠 技術スタックカテゴリ技術説明FrontendReactユーザーインターフェースBackendExpress.jsREST APIサーバーDatabasePostgreSQLリレーショナルデータベースEnvironmentDocker / Composeコンテナ仮想化環境🚀 環境構築と起動方法前提条件Docker Desktop がインストールされ、起動していること。1. アプリケーションの起動プロジェクトのルートディレクトリで以下のコマンドを実行します。Bashdocker compose up --build -d
初回はビルドに数分かかります。-d オプションでバックエンド実行になります。2. データベースのセットアップ (Seeding)コンテナ起動後、JSONデータをデータベースに登録するために以下のコマンドを実行します。Bashdocker compose exec api node seed.js
成功すると ✨ 全データの登録が完了しました！ と表示されます。3. アクセスURLWebアプリ: http://localhost:3000APIエンドポイント: http://localhost:3001/api/subjects📂 データベース設計 (Schema)データベース syllabusdb 内には以下のテーブルが作成されます。1. subjects (科目テーブル)科目の基本情報を管理します。カラム名型説明subject_idSERIAL (PK)自動採番IDsubject_nameVARCHAR科目名gradeINTEGER対象学年departmentVARCHAR学科/系syllabus_urlTEXT公式シラバスへのリンクパラメータ......(単位数、区分など)2. instructors (教員テーブル)教員名を一意に管理します。カラム名型説明instructor_idSERIAL (PK)教員IDinstructor_nameVARCHAR教員名 (Unique)3. subject_assignment (担当割当テーブル)科目と教員を多対多で紐付けます。💻 開発ガイドフォルダ構成.
├── docker-compose.yml  # Docker構成ファイル
├── init.sql            # DB初期化SQL (テーブル定義)
├── api/                # バックエンド (Express)
│   ├── server.js       # APIサーバー本体
│   ├── seed.js         # データ登録スクリプト
│   └── syllabas.json   # 元データ
└── client/             # フロントエンド (React)
    ├── public/
    └── src/
        └── App.js      # メイン画面ロジック
よく使うコマンド目的コマンドコンテナ起動docker compose up -d再ビルドして起動docker compose up --build -dログ確認 (全体)docker compose logs -fログ確認 (APIのみ)docker compose logs -f apiコンテナ停止docker compose down全データリセットdocker compose down -v (ボリュームも削除)⚠️ トラブルシューティングQ. サイトにアクセスできない / 画面が真っ白A. docker compose ps でコンテナが動いているか確認してください。client コンテナのログを確認し、コンパイルエラーがないかチェックしてください。Q. データベースエラーが出る / データが古いA. init.sql を変更した場合は、一度 docker compose down -v でボリュームを削除してから再起動してください。