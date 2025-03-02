
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useParams, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';

const API_KEY = '7fd28d8b';

const Home = () => {
    const [query, setQuery] = useState('');
    const [movies, setMovies] = useState([]);
    const [favorites, setFavorites] = useState(JSON.parse(localStorage.getItem('favorites')) || []);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchMovies("Marvel"); 
    }, []);

    const fetchMovies = (searchQuery) => {
        setLoading(true);
        setError(null);
        
        fetch(`https://www.omdbapi.com/?s=${searchQuery}&apikey=${API_KEY}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.Search) {
                    setMovies(data.Search);
                } else {
                    setMovies([]);
                    setError(data.Error || 'No movies found');
                }
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching movies:", error);
                setError('Failed to fetch movies. Please try again.');
                setLoading(false);
            });
    };

    const handleSearch = () => {
        if (query.trim().length > 0) {
            fetchMovies(query);
        }
    };

    const addToFavorites = (movie) => {
    
        if (!favorites.some(fav => fav.imdbID === movie.imdbID)) {
            const updatedFavorites = [...favorites, movie];
            setFavorites(updatedFavorites);
            localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
        }
    };

    const isFavorite = (id) => {
        return favorites.some(movie => movie.imdbID === id);
    };

    return (
        <div className='container mt-4'>
            <nav className='navbar'>
                <div className="logo-container">
                    <div className="imdb-logo">IMDb</div>
                    <h2>Clone</h2>
                </div>
                <Link to='/favorites' className='btn btn-primary'>View Favorites ({favorites.length})</Link>
            </nav>
            
            <div className='search-container'>
                <input 
                    type='text' 
                    placeholder='Search movies...' 
                    className='form-control search-input' 
                    value={query} 
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button className='btn btn-success search-button' onClick={handleSearch}>Search</button>
            </div>
            
            {loading ? (
                <div className="text-center mt-5">
                    <div className="spinner-border text-light" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : error ? (
                <div className="alert alert-warning mt-3">{error}</div>
            ) : (
                <div className='row mt-3'>
                    {movies.map(movie => (
                        <div className='col-md-3 mb-4' key={movie.imdbID}>
                            <div className='card movie-card'>
                                <img 
                                    src={movie.Poster !== 'N/A' ? movie.Poster : '/placeholder.png'} 
                                    className='card-img-top' 
                                    alt={movie.Title} 
                                    onError={(e) => {e.target.src = '/placeholder.png'}}
                                />
                                <div className='card-body'>
                                    <h5 className='card-title'>{movie.Title}</h5>
                                    <p className='card-text'>{movie.Year}</p>
                                    <div className='button-group'>
                                        <Link to={`/movie/${movie.imdbID}`} className='btn btn-info'>View Details</Link>
                                        <button 
                                            onClick={() => addToFavorites(movie)} 
                                            className={`btn ${isFavorite(movie.imdbID) ? 'btn-warning disabled' : 'btn-outline-warning'}`}
                                            disabled={isFavorite(movie.imdbID)}
                                        >
                                            {isFavorite(movie.imdbID) ? 'Added' : 'Favorite'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {!loading && !error && movies.length === 0 && (
                <div className="alert alert-info mt-3">No movies found. Try another search term.</div>
            )}
        </div>
    );
};

const Favorites = () => {
    const [favorites, setFavorites] = useState(JSON.parse(localStorage.getItem('favorites')) || []);

    const removeFromFavorites = (id) => {
        const updatedFavorites = favorites.filter(movie => movie.imdbID !== id);
        setFavorites(updatedFavorites);
        localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    };

    return (
        <div className='container mt-4'>
            <nav className='navbar'>
                <div className="logo-container">
                    <div className="imdb-logo">IMDb</div>
                    <h2>Favorites</h2>
                </div>
                <Link to='/' className='btn btn-secondary'>Back to Home</Link>
            </nav>
            
            {favorites.length === 0 ? (
                <div className="text-center mt-5">
                    <h3>No favorite movies yet</h3>
                    <p>Go back to the home page and add some movies to your favorites.</p>
                    <Link to='/' className='btn btn-primary mt-3'>Browse Movies</Link>
                </div>
            ) : (
                <div className='row'>
                    {favorites.map(movie => (
                        <div className='col-md-3 mb-4' key={movie.imdbID}>
                            <div className='card movie-card'>
                                <img 
                                    src={movie.Poster !== 'N/A' ? movie.Poster : '/placeholder.png'} 
                                    className='card-img-top' 
                                    alt={movie.Title} 
                                    onError={(e) => {e.target.src = '/placeholder.png'}}
                                />
                                <div className='card-body'>
                                    <h5 className='card-title'>{movie.Title}</h5>
                                    <p className='card-text'>{movie.Year}</p>
                                    <div className='button-group'>
                                        <Link to={`/movie/${movie.imdbID}`} className='btn btn-info'>View Details</Link>
                                        <button 
                                            onClick={() => removeFromFavorites(movie.imdbID)} 
                                            className='btn btn-danger'
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const MovieDetails = () => {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [favorites, setFavorites] = useState(JSON.parse(localStorage.getItem('favorites')) || []);
    const navigate = useNavigate();

    useEffect(() => {
        if (!id) {
            setError('Movie ID is missing');
            setLoading(false);
            return;
        }

        setLoading(true);
        fetch(`https://www.omdbapi.com/?i=${id}&apikey=${API_KEY}&plot=full`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.Response === 'False') {
                    setError(data.Error || 'Movie details not found');
                } else {
                    setMovie(data);
                    console.log('Movie details loaded:', data);
                }
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching movie details:", error);
                setError('Failed to fetch movie details. Please try again.');
                setLoading(false);
            });
    }, [id]);

    const addToFavorites = (movie) => {
        if (!isFavorite(movie.imdbID)) {
            const simplifiedMovie = {
                Title: movie.Title,
                Year: movie.Year,
                imdbID: movie.imdbID,
                Poster: movie.Poster
            };
            const updatedFavorites = [...favorites, simplifiedMovie];
            setFavorites(updatedFavorites);
            localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
        }
    };

    const removeFromFavorites = (id) => {
        const updatedFavorites = favorites.filter(movie => movie.imdbID !== id);
        setFavorites(updatedFavorites);
        localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    };

    const isFavorite = (id) => {
        return favorites.some(movie => movie.imdbID === id);
    };

    if (loading) {
        return (
            <div className='container mt-4'>
                <nav className='navbar'>
                    <div className="logo-container">
                        <div className="imdb-logo">IMDb</div>
                        <h2>Loading...</h2>
                    </div>
                    <Link to='/' className='btn btn-secondary'>Back to Home</Link>
                </nav>
                <div className="text-center mt-5">
                    <div className="spinner-border text-light" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='container mt-4'>
                <nav className='navbar'>
                    <div className="logo-container">
                        <div className="imdb-logo">IMDb</div>
                        <h2>Error</h2>
                    </div>
                    <Link to='/' className='btn btn-secondary'>Back to Home</Link>
                </nav>
                <div className="alert alert-danger mt-5">{error}</div>
            </div>
        );
    }

    if (!movie) {
        return (
            <div className='container mt-4'>
                <nav className='navbar'>
                    <div className="logo-container">
                        <div className="imdb-logo">IMDb</div>
                        <h2>Not Found</h2>
                    </div>
                    <Link to='/' className='btn btn-secondary'>Back to Home</Link>
                </nav>
                <div className="alert alert-warning mt-5">Movie details could not be loaded</div>
            </div>
        );
    }

    return (
        <div className='container mt-4 movie-details'>
            <nav className='navbar'>
                <div className="logo-container">
                    <div className="imdb-logo">IMDb</div>
                    <h2>{movie.Title}</h2>
                </div>
                <Link to='/' className='btn btn-secondary'>Back to Home</Link>
            </nav>
            
            <div className='row mt-4'>
                <div className='col-md-4 mb-4'>
                    <img 
                        src={movie.Poster !== 'N/A' ? movie.Poster : '/placeholder.png'} 
                        className='img-fluid poster-large' 
                        alt={movie.Title} 
                        onError={(e) => {e.target.src = '/placeholder.png'}}
                    />
                    <div className='mt-3 text-center'>
                        {isFavorite(movie.imdbID) ? (
                            <button 
                                onClick={() => removeFromFavorites(movie.imdbID)} 
                                className='btn btn-danger btn-lg'
                            >
                                Remove from Favorites
                            </button>
                        ) : (
                            <button 
                                onClick={() => addToFavorites(movie)} 
                                className='btn btn-warning btn-lg'
                            >
                                Add to Favorites
                            </button>
                        )}
                    </div>
                </div>
                
                <div className='col-md-8'>
                    <div className='card movie-info-card'>
                        <div className='card-body'>
                            <div className='d-flex justify-content-between align-items-center mb-3'>
                                <h3 className='mb-0'>{movie.Title} ({movie.Year})</h3>
                                <span className='badge bg-warning text-dark fs-6'>{movie.imdbRating} ⭐</span>
                            </div>
                            
                            <div className='movie-meta'>
                                <span className='badge bg-secondary me-2'>{movie.Rated}</span>
                                <span className='badge bg-secondary me-2'>{movie.Runtime}</span>
                                <span className='badge bg-secondary me-2'>Released: {movie.Released}</span>
                            </div>
                            
                            <hr />
                            
                            <div className='mt-3'>
                                <p className='fw-bold'>Genre:</p>
                                <p>{movie.Genre}</p>
                            </div>
                            
                            <div className='mt-3'>
                                <p className='fw-bold'>Plot:</p>
                                <p>{movie.Plot}</p>
                            </div>
                            
                            <div className='mt-3'>
                                <p className='fw-bold'>Director:</p>
                                <p>{movie.Director}</p>
                            </div>
                            
                            <div className='mt-3'>
                                <p className='fw-bold'>Writers:</p>
                                <p>{movie.Writer}</p>
                            </div>
                            
                            <div className='mt-3'>
                                <p className='fw-bold'>Actors:</p>
                                <p>{movie.Actors}</p>
                            </div>
                            
                            {movie.Awards !== 'N/A' && (
                                <div className='mt-3'>
                                    <p className='fw-bold'>Awards:</p>
                                    <p>{movie.Awards}</p>
                                </div>
                            )}
                            
                            {movie.Ratings && movie.Ratings.length > 0 && (
                                <div className='mt-3'>
                                    <p className='fw-bold'>Ratings:</p>
                                    <ul className='list-group'>
                                        {movie.Ratings.map((rating, index) => (
                                            <li key={index} className='list-group-item'>
                                                <strong>{rating.Source}:</strong> {rating.Value}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            
                            {movie.BoxOffice && movie.BoxOffice !== 'N/A' && (
                                <div className='mt-3'>
                                    <p className='fw-bold'>Box Office:</p>
                                    <p>{movie.BoxOffice}</p>
                                </div>
                            )}
                            
                            {movie.Production && movie.Production !== 'N/A' && (
                                <div className='mt-3'>
                                    <p className='fw-bold'>Production:</p>
                                    <p>{movie.Production}</p>
                                </div>
                            )}
                            
                            {movie.Website && movie.Website !== 'N/A' && (
                                <div className='mt-3'>
                                    <p className='fw-bold'>Website:</p>
                                    <p><a href={movie.Website} target="_blank" rel="noopener noreferrer" className="text-info">{movie.Website}</a></p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const App = () => {
    return (
        <Router>
            <div className='app-container'>
                <Routes>
                    <Route path='/' element={<Home />} />
                    <Route path='/movie/:id' element={<MovieDetails />} />
                    <Route path='/favorites' element={<Favorites />} />
                </Routes>
                <footer className='mt-5 mb-3 text-center'>
                    <p>IMDb Clone created with React - {new Date().getFullYear()}</p>
                </footer>
            </div>
        </Router>
    );
};

export default App;