import { useEffect, useState } from "react";

function App() {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    fetch("/api/movies")
      .then(res => res.json())
      .then(data => {
        console.log("Movies:", data);
        setMovies(data);
      })
      .catch(err => console.error("Error:", err));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>🎬 Movie List</h1>

      {movies.length === 0 ? (
        <p>Loading...</p>
      ) : (
        movies.map(movie => (
          <div key={movie.id}>
            <p>{movie.title}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default App;