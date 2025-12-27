
// import './App.css'

// TODO ... ① 検索結果の 20 / 総合件数を表示
//          ② 再生プレビュー
//          ③ 起きに入れでローカルストレージに保存
//          ④ 過去の検索キーワードを表示
//          ⑤ 並び替え、フィルタ
//          ⑥ ダーク、ライト切り替え
//          ⑦ 


import { useEffect, useState } from "react";

import SpotifyClient from "./lib/spotify";
import { SongList } from "./components/SongList";
import { SearchInput } from "./components/SearchInput.jsx";
import { Pagination } from "./components/Pagination.jsx";


export default function App() {
  const [ spotify, setSpotify ] = useState(null); // SpotifyClientのインスタンス

  // Reactの大原則：状態は使う一番上の親コンポーネントに置く
  // const [ isLoading, setIsLoading ] = useState(true);
  const [ isLoading, setIsLoading ] = useState({
    popular: true, // 人気曲検索用のローディング状況
    search: false, // 検索用のローディング状況
  });

  const [ popularSongs, setPopularSongs ] = useState([]);
  const [ keyword, setKeyword ] = useState("");
  const [ searchedSongs, setSearchedSongs ] = useState(null);
  const isSearchedResult = searchedSongs != null; // 検索文字列があればtrue
                                                  // → handleInputなどが発火されると、コンポーネント自体が再レンダリング
                                                  //   されるから動的にここも変更される。
                                                  //   再レンダリングは、ステートが変更した時だけ起きる

  const [ pagination, setPagination ] = useState({
    page: 1,
    hasNext: false,
    hasPrev: false,
  });

  const [ errorMessage, setErrorMessage ] = useState("");

  const limit = 20; // 1ページあたり20件データを取得

  // ✅ 最近流行りの曲を取得
  const fetchPopularSongs = async (_client) => {
    // console.log(_client);
    try {
      // setIsLoading(true);
      setIsLoading(prev => ({ ...prev, popular: true }))

      const result = await _client.getPopularSongs();
      // console.log(result.items); // (98) [{…}, {…}, {…}, {…}, ...]

      // ✅ 曲情報のみの配列として取得
      const popularSongsTrack = result.items.map(item => {
        return item.track; // 👉 trackに音楽の情報が格納されている
      });
      // console.log(popularSongsTrack)

      setPopularSongs(popularSongsTrack);
    } catch(e){
      console.error("Failed to fetch popular songs", e);
    } finally {
      // console.log("finally")
      // setIsLoading(false);
      setIsLoading(prev => ({ ...prev, popular: false }))
    }
  }

  // ✅ 検索文字列を取得
  const handleInputChange = (e) => {
    // console.log(e.target.value);
    setKeyword(e.target.value);
  }

  // ✅ 音楽を検索する
  const getSearchSongs = async (_page = 1) => {
    if(!spotify) return; // 

    // console.log(keyword)
    if(keyword.trim() === ""){
      // console.worn("keyword is empty");
      setErrorMessage("検索キーワードを入力してください。");
      return;
    }
    setErrorMessage("");
    
    try {
      // setIsLoading(true);
      setIsLoading(prev => ({ ...prev, search: true }));

      // ✅ offset ... 何件目からデータを取るか。
      // 👉 欲しいページに対する、曲の最初の件数を取得。引数がからなら0を返す
      // parseInt() ... 数字に変換
      const offset = parseInt(_page) ? (parseInt(_page) - 1) * limit : 0;
      const result = await spotify.searchSongs(keyword, limit, offset);
      // console.log(result); // { href: 'https://api.spotify.com/v1/search?offset=0&limit=2…uki&type=track&locale=ja,en-US;q%3D0.9,en;q%3D0.8', limit: 20, next: 'https://api.spotify.com/v1/search?offset=20&limit=…uki&type=track&locale=ja,en-US;q%3D0.9,en;q%3D0.8',... }

      // console.log(!result.next); // false。真偽地に変換して反転
      // console.log(!!result.next); // true。元に戻す
      setPagination({
        page: _page,
        hasNext: !!result.next, // next ... 次のページを取得するための完全なURL
        hasPrev: !!result.previous, // nextと同様
      })

      setSearchedSongs(result.items || []);
    } catch(e) {
      console.error("Failed to search songs", e);
      setErrorMessage("検査に失敗しました。もう一度お試しください。");
      setSearchedSongs([])
    } finally {
      // setIsLoading(false);
      setIsLoading(prev => ({ ...prev, search: false }));
    }
  }

  // ✅ 次へボタンクリック
  const moveToNext = async () => {
    if(!pagination.hasNext) return;
    await getSearchSongs(pagination.page + 1);
  }

  // ✅ 前へ戻るボタンクリック
  const moveToPrev = async () => {
    if(!pagination.hasPrev) return;
    await getSearchSongs(pagination.page - 1);
  }

  // ✅ コンポーネントに描画後に発火
  useEffect(() => {
    const init = async () => {
      // ⭐️ SpotifyClient 初期化
      const client = await SpotifyClient.initialize();
      // console.log(client)
      setSpotify(client);

      await fetchPopularSongs(client);
    };
    init();
  }, []);
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      {
        isLoading.popular ?
          <div className="h-screen flex items-center justify-center">
            <p>Loading...</p>
          </div>
        : (
          <main className="flex-1 p-8 mb-20">
            <header className="flex justify-between items-center mb-10">
              <h1 className="text-4xl font-bold">Music App</h1>
            </header>

            <SearchInput 
              keyword={ keyword }
              handleInputChange={ handleInputChange } 
              getSearchSongs={ getSearchSongs }
              errorMessage={ errorMessage }
            />

            <section>
              <h2 className="text-2xl font-semibold mb-5">
                { isSearchedResult ? "SearchResult" : "Popular Songs"}
              </h2>

              <SongList
                isLoading={ isSearchedResult ? isLoading.search : isLoading.popular }
                // デフォルト → 流行りの曲一覧。検索した場合は検索結果を一覧で表示
                songs={ isSearchedResult ? searchedSongs : popularSongs } 
              />

              {/* ページネーション */}
              { 
                isSearchedResult &&
                  <Pagination 
                    moveToPrev={ pagination.hasPrev ? moveToPrev : null }
                    moveToNext={ pagination.hasNext ? moveToNext : null } 
                  /> 
              }

            </section>
          </main>
        )
      }
      
    </div>
  );
}







// import { useEffect, useState } from "react";

// import SpotifyClient from "./lib/spotify";
// import { SongList } from "./components/SongList";
// import { SearchInput } from "./components/SearchInput.jsx";
// import { Pagination } from "./components/Pagination.jsx";


// export default function App() {
//   // ⭐️ SpotifyClient 初期化
//   const spotify = await SpotifyClient.initialize();

//   // Reactの大原則：状態は使う一番上の親コンポーネントに置く
//   // const [ isLoading, setIsLoading ] = useState(true);
//   const [ isLoading, setIsLoading ] = useState({
//     popular: true, // 人気曲検索用のローディング状況
//     search: false, // 検索用のローディング状況
//   });

//   const [ popularSongs, setPopularSongs ] = useState([]);
//   const [ keyword, setKeyword ] = useState("");
//   const [ searchedSongs, setSearchedSongs ] = useState(null);
//   const isSearchedResult = searchedSongs != null; // 検索文字列があればtrue
//                                                   // → handleInputなどが発火されると、コンポーネント自体が再レンダリング
//                                                   //   されるから動的にここも変更される。
//                                                   //   再レンダリングは、ステートが変更した時だけ起きる

//   const [ pagination, setPagination ] = useState({
//     page: 1,
//     hasNext: false,
//     hasPrev: false,
//   });

//   const [ errorMessage, setErrorMessage ] = useState("");

//   const limit = 20; // 1ページあたり20件データを取得

//   // ✅ 最近流行りの曲を取得
//   const fetchPopularSongs = async () => {
//     try {
//       // setIsLoading(true);
//       setIsLoading(prev => ({ ...prev, popular: true }))

//       const result = await spotify.getPopularSongs();
//       // console.log(result.items); // (98) [{…}, {…}, {…}, {…}, ...]

//       // ✅ 曲情報のみの配列として取得
//       const popularSongsTrack = result.items.map(item => {
//         return item.track; // 👉 trackに音楽の情報が格納されている
//       });
//       // console.log(popularSongsTrack)

//       setPopularSongs(popularSongsTrack);
//     } catch(e){
//       console.error("Failed to fetch popular songs", e);
//     } finally {
//       // console.log("finally")
//       // setIsLoading(false);
//       setIsLoading(prev => ({ ...prev, popular: false }))
//     }
//   }

//   // ✅ 検索文字列を取得
//   const handleInputChange = (e) => {
//     // console.log(e.target.value);
//     setKeyword(e.target.value);
//   }

//   // ✅ 検索したい音楽を取得する
//   const getSearchSongs = async (_page = 1) => {
//     // console.log(keyword)
//     if(keyword.trim() === ""){
//       // console.worn("keyword is empty");
//       setErrorMessage("検索キーワードを入力してください。");
//       return;
//     }
//     setErrorMessage("");
    
//     try {
//       // setIsLoading(true);
//       setIsLoading(prev => ({ ...prev, search: true }));

//       // ✅ offset ... 何件目からデータを取るか。
//       // 👉 欲しいページに対する、曲の最初の件数を取得。引数がからなら0を返す
//       // parseInt() ... 数字に変換
//       const offset = parseInt(_page) ? (parseInt(_page) - 1) * limit : 0;
//       const result = await spotify.searchSongs(keyword, limit, offset);
//       // console.log(result); // { href: 'https://api.spotify.com/v1/search?offset=0&limit=2…uki&type=track&locale=ja,en-US;q%3D0.9,en;q%3D0.8', limit: 20, next: 'https://api.spotify.com/v1/search?offset=20&limit=…uki&type=track&locale=ja,en-US;q%3D0.9,en;q%3D0.8',... }

//       // console.log(!result.next); // false。真偽地にして反転
//       // console.log(!!result.next); // true。元に戻す
//       setPagination({
//         page: _page,
//         hasNext: !!result.next, // next ... 次のページを取得するための完全なURL
//         hasPrev: !!result.previous, // nextと同様
//       })

//       setSearchedSongs(result.items || []);
//     } catch(e) {
//       console.error("Failed to search songs", e);
//       setErrorMessage("検査に失敗しました。もう一度お試しください。");
//       setSearchedSongs([])
//     } finally {
//       // setIsLoading(false);
//       setIsLoading(prev => ({ ...prev, search: false }));
//     }
//   }

//   // ✅ 次へボタンクリック
//   const moveToNext = async () => {
//     // const nextPage = page + 1;

//     // await getSearchSongs(nextPage)
//     // setPage(nextPage);

//     if(!pagination.hasNext) return;
//     await getSearchSongs(pagination.page + 1);
//   }

//   // ✅ 前へ戻るボタンクリック
//   const moveToPrev = async () => {
//     // const prevPage = page -1;
//     // await getSearchSongs(prevPage);
//     // setPage(prevPage);
//     if(!pagination.hasPrev) return;
//     await getSearchSongs(pagination.page - 1);
//   }


//   useEffect(() => {
//     fetchPopularSongs();
//   }, []);
  
//   return (
//     <div className="flex flex-col min-h-screen bg-gray-900 text-white">
//       {
//         isLoading.popular ?
//           <div className="h-screen flex items-center justify-center">
//             <p>Loading...</p>
//           </div>
//         : (
//           <main className="flex-1 p-8 mb-20">
//             <header className="flex justify-between items-center mb-10">
//               <h1 className="text-4xl font-bold">Music App</h1>
//             </header>

//             <SearchInput 
//               keyword={ keyword }
//               handleInputChange={ handleInputChange } 
//               getSearchSongs={ getSearchSongs }
//               errorMessage={ errorMessage }
//             />

//             <section>
//               <h2 className="text-2xl font-semibold mb-5">
//                 { isSearchedResult ? "SearchResult" : "Popular Songs"}
//               </h2>

//               <SongList
//                 isLoading={ isSearchedResult ? isLoading.search : isLoading.popular }
//                 // デフォルト → 流行りの曲一覧。検索した場合は検索結果を一覧で表示
//                 songs={ isSearchedResult ? searchedSongs : popularSongs } 
//               />

//               {/* ページネーション */}
//               { 
//                 isSearchedResult &&
//                   <Pagination 
//                     moveToPrev={ pagination.hasPrev ? moveToPrev : null }
//                     moveToNext={ pagination.hasNext ? moveToNext : null } 
//                   /> 
//               }

//             </section>
//           </main>
//         )
//       }
      
//     </div>
//   );
// }
