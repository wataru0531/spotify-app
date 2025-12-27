
// Spotify関連の処理

import axios from "axios";

const SPOTIFY_ACCOUNTS_URL = "https://accounts.spotify.com/api";
const SPOTIFY_API_URL = "https://api.spotify.com/v1";
const POPULAR_PLAYLIST_ID = "5SLPaOxQyJ8Ne9zpmTOvSe";


class SpotifyClient {
  static instance = null;

  constructor({ accessToken, expiresAt }) {
    this.accessToken = accessToken;
    this.expiresAt = expiresAt;
    // console.log(this.accessToken, this.expiresAt);

    // 👉 axios.create ... 設定済みのaxiosを作り使い回す。
    //                     何度もurl、headersを書かなくていいし、
    this.api = axios.create({
      baseURL: SPOTIFY_API_URL, // https://accounts.spotify.com/api
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });
  }

  // ✅ 初期化、シングルトン取得メソッド
  static async getInstance(){ // static インスタンス化しなくても呼べる
    // ⭐️ シングルトンの設定。
    //    → インスタンスが既にあれば返す。
    //    → 複数のコンポーネントから SpotifyClient を呼び出す場合に 毎回新しいインスタンスを作らなくて済む
    //      状態(アクセストークン、有効期限)を アプリ全体で共通化できる
    if(SpotifyClient.instance) {
      return SpotifyClient.instance;
    }

    // console.log(this)
    const { accessToken, expiresAt } = await SpotifyClient.#fetchAccessToken();
    SpotifyClient.instance = new SpotifyClient({ accessToken, expiresAt })

    return SpotifyClient.instance
  }

  // ✅ 初期化 → アクセストークン付きのインスタンスを返す
  // ⭐️ # → private(プライベート)メンバーを表す記号。
  //        functionを省略可能。クラス内では省略できる。
  static async #fetchAccessToken(){
    try{
      const response = await axios.post(
        `${SPOTIFY_ACCOUNTS_URL}/token`,
        new URLSearchParams({ // ⭐️ TODO
          grant_type: "client_credentials", // どの認証方法を使いますか？
                                            // → ユーザーのログインを使わず、アプリIDと秘密鍵だけで認証する方式
                                            // client_credentials → アプリ自身としてアクセス
                                            //                      ・トークンは1つ
                                            //                      ・全ユーザーで共有
                                            //                      ・公開情報のみ
          client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID, // Spotify開発者ページで発行されるアプリID
          client_secret: import.meta.env.VITE_SPOTIFY_CLIENT_SECRET, // アプリ専用の秘密鍵
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded", // 送信データはフォーム形式で送れということ
                                                                // form-urlencoded 
                                                                // → フォームの値をURL形式にエンコードする
                                                                //   HTMLのフォーム送信と同じ形式で、
                                                                //   データを「キー=値&キー=値」の形にエンコードして送ります
          }
        }
      );
      // console.log(response); // { data: {…}, status: 200, statusText: '', headers: AxiosHeaders, config: {…}, …}

      const { access_token, expires_in } = response.data;
      // console.log(expires_in); // 3600 → アクセストークンが何秒間有効か。1時間だけ有効

      // console.log(Date.now())
      return {
        accessToken: access_token,
        expiresAt: Date.now() + expires_in * 1000, // 👉 絶対時刻に変換。
                                                   //    * 1000 ... ミリ秒に変換。Date.now()に揃えるため
      }
    } catch(e){
      throw new Error("Spotify認証に失敗しました。", e);
    }
  }

  // ✅ トークンの更新 → 初期化時に設定した有効期限を超えた場合にのみ発火
  async #refreshToken() {
    if (Date.now() < this.expiresAt) return;
    // console.log("in")

    const { accessToken, expiresAt } = await SpotifyClient.#fetchAccessToken();
    // console.log(this.accessToken, this.expiresAt);

    this.accessToken = accessToken;
    this.expiresAt = expiresAt;
    this.api.defaults.headers.Authorization = `Bearer ${accessToken}`;
  }

  // ✅ 最近流行りの曲を取得
  async getPopularSongs(_playlistId = POPULAR_PLAYLIST_ID){
    // console.log(this.token);
    if(!_playlistId) throw new Error("_playlistId が指定されていません。");

    await this.#refreshToken(); // トークンの更新

    try {
      // this.apiに初期化したbaseUrl → https://api.spotify.com/v1
      // const response = await axios.get("https://api.spotify.com/v1/playlists/5SLPaOxQyJ8Ne9zpmTOvSe", { ... }
      const response = await this.api.get(`/playlists/${_playlistId}`)
      return response.data.tracks;
    } catch(e){
      console.log("getPopularSongs failed", e);
      throw new Error("最近流行りの曲の取得に失敗しました；")
    }
  }

  // ✅ 曲の検索
  async searchSongs(_keyword, _limit, _offset){ 
    // console.log(_offset);
    if(!_keyword?.trim()) throw new Error("検索キーワードが空です。");

    await this.#refreshToken(); // トークンを更新

    try{
      // axios.get(`https://api.spotify.com/v1/search`, { ... }
      const response = await this.api.get("/search", {
        params: { // URLの ?key=value の部分をaxiosが自動で作ってくれる仕組み
                  // → ?q=曲名&type=track に変換されてSpotifyに送られる
          q: _keyword, // 検索クエリ
          type: "track", // 検索結果を曲だけに
          limit: _limit, // 件数制限
          offset: _offset, // ⭐️ 先頭から曲を何件スキップするか。
                          // → Spotifyは、indexは0から並び、曲は1から始まる。
                          // → 0なら、 0件スキップ → index 0〜19を返す
                          // → 20なら、20件スキップ → index 20〜39 を返す
          // market: "JP", // 日本で再生可能な曲のみ取得
          // include_external: ,
        }
      });
      // console.log(response)

      return response.data.tracks;
    } catch(e){
      console.error("searchSongs failed", e);
      throw new Error("曲検索に失敗しました。");
    }
  }
}

export default SpotifyClient;











// import axios from "axios";

// class SpotifyClient {
//   // ✅ 初期化 → アクセストークン付きのインスタンスを返す
//   static async initialize(){
//     const response = await axios.post(
//       "https://accounts.spotify.com/api/token",
//       {
//         grant_type: "client_credentials", // どの認証方法を使いますか？
//                                           // → ユーザーのログインを使わず、アプリIDと秘密鍵だけで認証する方式
//                                           // client_credentials → アプリ自身としてアクセス
//                                           //                      ・トークンは1つ
//                                           //                      ・全ユーザーで共有
//                                           //                      ・公開情報のみ
//         client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID, // Spotify開発者ページで発行されるアプリID
//         client_secret: import.meta.env.VITE_SPOTIFY_CLIENT_SECRET, // アプリ専用の秘密鍵
//       },
//       {
//         headers: {
//           "Content-Type": "application/x-www-form-urlencoded", // 送信データはフォーム形式で送れということ
//                                                                // form-urlencoded 
//                                                                // → フォームの値をURL形式にエンコードする
//                                                                //   HTMLのフォーム送信と同じ形式で、
//                                                                //   データを「キー=値&キー=値」の形にエンコードして送ります
//         }
//       }
//     );
//     // console.log(response); // { data: {…}, status: 200, statusText: '', headers: AxiosHeaders, config: {…}, …}

//     let spotify = new SpotifyClient(); // ✅ インスタンス化
//     spotify.token = response.data.access_token;

//     return spotify;
//   }

//   // ✅ 最近流行りの曲を取得
//   async getPopularSongs(){
//     // console.log(this.token);

//     const response = await axios.get(
//       "https://api.spotify.com/v1/playlists/5SLPaOxQyJ8Ne9zpmTOvSe",
//       {
//         headers: {
//           Authorization: `Bearer ${this.token}` // Bearer → このトークンを持っている者が正当な利用者」という意味の認証方式名。
//         }
//       }
//     );
//     // console.log(response.data);
//     return response.data.tracks;
//   }

//   // ✅ 曲の検索
//   async searchSongs(_keyword, _limit, _offset){ 
//     // console.log(_offset);

//     const response = await axios.get(
//       `https://api.spotify.com/v1/search`,
//       {
//         headers: {
//           Authorization: `Bearer ${this.token}`,
//         },
//         params: { // URLの ?key=value の部分をaxiosが自動で作ってくれる仕組み
//                   // → ?q=曲名&type=track に変換されてSpotifyに送られる
//           q: _keyword,
//           type: "track", // 検索結果を曲だけに
//           limit: _limit, // 件数制限
//           offset: _offset, // ⭐️ 先頭から曲を何件スキップするか。
//                            // → Spotifyは、indexは0から並び、曲は1から始まる。
//                            // → 0なら、 0件スキップ → index 0〜19を返す
//                            // → 20なら、20件スキップ → index 20〜39 を返す
//           // market: "JP", // 日本で再生可能な曲のみ取得
//           // include_external: ,
//         }
//       }
//     );
//     // console.log(response)

//     return response.data.tracks;
//   }
// }

// const spotify = await SpotifyClient.initialize();

// export default spotify;
