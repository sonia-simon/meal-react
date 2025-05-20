import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [search, setSearch] = useState('');
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);

  async function fetchMeals(query) {
    if (!query) {
      setMeals([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error(`Erreur HTTP : ${res.status}`);
      const data = await res.json();
      setMeals(data.meals || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des repas :', error);
      setMeals([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchMeals(search);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  function getIngredientsAndMeasures(meal) {
    return Array.from({ length: 20 }, (_, i) => {
      const ingredient = meal[`strIngredient${i + 1}`]?.trim();
      const measure = meal[`strMeasure${i + 1}`]?.trim();
      return ingredient && measure ? { ingredient, measure } : null;
    }).filter(Boolean);
  }

  function escapeHTML(str) {
    return str.replace(/[&<>"']/g, match => ({
      '&': '&',
      '<': '<',
      '>': '>',
      '"': '"',
      "'": '&#39;'
    }[match]));
  }

  return (
    <div className="app-container">
      <header>
        <h1>Trouve ta recette parfaite</h1>
        <p className="subtitle">Explore des plats délicieux</p>
      </header>
      <form onSubmit={e => e.preventDefault()} className="search-form">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Recherche.."
          className="search-input"
        />
      </form>
      {!search && !loading && (
        <div className="welcome-message">
          <p>Tape un plat ou un ingrédient <em>en anglais</em> pour commencer  !</p>
          <p>Essaie par exemple : <em>pizza</em>, <em>curry</em> ou <em>chocolat</em>.</p>
        </div>
      )}
      <ul id="result">
        {loading && <h2>Chargement...</h2>}
        {!loading && meals.length === 0 && search && <h2>Aucun résultat trouvé</h2>}
        {!loading && meals.slice(0, 12).map(meal => (
          <li key={meal.idMeal} className="card">
            <h2>{escapeHTML(meal.strMeal)}</h2>
            <p>{escapeHTML(meal.strArea)}</p>
            <img src={meal.strMealThumb} alt={`Photo de ${escapeHTML(meal.strMeal)}`} loading="lazy" />
            <h3>Ingrédients :</h3>
            <ul>
              {getIngredientsAndMeasures(meal).map((item, index) => (
                <li key={index}>
                  <strong>{escapeHTML(item.ingredient)}:</strong> {escapeHTML(item.measure)}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;