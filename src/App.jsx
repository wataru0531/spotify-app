
// import './App.css'
import { useEffect, useState } from "react";

import spotify from "./lib/spotify";
import { SongList } from "./components/SongList";
import { SearchInput } from "./components/SearchInput.jsx";
import { Pagination } from "./components/Pagination.jsx";


export default function App() {
  // Reactの大原則：状態は使う一番上の親コンポーネントに置く
  const [ isLoading, setIsLoading ] = useState(true);
  const [ popularSongs, setPopularSongs ] = useState([]);
  const [ keyword, setKeyword ] = useState("");
  const [ searchedSongs, setSearchedSongs ] = useState(null);
  const isSearchedResult = searchedSongs != null; // 検索文字列があればtrue
  // console.log(isSearchedResult)
  const [ page, setPage ] = useState(1)
  const limit = 20; // 1ページあたり20件データを取得

  // ✅ 最近は流行りの曲を取得
  const fetchPopularSongs = async () => {
    try {
      setIsLoading(true);

      const result = await spotify.getPopularSongs();
      // console.log(result.items); // (98) [{…}, {…}, {…}, {…}, ...]

      // ✅ 曲の情報のみの配列にする
      const popularSongsTrack = result.items.map(item => {
        return item.track; // 👉 trackに音楽の情報が格納されている
      });
      // console.log(popularSongsTrack)

      setPopularSongs(popularSongsTrack);

    } catch(e){
      console.error("Failed to fetch popular songs", e);
    } finally {
      setIsLoading(false);
    }
  }

  // ✅ 検索文字列を取得
  const handleInputChange = (e) => {
    // console.log(e.target.value);
    setKeyword(e.target.value);
  }

  // ✅ 検索したい音楽を取得する
  const getSearchSongs = async (_page) => {
    // console.log(keyword)
    
    try {
      setIsLoading(true);

      // ✅ offset ... 何件目からデータを取るか。
      // 👉 欲しいページに対する、曲の最初の件数を取得。引数がからなら0を返す
      // parseInt() ... 数字に変換
      const offset = parseInt(_page) ? (parseInt(_page) - 1) * limit : 0;
      const result = await spotify.searchSongs(keyword, limit, offset);

      setSearchedSongs(result.items);
    } catch(e) {
      console.error("Failed to search songs", e);
    } finally {
      setIsLoading(false);
    }
  }

  // ✅ 次へボタンクリック
  const moveToNext = async () => {
    const nextPage = page + 1;

    await getSearchSongs(nextPage)
    setPage(nextPage);
  }

  // ✅ 前へ戻るボタンクリック
  const moveToPrev = async () => {
    const prevPage = page -1;
    await getSearchSongs(prevPage);
    setPage(prevPage);
  }


  useEffect(() => {
    fetchPopularSongs();
  }, []);
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      {
        isLoading ?
          <div className="h-screen flex items-center justify-center">
            <p>Loading...</p>
          </div>
        : (
          <main className="flex-1 p-8 mb-20">
            <header className="flex justify-between items-center mb-10">
              <h1 className="text-4xl font-bold">Music App</h1>
            </header>

            <SearchInput 
              handleInputChange={ handleInputChange } 
              getSearchSongs={ getSearchSongs }
            />

            <section>
              <h2 className="text-2xl font-semibold mb-5">
                { isSearchedResult ? "SearchResult" : "Popular Songs"}
              </h2>

              <SongList
                isLoading={ isLoading }
                // デフォルト → 流行りの曲一覧。検索した場合は検索結果を一覧で表示
                popularSongs={ isSearchedResult ? searchedSongs : popularSongs } 
              />

              {/* ページネーション */}
              { 
                isSearchedResult &&
                  <Pagination moveToNext={ moveToNext } moveToPrev={ moveToPrev }/> 
              }

            </section>
          </main>
        )
      }
      
    </div>
  );
}
