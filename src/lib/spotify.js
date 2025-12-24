
// Spotify関連の処理
import axios from "axios";


class SpotifyClient {
  // ✅ 初期化 → アクセストークン付きのインスタンスが返る
  static async initialize(){
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      {
        grant_type: "client_credentials", // どの認証方法を使いますか？
                                          // → ユーザーのログインを使わず、アプリIDと秘密鍵だけで認証する方式
                                          // client_credentials → アプリ自身としてアクセス
                                          //                      ・トークンは1つ
                                          //                      ・全ユーザーで共有
                                          //                      ・公開情報のみ
        client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID, // Spotify開発者ページで発行されるアプリID
        client_secret: import.meta.env.VITE_SPOTIFY_CLIENT_SECRET, // アプリ専用の秘密鍵
      },
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

    let spotify = new SpotifyClient(); // ✅ インスタンス化
    spotify.token = response.data.access_token;

    return spotify;
  }

  // ✅ 最近流行りの曲を取得
  async getPopularSongs(){
    // console.log(this.token);

    const response = await axios.get(
      "https://api.spotify.com/v1/playlists/5SLPaOxQyJ8Ne9zpmTOvSe",
      {
        headers: {
          Authorization: `Bearer ${this.token}` // Bearer → このトークンを持っている者が正当な利用者」という意味の認証方式名。
        }
      }
    );
    // console.log(response.data);
    return response.data.tracks;
  }

  // ✅ 曲の検索
  async searchSongs(_keyword, _limit, _offset){ 
    // console.log(_offset);

    const response = await axios.get(
      `https://api.spotify.com/v1/search`,
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
        params: { // URLの ?key=value の部分をaxiosが自動で作ってくれる仕組み
                  // → ?q=曲名&type=track に変換されてSpotifyに送られる
          q: _keyword,
          type: "track", // 検索結果を曲だけに
          limit: _limit, // 件数制限
          offset: _offset, // ⭐️ 先頭から曲を何件スキップするか。
                           // → Spotifyは、indexは0から並び、曲は1から始まる。
                           // → 0なら、 0件スキップ → index 0〜19を返す
                           // → 20なら、20件スキップ → index 20〜39 を返す
          // market: "JP", // 日本で再生可能な曲のみ取得
          // include_external: ,
        }
      }
    );
    // console.log(response)

    return response.data.tracks;
  }
}

const spotify = await SpotifyClient.initialize();

export default spotify;
