import React from 'react';
import { useParams } from 'react-router-dom';
import "../styles/Board.css"

function Board() {
  const { boardId } = useParams();

  // Fetch board data based on boardId, display chat, etc.

  return (
    <div>
      <h1>Board: {boardId}</h1>
      {/* Display chat messages and other board details here */}
    </div>
  );
}

export default Board;
