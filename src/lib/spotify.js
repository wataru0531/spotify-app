
// Spotify関連の処理
import axios from "axios";


class SpotifyClient {
  // ✅ 初期化 → アクセストークン付きのインスタンスが返る
  static async initialize(){
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      {
        grant_type: "client_credentials",
        client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
        client_secret: import.meta.env.VITE_SPOTIFY_CLIENT_SECRET,
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        }
      }
    );
    // console.log(response); // { data: {…}, status: 200, statusText: '', headers: AxiosHeaders, config: {…}, …}

    let spotify = new SpotifyClient(); // ✅ インスタンス化
    spotify.token = response.data.access_token;

    return spotify;
  }

  test(){
    console.log(this.token);
  }
}

const spotify = await SpotifyClient.initialize();

export default spotify;