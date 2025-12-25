
// 検索

// TODO
// → inputに何も入っていなければエンターを押せないか何かをする

import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export function SearchInput({ keyword, handleInputChange, getSearchSongs, errorMessage }) {
  // console.log(getSearchSongs)

  const isDisabled = keyword.trim() === "";

  const handleSubmit = (e) => {
    e.preventDefault();

    if(isDisabled) return; // 空の場合は発火させない

    getSearchSongs(); // 検索時にのみ引数なしで発火
  }

  return (
    <section className="mb-10">
      <form
        className=""
        // action="" // どのURLにデータを送信するかを指定
                     // 書く必要なし。ページ遷移は不要 
        onSubmit={ handleSubmit }
      >
        <input
          type="text"
          value={ keyword }
          className="bg-gray-700 w-1/3 p-2 rounded-l-lg focus:outline-none"
          placeholder="探したい曲を入力してください"
          onChange={ (e) => handleInputChange(e) }
        />
        <button
          type="submit"
          disabled={ isDisabled }
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r-lg"
          // onClick={() => getSearchSongs()}
        >
          <FontAwesomeIcon icon={faSearch} />
        </button>

        { errorMessage && <p className="text-red-400 mt-2">{ errorMessage }</p> }
      </form>
      
    </section>
  );
}
