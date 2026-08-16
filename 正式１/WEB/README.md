# SHO. Portfolio

IT・プログラミング活動をまとめる個人ポートフォリオサイトです。
HTML / CSS / JavaScript を中心に構築し、資格・プロジェクト・スキルのデータは
Supabase（データベース + 認証）で管理します。個人情報は一切掲載していません。

デザインは「コードエディタ / ターミナル」をモチーフにしています。
ヒーローは実際にコードがタイプされるアニメーションになっていて、
セクション見出しは `$ cat qualifications.json` のようなコマンド風の表示です。

---

## 1. 作成したファイル

```
/
├── index.html          公開ページ（HOME / Qualifications / Projects / Skills）
├── admin.html           管理画面（ログイン + ダッシュボード）
├── css/
│   └── style.css        全ページ共通のデザイン
├── js/
│   ├── supabase-client.js   Supabase接続設定（URLと公開anonキーのみ）
│   ├── app.js                公開ページのデータ取得・描画・タイピングアニメーション
│   └── admin.js               管理画面のログイン処理とCRUD（追加・編集・削除）
├── sql/
│   └── schema.sql        Supabaseに貼り付けて実行するテーブル作成用SQL
└── README.md             このファイル
```

管理者パスワードはどのファイルにも書かれていません。ログインは Supabase Auth が
サーバー側で処理するため、GitHub Pages で公開してもソースコードから見えません。

---

## 2. ローカルでの起動方法

このサイトは `type="module"` の JavaScript を使っているため、
`index.html` をダブルクリックするだけでは動きません（ブラウザのセキュリティ制限）。
簡易サーバーを立てて開いてください。

**VS Codeを使う場合（おすすめ・一番簡単）**
1. 拡張機能「Live Server」をインストール
2. `index.html` を右クリック →「Open with Live Server」

**ターミナルを使う場合**
```bash
cd portfolio
python -m http.server 8000
```
その後ブラウザで `http://localhost:8000` を開く。

※ この時点ではまだ Supabase の設定をしていないので、データは表示されません。
次のステップに進んでください。

---

## 3. Supabaseの設定方法

### 3-1. プロジェクトを作る
1. https://supabase.com にアクセスし、無料アカウントを作成
2. 「New project」から新しいプロジェクトを作成（リージョンは Tokyo が近くて速い）
3. データベースのパスワードを設定（これはSupabaseへのログイン用なので、
   サイトの管理者パスワードとは別物です。忘れないように保存してください）

### 3-2. テーブルを作る
1. 左メニューの「SQL Editor」を開く
2. このプロジェクトの `sql/schema.sql` の中身を全部コピーして貼り付け
3. 右下の「Run」を実行 → `qualifications` / `projects` / `skills` の3つの
   テーブルが作成され、公開読み取り用のセキュリティ設定（RLS）も同時に入ります

### 3-3. 接続情報をコードに入れる
1. 左メニューの「Project Settings」→「API」を開く
2. **Project URL** と **anon public key** をコピー
3. `js/supabase-client.js` を開き、以下の部分を書き換える

```js
const SUPABASE_URL = 'https://YOUR-PROJECT-ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR-ANON-PUBLIC-KEY';
```

> **補足：この2つの値は公開しても安全です。**
> `anon key` は「誰でも見ていいデータだけにアクセスできる鍵」で、
> パスワードではありません。実際のログインは次のステップで作る
> 管理者アカウントの「メールアドレス + パスワード」で行われ、
> そのパスワードは Supabase のサーバー内だけで管理されます。

---

## 4. GitHub Pagesなどへの公開方法

1. GitHubで新しいリポジトリを作成（例：`portfolio`）
2. このフォルダの中身をすべてリポジトリにアップロード（push）
3. リポジトリの「Settings」→「Pages」を開く
4. 「Branch」で `main` を選択し「Save」
5. しばらくすると `https://ユーザー名.github.io/portfolio/` でサイトが公開されます

公開後は `https://ユーザー名.github.io/portfolio/admin.html` が管理画面になります
（このURLはリンクとして目立たせていませんが、隠しページではないので、
 誰でもログイン画面自体は開けます。ログインできなければデータは変更できません）。

---

## 5. 管理者ログインの設定方法

### 5-1. 新規サインアップを無効化する（重要）
デフォルトのままだと誰でもアカウント登録できてしまうため、必ず無効化します。
1. Supabaseの「Authentication」→「Providers」→「Email」を開く
2. **「Allow new users to sign up」をOFF**にする

### 5-2. 自分専用の管理者アカウントを作る
1. 「Authentication」→「Users」を開く
2. 「Add user」→「Create new user」
3. 自分のメールアドレスとパスワードを入力して作成
   （このパスワードが管理画面 `admin.html` のログインパスワードになります）

### 5-3. 管理画面にログインする
1. `admin.html` を開く
2. 先ほど作成したメールアドレスとパスワードでログイン
3. ログインできれば、Qualifications / Projects / Skills を
   自由に追加・編集・削除できます。保存すると画面下に「保存しました」と表示されます

### 5-4. さらにセキュリティを厳しくしたい場合（任意）
「ログインさえできれば誰でも編集できる」設定になっているので、
Supabaseのユーザーは自分1人だけにしておくのが基本です。
もし将来的にもっと厳しくしたい場合は、`sql/schema.sql` の末尾コメントにある通り、
書き込み用のポリシーを自分のメールアドレスだけに限定する形に変更できます。

---

## データの初期投入について

管理画面から手動で1件ずつ追加してもいいですが、最初から
サンプルデータを入れておきたい場合は、`sql/schema.sql` の一番下にある
コメントアウトされた `insert` 文の `--` を外して SQL Editor で実行してください。

---

## トラブルシューティング

| 症状 | 原因の可能性 |
|---|---|
| ページを開いても何も表示されない | `supabase-client.js` のURL/キーが未設定、またはローカルサーバーを使っていない |
| ログインできない | Supabaseで管理者ユーザーを作成していない、パスワードが違う |
| 保存しても反映されない | `schema.sql` を実行していない、RLSポリシーが正しく作られていない |
| GitHub Pagesで真っ白になる | ファイルパスの大文字小文字（GitHub Pagesは大文字小文字を区別します） |
