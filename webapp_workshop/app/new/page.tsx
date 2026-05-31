"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveMyPost } from "@/lib/storage";

export default function NewPost() {
  const router = useRouter();

  // 画面が表示されたタイミングでテーマを適用し、お名前を自動入力します
  useEffect(() => {
    const savedTheme = localStorage.getItem("my-app-theme") || "theme-orange";
    document.body.className = savedTheme;

    // マイページで登録したお名前があれば、最初から入力欄にセットします
    const savedName = localStorage.getItem("my-app-name");
    if (savedName && savedName !== "ゲスト") {
      setAuthor(savedName);
    }
  }, []);
  
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("カメラ");
  const [text, setText] = useState("");
  // 写真のデータ（文字に変換されたもの）を覚えるstateです
  const [imageUrl, setImageUrl] = useState("");

  // 写真ファイルが選ばれたときに、文字データ（Base64）に変換する処理です
  // メモ帳の容量がいっぱいにならないよう、画像を小さく縮小（リサイズ）してから保存します
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // 画像を縮小するための「キャンバス」を作ります
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 500; // 最大の幅を500ピクセルにします
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // 画質を少し落として（0.7 = 70%）データ容量をコンパクトにします
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
          setImageUrl(dataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!author || !text) {
      alert("お名前と内容は入力必須です！");
      return;
    }
    
    // 入力された内容（写真も含めて）をlocalStorageに保存します
    saveMyPost({ author, category, text, imageUrl });
    
    alert("趣味の記録を保存しました！");
    
    // マイページ（プロフィール）に移動します
    router.push("/profile");
  };

  return (
    <div className="container">
      <header className="header">
        <h1>新しい趣味を記録する ✍️</h1>
        <p>今日おこなった趣味の活動を書いてみましょう</p>
      </header>

      <main className="card">
        <form onSubmit={handleSubmit}>
          {/* お名前 */}
          <div className="form-group">
            <label htmlFor="author" className="form-label">お名前</label>
            <input
              type="text"
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="例: たくみ"
              className="form-input"
              required
            />
          </div>

          {/* カテゴリ */}
          <div className="form-group">
            <label htmlFor="category" className="form-label">カテゴリ</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="form-select"
            >
              <option value="カメラ">カメラ 📸</option>
              <option value="読書">読書 📚</option>
              <option value="サイクリング">サイクリング 🚴‍♂️</option>
              <option value="料理">料理 🍳</option>
              <option value="その他">その他 🎨</option>
            </select>
          </div>

          {/* 写真の追加欄 */}
          <div className="form-group">
            <label htmlFor="image" className="form-label">写真（任意）</label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageChange}
              className="form-input"
              style={{ padding: "8px" }}
            />
            {/* 選択された写真のプレビュー表示 */}
            {imageUrl && (
              <div style={{ marginTop: "10px", position: "relative", borderRadius: "8px", overflow: "hidden", maxHeight: "200px" }}>
                <img src={imageUrl} alt="プレビュー" style={{ width: "100%", height: "auto", display: "block" }} />
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    background: "rgba(0, 0, 0, 0.6)",
                    color: "white",
                    border: "none",
                    borderRadius: "50%",
                    width: "24px",
                    height: "24px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* 今日やったこと */}
          <div className="form-group">
            <label htmlFor="text" className="form-label">今日やったこと</label>
            <textarea
              id="text"
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="例: 荒川沿いを走ってきました！"
              className="form-textarea"
              required
            />
          </div>

          <button type="submit" className="btn" style={{ width: "100%" }}>
            記録をのこす
          </button>
        </form>

        <Link href="/" className="btn btn-secondary" style={{ width: "100%", display: "block" }}>
          キャンセル
        </Link>
      </main>
    </div>
  );
}
