"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getMyPosts, addLike, saveComment, deletePost, Post } from "@/lib/storage";

export default function Profile() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [theme, setTheme] = useState("theme-orange");

  // ★ プロフィール情報（お名前、アイコン写真）を管理するstateを追加します
  const [myName, setMyName] = useState("ゲスト");
  const [myAvatar, setMyAvatar] = useState("");

  // 画面が表示されたタイミングでデータを読み込み、テーマとプロフィールも適用します
  useEffect(() => {
    setPosts(getMyPosts());
    
    // テーマの読み込み
    const savedTheme = localStorage.getItem("my-app-theme") || "theme-orange";
    setTheme(savedTheme);
    document.body.className = savedTheme;

    // プロフィール設定の読み込み
    const savedName = localStorage.getItem("my-app-name") || "ゲスト";
    const savedAvatar = localStorage.getItem("my-app-avatar") || "";
    setMyName(savedName);
    setMyAvatar(savedAvatar);
  }, []);

  // お名前が変更されたときの処理
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setMyName(newName);
    localStorage.setItem("my-app-name", newName); // localStorageに保存します
  };

  // アイコン写真が選択されたときの処理（Base64に変換し、正方形にリサイズして保存します）
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const SIZE = 150; // アイコン画像は 150x150 ピクセルの正方形にします
        canvas.width = SIZE;
        canvas.height = SIZE;
        const ctx = canvas.getContext("2d");
        
        if (ctx) {
          // 画像の中央部分を切り取って正方形にする処理
          const size = Math.min(img.width, img.height);
          const sx = (img.width - size) / 2;
          const sy = (img.height - size) / 2;
          ctx.drawImage(img, sx, sy, size, size, 0, 0, SIZE, SIZE);
          
          const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
          setMyAvatar(dataUrl);
          localStorage.setItem("my-app-avatar", dataUrl); // localStorageに保存します
          
          // 現在のページの表示アバターも更新するためリロードします（任意ですが、一番簡単な表示更新方法です）
          window.location.reload();
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // テーマを切り替えて保存する処理
  const changeTheme = (newTheme: string) => {
    setTheme(newTheme);
    document.body.className = newTheme;
    localStorage.setItem("my-app-theme", newTheme);
  };

  const handleLike = (id: string) => {
    addLike(id);
    setPosts(getMyPosts());
  };

  const handleComment = (id: string, author: string, text: string) => {
    saveComment(id, { author, text });
    setPosts(getMyPosts());
  };

  const handleDelete = (id: string) => {
    if (window.confirm("本当にこの記録を削除しますか？")) {
      deletePost(id);
      setPosts(getMyPosts());
    }
  };

  return (
    <div className="container">
      {/* ページのヘッダー */}
      <header className="header">
        <h1>マイページ（自分の記録） 👤</h1>
        <p>あなたがこれまでに記録した趣味の一覧です</p>
      </header>

      {/* ★ プロフィール設定フォーム */}
      <section className="profile-edit-section">
        <h2 style={{ fontSize: "1.1rem", marginBottom: "15px", color: "var(--accent)" }}>👤 プロフィール設定</h2>
        <div className="profile-preview-container">
          <div className="my-avatar-large">
            {myAvatar ? (
              <img src={myAvatar} alt="マイアバター" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              myName[0] || "ゲ"
            )}
          </div>
          <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="profile-name" className="form-label" style={{ fontSize: "0.8rem" }}>あなたのお名前</label>
              <input
                type="text"
                id="profile-name"
                value={myName}
                onChange={handleNameChange}
                placeholder="例: たくみ"
                className="form-input"
                style={{ padding: "8px 12px", fontSize: "0.9rem" }}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="profile-avatar" className="form-label" style={{ fontSize: "0.8rem" }}>アイコン写真を選択</label>
              <input
                type="file"
                id="profile-avatar"
                accept="image/*"
                onChange={handleAvatarChange}
                className="form-input"
                style={{ padding: "5px", fontSize: "0.8rem" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* テーマカラー変更パネル */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "10px",
        marginBottom: "20px",
        background: "var(--card-background)",
        padding: "12px 20px",
        borderRadius: "12px",
        border: "1px solid var(--card-border)"
      }}>
        <span style={{ fontSize: "0.85rem", fontWeight: "bold" }}>🎨 テーマカラーを変更する:</span>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => changeTheme("theme-orange")}
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              background: "#d35400",
              border: theme === "theme-orange" ? "2px solid var(--foreground)" : "none",
              cursor: "pointer",
              transform: theme === "theme-orange" ? "scale(1.15)" : "none",
              transition: "transform 0.2s"
            }}
            title="オレンジ"
          />
          <button
            onClick={() => changeTheme("theme-green")}
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              background: "#27ae60",
              border: theme === "theme-green" ? "2px solid var(--foreground)" : "none",
              cursor: "pointer",
              transform: theme === "theme-green" ? "scale(1.15)" : "none",
              transition: "transform 0.2s"
            }}
            title="グリーン"
          />
          <button
            onClick={() => changeTheme("theme-blue")}
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              background: "#2980b9",
              border: theme === "theme-blue" ? "2px solid var(--foreground)" : "none",
              cursor: "pointer",
              transform: theme === "theme-blue" ? "scale(1.15)" : "none",
              transition: "transform 0.2s"
            }}
            title="ブルー"
          />
          <button
            onClick={() => changeTheme("theme-pink")}
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              background: "#e91e63",
              border: theme === "theme-pink" ? "2px solid var(--foreground)" : "none",
              cursor: "pointer",
              transform: theme === "theme-pink" ? "scale(1.15)" : "none",
              transition: "transform 0.2s"
            }}
            title="ピンク"
          />
        </div>
      </div>

      {/* 移動するためのボタン */}
      <div className="actions">
        <Link href="/" className="btn btn-secondary" style={{ marginTop: 0 }}>
          ← みんなの公開カードを見る
        </Link>
        <Link href="/new" className="btn">
          + 新しく記録する
        </Link>
      </div>

      {/* 投稿一覧 */}
      <main className="timeline">
        {posts.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "40px 20px" }}>
            <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>
              まだ自分の趣味の記録がありません。
            </p>
            <Link href="/new" className="btn">
              最初の記録を書く ✍️
            </Link>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              onComment={handleComment}
              onDelete={handleDelete}
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
  onDelete
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
      {/* 自分の投稿（サンプルデータではない）場合のみ、削除ボタンを表示します */}
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
          {/* ★ アイコン画像があれば表示、なければ頭文字を表示します */}
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
