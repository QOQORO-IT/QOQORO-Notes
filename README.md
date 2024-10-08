# QOQORO Notes

[English Version](README_en.md)

### Warning if the app cannot show lists of files, turn off your Firewall to allow connections with Github Pages version (If you dont use local hosting)

## 概要

QOQORO Notesは、クライアントのブラウザで動作するワードプロセッサやPKMに類似したWebアプリケーションです。NPMやその他のソフトウェアのインストールは不要です。


https://github.com/QOQORO-IT/QOQORO-Notes/assets/69721082/b7dbc481-629b-412c-93ad-8d3368ae29e0




## 特徴

- **インストール不要**: ブラウザで直接実行可能。アプリをホストするための単純な実行ファイルのみ必要。
- **WYSIWYGインターフェース**: 意図的に簡単で直感的な設計により使いやすさを実現。Latex/Katex数式の追加や右クリックでの編集が可能。テーブルの追加も可能。
- **PDFブックマーク**: エリアマークやテキストのコピーによるPDFページのブックマークが可能。右クリックメニューでテキストのコピーや引用が可能。
- **シンプルなA4レイアウト**: Reactjsやフレームワークなしで、ブラウザ上でワードプロセッサ体験（テキスト書式設定を含む）を提供。
- **ローカルフォルダをファイルサーバーとして使用**: localhostを使用してアプリを実行し、サイドバーでファイルを閲覧可能。

## 今後の計画

- **クラウドストレージの使用**: ポータビリティ体験の向上とファイルのバックアップのため。
- **クロスプラットフォーム対応**: 主要なブラウザとデバイスでレスポンシブUIにて動作（開発中）。
- **その他の興味深い機能が近日公開予定**

## 使用方法

1. [qnote_anchor.exe](https://github.com/QOQORO-IT/QOQORO-Notes/releases/download/clientside/QOQORO_Anchor.exe)をダウンロードして開き、フォルダに接続します。このリポジトリをダウンロードしてウェブアプリをホスティングすることもできます。
2. 最初の編集ボックスに、このウェブアプリのダウンロードコードを抽出後のディレクトリに設定します（デプロイされたウェブサイトを使用するだけの場合は、空白のままにしてください）。
3. 2番目の編集ボックスに、ノートやPDFを保存したいフォルダのディレクトリを設定します。
4. **アプリを起動**（ウェブアプリのコードがある場合）または**既存のウェブサイトを開く**を押して、ブラウザでQOQORO Notesウェブアプリを開きます。
5. 文書の作成、編集、保存を開始します。
6. 追加のセットアップは必要ありません

## 既知の不具合
このWebアプリはまだバグが存在します。動的変数の再構築と監視が必要です。ユーザー入力に対して非常に敏感なイベントが発生するため、非常に長いコンテンツの貼り付けが困難な場合があります。

## 貢献

貢献を歓迎します！必要に応じてこのリポジトリをフォークしてください。
