"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getAllPosts, addLike, saveComment, deletePost, Post } from "@/lib/storage";

// 絞り込みに使うカテゴリのリストです
const CATEGORIES = ["すべて", "カメラ", "読書", "サイクリング", "料理", "その他"];

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("すべて");

  // 画面が表示されたタイミングでデータを読み込み、テーマを適用します
  useEffect(() => {
    setPosts(getAllPosts());
    const savedTheme = localStorage.getItem("my-app-theme") || "theme-orange";
    document.body.className = savedTheme;
  }, []);

  const handleLike = (id: string) => {
    addLike(id);
    setPosts(getAllPosts());
  };

  // コメントを保存するときの処理
  const handleComment = (id: string, author: string, text: string) => {
    saveComment(id, { author, text });
    setPosts(getAllPosts()); // 最新データを読み込み直して画面を更新します
  };

  // 投稿を削除するときの処理
  const handleDelete = (id: string) => {
    // 確認のダイアログを表示して、OKの場合のみ削除を実行します
    if (window.confirm("本当にこの記録を削除しますか？")) {
      deletePost(id);
      setPosts(getAllPosts()); // 最新データを読み込み直して画面を更新します
    }
  };

  const filteredPosts = selectedCategory === "すべて"
    ? posts
    : posts.filter(post => post.category === selectedCategory);

  return (
    <div className="container">
      {/* アプリのタイトル */}
      <header className="header">
        <h1>My Hobby Log 🎨</h1>
        <p>日々の趣味をゆるく記録する場所</p>
      </header>

      {/* ナビゲーションボタン */}
      <div className="actions">
        <Link href="/profile" className="btn btn-secondary" style={{ marginTop: 0 }}>
          👤 マイページ（自分の記録）
        </Link>
        <Link href="/new" className="btn">
          + 新しく記録する
        </Link>
      </div>

      {/* カテゴリ絞り込みボタンの並び */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "25px", overflowX: "auto", paddingBottom: "10px" }}>
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`btn ${selectedCategory === category ? "" : "btn-secondary"}`}
            style={{
              padding: "6px 16px",
              fontSize: "0.85rem",
              borderRadius: "20px",
              marginTop: 0,
              whiteSpace: "nowrap"
            }}
          >
            {category === "すべて" ? "すべて 🌟" : category}
          </button>
        ))}
      </div>

      {/* 投稿一覧を表示する部分 */}
      <main className="timeline">
        {filteredPosts.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "30px 10px" }}>
            <p style={{ color: "var(--text-muted)" }}>
              「#{selectedCategory}」の公開カードはまだありません。
            </p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              onComment={handleComment}
              onDelete={handleDelete} // ★ 削除処理を渡します
            />
          ))
        )}
      </main>
    </div>
  );
}

// ==========================================
// ★ 画面の部品（コンポーネント）として、投稿カードを別に関数化します
// ==========================================
function PostCard({
  post,
  onLike,
  onComment,
  onDelete // ★ 削除用の関数を受け取ります
}: {
  post: Post;
  onLike: (id: string) => void;
  onComment: (id: string, author: string, text: string) => void;
  onDelete?: (id: string) => void;
}) {
  const [author, setAuthor] = useState("");
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author || !text) {
      alert("お名前とコメント内容は入力必須です！");
      return;
    }
    onComment(post.id, author, text);
    setText("");
  };

  return (
    <article className="card">
      {/* ★ 自分の投稿（サンプルデータではない）場合のみ、削除ボタンを表示します */}
      {!post.isSample && onDelete && (
        <button
          onClick={() => onDelete(post.id)}
          className="delete-button"
          title="この記録を削除する"
        >
          🗑️
        </button>
      )}

      <div className="card-header" style={{ paddingRight: !post.isSample ? "24px" : "0px" }}>
        <div className="author-info">
          <div className="avatar">
            {post.authorAvatar ? (
              <img src={post.authorAvatar} alt="アバター" className="avatar-image" />
            ) : (
              post.author[0]
            )}
          </div>
          <span className="author-name">{post.author}</span>
        </div>
        <span className="date">{post.createdAt}</span>
      </div>
      
      <span className="category-tag">#{post.category}</span>

      {post.imageUrl && (
        <img src={post.imageUrl} alt="趣味の写真" className="card-image" />
      )}

      <p className="content">{post.text}</p>

      {/* いいねボタン */}
      <div className="reaction-bar">
        <button onClick={() => onLike(post.id)} className="like-button">
          👍 いいね！ {post.likes}
        </button>
      </div>

      {/* コメントセクション */}
      <div className="comment-section">
        {post.comments && post.comments.length > 0 && (
          <div className="comment-list">
            {post.comments.map((comment) => (
              <div key={comment.id} className="comment-item">
                <div className="comment-header">
                  <span>{comment.author}</span>
                  <span className="comment-date">{comment.createdAt}</span>
                </div>
                <p className="comment-text">{comment.text}</p>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="comment-form">
          <input
            type="text"
            placeholder="お名前"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="comment-input-name"
            required
          />
          <input
            type="text"
            placeholder="コメントを入力..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="comment-input-text"
            required
          />
          <button type="submit" className="comment-btn">送信</button>
        </form>
      </div>
    </article>
  );
}
