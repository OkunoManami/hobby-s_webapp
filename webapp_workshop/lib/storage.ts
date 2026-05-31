// コメントのデータの形を定義します
export type Comment = {
  id: string;
  author: string;
  text: string;
  createdAt: string;
};

// 投稿のデータの形（型定義）を決めます
export type Post = {
  id: string;
  author: string;
  category: string;
  text: string;
  imageUrl?: string;
  authorAvatar?: string; // ★ 投稿者のアイコン写真（Base64の文字データ、またはURL）を追加
  createdAt: string;
  likes: number;
  isSample?: boolean;
  comments: Comment[];
};

const STORAGE_KEY = "my-hobby-posts";

// サンプルの趣味の記録（たくみさん達のアバター用フリー写真URLを追加します）
const INITIAL_SAMPLE_POSTS: Post[] = [
  {
    id: "sample-1",
    author: "たくみ",
    category: "カメラ",
    text: "今朝、近くの公園でアジサイの写真を撮ってきました！雨上がりの水滴がきれいに写って大満足です📸",
    imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=60",
    authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60", // 男性の写真
    createdAt: "2026-05-31 09:00",
    likes: 4,
    isSample: true,
    comments: [
      {
        id: "c1",
        author: "さくら",
        text: "すごく綺麗な写真ですね！水滴がキラキラしてます✨",
        createdAt: "05/31 10:15",
      }
    ],
  },
  {
    id: "sample-2",
    author: "さくら",
    category: "読書",
    text: "気になっていた小説を読み終えました。最後のどんでん返しに鳥肌が立ちました…！おすすめの本があったら教えてください📚",
    imageUrl: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=600&auto=format&fit=crop&q=60",
    authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60", // 女性の写真
    createdAt: "2026-05-31 11:30",
    likes: 5,
    isSample: true,
    comments: [],
  },
  {
    id: "sample-3",
    author: "ゆうと",
    category: "サイクリング",
    text: "今日は天気が良かったので、荒川沿いを30kmほど走ってきました！風が気持ちよくて最高のサイクリング日和でした🚴‍♂️",
    imageUrl: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&auto=format&fit=crop&q=60",
    authorAvatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=60", // 男性の写真
    createdAt: "2026-05-31 12:45",
    likes: 2,
    isSample: true,
    comments: [
      {
        id: "c2",
        author: "たくみ",
        text: "サイクリングいいなぁ！写真も撮りましたか？",
        createdAt: "05/31 13:00",
      }
    ],
  },
];

// すべての投稿を読み込む関数
export const getAllPosts = (): Post[] => {
  if (typeof window === "undefined") return [];
  
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_POSTS));
    return INITIAL_SAMPLE_POSTS;
  }
  return JSON.parse(data);
};

// 1. 「他の人の投稿」だけを読み込む関数
export const getOtherPosts = (): Post[] => {
  const allPosts = getAllPosts();
  return allPosts.filter(post => post.isSample === true);
};

// 2. 「自分の投稿」だけを読み込む関数
export const getMyPosts = (): Post[] => {
  const allPosts = getAllPosts();
  return allPosts.filter(post => !post.isSample);
};

// 3. 新しい投稿を保存する関数
export const saveMyPost = (postData: { author: string; category: string; text: string; imageUrl?: string }): Post => {
  const allPosts = getAllPosts();
  
  // ★ localStorageから自分のアバター画像を読み込みます
  let myAvatar = undefined;
  if (typeof window !== "undefined") {
    myAvatar = localStorage.getItem("my-app-avatar") || undefined;
  }
  
  const newPost: Post = {
    id: Date.now().toString(),
    author: postData.author,
    category: postData.category,
    text: postData.text,
    imageUrl: postData.imageUrl,
    authorAvatar: myAvatar, // ★ 自分のアイコン写真を自動で投稿データにセットします
    likes: 0,
    comments: [],
    createdAt: new Date().toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }),
  };

  const updatedPosts = [newPost, ...allPosts];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPosts));
  
  return newPost;
};

// 4. 特定の投稿に「リアクション（いいね！）」を追加する関数
export const addLike = (postId: string): Post[] => {
  const allPosts = getAllPosts();
  
  const updatedPosts = allPosts.map(post => {
    if (post.id === postId) {
      return { ...post, likes: post.likes + 1 };
    }
    return post;
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPosts));
  return updatedPosts;
};

// 5. 特定の投稿に「コメント」を追加する関数
export const saveComment = (postId: string, commentData: { author: string; text: string }): Post[] => {
  const allPosts = getAllPosts();

  const updatedPosts = allPosts.map(post => {
    if (post.id === postId) {
      // ★ コメント者のアバター画像も、もし自分自身のコメントなら自動でセットできるようにします
      let commenterAvatar = undefined;
      if (typeof window !== "undefined" && localStorage.getItem("my-app-name") === commentData.author) {
        commenterAvatar = localStorage.getItem("my-app-avatar") || undefined;
      }
      
      const newComment: Comment = {
        id: Date.now().toString(),
        author: commentData.author,
        text: commentData.text,
        createdAt: new Date().toLocaleString("ja-JP", {
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      
      const currentComments = post.comments || [];
      return {
        ...post,
        comments: [...currentComments, newComment]
      };
    }
    return post;
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPosts));
  return updatedPosts;
};

// 6. 特定の投稿を削除する関数
export const deletePost = (postId: string): Post[] => {
  const allPosts = getAllPosts();
  const updatedPosts = allPosts.filter(post => post.id !== postId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPosts));
  return updatedPosts;
};
