/* Boiler plate selection */
const select = (el) => document.querySelector(el);
const create = (el) => document.createElement(el);

/* DOM references */
const SearchInput = select('#search-input');
const SearchBtn = select('#Search-btn');
const mealsContainer = select('#meals-container');
const resultHeading = select('#Result-hading');
const errorWrapper = select('#Error-container');
const errorContainer = select('#Error-container p');
const mealDetails = select('.meals-details');
const mealsContent = select('#meals-content');
const SpecificDetails = select('.specific-details');
const backBtn = select('#back-btn');

/* API config */
const BASE_URL = `https://www.themealdb.com/api/json/v1/1/`;
const SEARCH_URL = `${BASE_URL}search.php?s=`;
const LOOKUP_URL = `${BASE_URL}lookup.php?i=`;


const showError = (msg) => {
    errorContainer.textContent = msg;
    errorWrapper.classList.remove('hidden');
};

const hideError = () => errorWrapper.classList.add('hidden');
const hideSpecificDetails = () => {
    SpecificDetails.classList.add('hidden');
    SpecificDetails.innerHTML = '';
};
const ClearInput = () => SearchInput.value = '';
const clearResults = () => {
    mealsContent.innerHTML = '';
    resultHeading.textContent = '';
};
/* Event Listeners */
SearchBtn.addEventListener('click', SearchMeals);
mealsContent.addEventListener('click', HandleMealClick);
backBtn.addEventListener('click', () => {
    hideSpecificDetails();
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

document.addEventListener('DOMContentLoaded', () => {
    SearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') SearchMeals();
    });
});

/* ── Core logic ── */
async function SearchMeals() {
    const inputValue = SearchInput.value.trim(); // fix: was implicit global

    if (!inputValue) {
        showError('Please provide the value properly');
        return;
    }

    hideError();
    clearResults();
    resultHeading.innerHTML = `Searching for "${inputValue}"... <span id="loader"></span>`;
    ClearInput();

    try {
        const response = await fetch(`${SEARCH_URL}${inputValue}`);
        const data = await response.json();

        if (!data.meals) {                          // fix: was null-checked then still called .forEach
            showError(`No meal found for "${inputValue}". Try another keyword.`);
            resultHeading.textContent = '';
            hideSpecificDetails();
            return;
        }

        resultHeading.textContent = `Search results for "${inputValue}":`;
        DisplayMeals(data.meals);

    } catch (err) {
        console.error('Error fetching data:', err);
        showError('Error fetching data. Please try again.');
        resultHeading.textContent = '';
        hideSpecificDetails();
    }
}

function DisplayMeals(meals) {
    // fix: build fragment instead of repeated innerHTML += (avoids re-parsing on each iteration)
    const fragment = document.createDocumentFragment();

    meals.forEach((meal) => {
        const div = create('div');
        div.className = 'meal';
        div.dataset.mealId = meal.idMeal;
        div.innerHTML = `
      <img class="meal-img" src="${meal.strMealThumb}" alt="${meal.strMeal}">
      <div class="meal-info">
        <h3 class="meal-title">${meal.strMeal}</h3> 
        ${meal.strCategory ? `<div class="meal-category">${meal.strCategory}</div>` : ''}
      </div>
    `;
        fragment.appendChild(div);
    });

    mealsContent.appendChild(fragment);
}
function HandleMealClick(e) {
    const MealEle = (e.target.closest('.meal'));
    console.log(MealEle);
    if (!MealEle) return; // click outside a meal card
    const MealId = MealEle.getAttribute('data-meal-id');
    if (MealId) GetMealDetails(MealId);
};



async function GetMealDetails(mealId) {
    try {
        const response = await fetch(`${LOOKUP_URL}${mealId}`);
        const data = await response.json();

        if (!data.meals || !data.meals[0]) return;

        const meal = data.meals[0];

        const ingredients = [];
        for (let i = 1; i <= 20; i++) {
            if (meal[`strIngredient${i}`] && meal[`strIngredient${i}`].trim() !== '') {
                ingredients.push({
                    ingredient: meal[`strIngredient${i}`],
                    measure: meal[`strMeasure${i}`] || ''
                });
            }
        }

        SpecificDetails.innerHTML = `
  <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="meal-details-img">
  <h2 class="meal-details-title">${meal.strMeal}</h2>

  <div class="meal-details-category">
    <span>${meal.strCategory || "Uncategorized"}</span>
  </div>

  <div class="meal-details-instructions">
    <h3>Instructions</h3>
    <p>${meal.strInstructions}</p>
  </div>

  <div class="meal-details-ingredients">
    <h3>Ingredients</h3>
    <ul class="ingredients-list">
      ${ingredients
                .map(
                    (item) =>
                        `<li><i class="fas fa-check-circle"></i> ${item.measure} ${item.ingredient}</li>`
                )
                .join("")}
    </ul>
  </div>
`;
        SpecificDetails.classList.remove('hidden');
        SpecificDetails.scrollIntoView({ behavior: 'smooth' });


    } catch (error) {
        console.log(error);
    }
}
