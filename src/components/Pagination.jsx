
// Pagination.js


export function Pagination({ moveToPrev, moveToNext }) {
  return (
    <div className="mt-8 flex justify-center">
      {/* ボタンがdisabledの時、マウスカーソルを「🚫禁止マーク」にする */}
      <button 
        disabled={!moveToPrev}
        className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={ moveToPrev }
      >
        Previous
      </button>
      <button 
        disabled={!moveToNext}
        className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed ml-4"
        onClick={ moveToNext }
      >
        Next
      </button>
    </div>
  );
}
